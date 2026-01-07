import { ArticleDetail } from "@/widgets";
import {
  getArticleById,
  incrementArticleViews,
  getRelatedArticles,
  calculateArticleMeta,
} from "@/entities";
import { notFound } from "next/navigation";

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

  const [relatedArticles, meta] = await Promise.all([
    getRelatedArticles(article.id, article.topicId, 3),
    Promise.resolve(calculateArticleMeta(getContentText(article.content))),
  ]);

  // 閲覧数を非同期で増加（エラーでもページ表示は継続）
  incrementArticleViews(article.id).catch(console.error);

  return (
    <ArticleDetail
      article={article}
      relatedArticles={relatedArticles}
      meta={meta}
    />
  );
}
