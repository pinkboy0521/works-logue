import { ArticleDetail } from "@/widgets";
import {
  getArticleById,
  getRelatedArticles,
  calculateArticleMeta,
} from "@/entities";
import { CommentSectionWrapper, getArticleReactionStats } from "@/features";
import { auth } from "@/auth";
import { prisma } from "@/shared";
import { notFound } from "next/navigation";
import { ViewCountTracker } from "./ViewCountTracker";

// Helper function to check admin role
async function checkUserRole(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}

interface ArticleDetailPageProps {
  params: {
    id: string;
    userId: string;
  };
}

export async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const article = await getArticleById(params.id);

  if (!article) {
    notFound();
  }

  // Get user session for comment functionality
  const session = await auth();
  const currentUserId = session?.user?.id;
  const isAdmin =
    session?.user && session.user.id && (await checkUserRole(session.user.id));

  // 記事詳細ページ特有のロジック
  const getContentText = (content: unknown): string => {
    if (Array.isArray(content)) {
      // BlockNote JSON形式の場合
      return content
        .map((block: unknown) => {
          if (typeof block === "object" && block !== null) {
            const typedBlock = block as { content?: { text?: string }[] };
            if (typedBlock.content && Array.isArray(typedBlock.content)) {
              return typedBlock.content.map((c) => c.text || "").join("");
            }
          }
          return "";
        })
        .join(" ");
    } else if (typeof content === "string") {
      // Markdown形式の場合（後方互換性）
      return content;
    }
    return "";
  };

  const [relatedArticles, meta, reactionStats] = await Promise.all([
    getRelatedArticles(article.id, article.topicId, 3),
    Promise.resolve(calculateArticleMeta(getContentText(article.content))),
    getArticleReactionStats(article.id),
  ]);

  return (
    <div className="space-y-8">
      {/* 閲覧数の増加を初回のみ実行するClient Component */}
      <ViewCountTracker articleId={article.id} />

      <ArticleDetail
        article={article}
        relatedArticles={relatedArticles}
        meta={meta}
        reactions={{
          isLoggedIn: reactionStats.isLoggedIn,
          isLikedByUser: reactionStats.like.isLikedByUser,
          isBookmarkedByUser: reactionStats.bookmark.isBookmarkedByUser,
        }}
      />

      {/* Comment Section */}
      <CommentSectionWrapper
        articleId={article.id}
        currentUserId={currentUserId}
        isAdmin={Boolean(isAdmin)}
      />
    </div>
  );
}
