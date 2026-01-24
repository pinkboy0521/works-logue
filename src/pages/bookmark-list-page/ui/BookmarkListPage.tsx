import { auth } from "@/auth";
import {
  getUserArticleBookmarks,
  getArticleById,
  type PublishedArticleListItem,
} from "@/entities";
import { ArticleList } from "@/widgets";
import { enrichArticlesWithReactions } from "@/features";
import { Bookmark } from "lucide-react";

// ArticleWithDetails を PublishedArticleListItem に変換するヘルパー関数
function convertToPublishedArticle(
  article: NonNullable<Awaited<ReturnType<typeof getArticleById>>>,
): PublishedArticleListItem | null {
  if (!article.publishedAt || !article.topic) return null;

  return {
    id: article.id,
    title: article.title,
    content: article.content,
    topImageUrl: article.topImageUrl,
    publishedAt: article.publishedAt,
    viewCount: article.viewCount,
    likeCount: article.likeCount,
    bookmarkCount: article.bookmarkCount,
    user: {
      id: article.user.id,
      displayName: article.user.displayName,
      image: article.user.image,
      userId: article.user.userId,
    },
    topic: {
      id: article.topic.id,
      name: article.topic.name,
    },
    tags: article.tags,
  };
}

export async function BookmarkListPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">ログインが必要です</p>
      </div>
    );
  }

  let bookmarkedArticles: Awaited<
    ReturnType<typeof enrichArticlesWithReactions>
  >;
  try {
    const bookmarks = await getUserArticleBookmarks(session.user.id, 1, 50);
    // ブックマークした記事のIDを取得し、完全な記事データを取得
    const articlePromises = bookmarks.map((bookmark) =>
      getArticleById(bookmark.articleId),
    );
    const articles = await Promise.all(articlePromises);
    // nullを除外し、公開済み記事のみをフィルタリング・変換
    const publishedArticles = articles
      .filter(
        (article): article is NonNullable<typeof article> => article !== null,
      )
      .map(convertToPublishedArticle)
      .filter(
        (article): article is PublishedArticleListItem => article !== null,
      );
    // リアクション情報を追加
    bookmarkedArticles = await enrichArticlesWithReactions(publishedArticles);
  } catch (error) {
    console.error("Failed to fetch bookmarked articles:", error);
    bookmarkedArticles = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bookmark className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">ブックマークした記事</h1>
      </div>

      {bookmarkedArticles.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            ブックマークした記事がありません
          </h3>
          <p className="text-muted-foreground">
            気に入った記事をブックマークして、後で読み返しましょう。
          </p>
        </div>
      ) : (
        <ArticleList articles={bookmarkedArticles} />
      )}
    </div>
  );
}
