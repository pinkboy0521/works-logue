import { auth } from "@/auth";
import {
  getArticleLikeStats,
  getArticleBookmarkStats,
  type PublishedArticleListItem,
} from "@/entities";

export type ArticleWithReactions = PublishedArticleListItem & {
  bookmarkCount: number;
  reactions?: {
    isLoggedIn: boolean;
    isLikedByUser: boolean;
    isBookmarkedByUser: boolean;
  };
};

/**
 * 記事一覧にリアクション情報を付加
 */
export async function enrichArticlesWithReactions(
  articles: PublishedArticleListItem[],
): Promise<ArticleWithReactions[]> {
  const session = await auth();
  const userId = session?.user?.id;
  const isLoggedIn = !!userId;

  // 各記事のリアクション統計情報を並列で取得
  const articlePromises = articles.map(async (article) => {
    const [likeStats, bookmarkStats] = await Promise.all([
      getArticleLikeStats(article.id, userId),
      getArticleBookmarkStats(article.id, userId),
    ]);

    return {
      ...article,
      bookmarkCount: bookmarkStats.count,
      reactions: {
        isLoggedIn,
        isLikedByUser: likeStats.isLikedByUser,
        isBookmarkedByUser: bookmarkStats.isBookmarkedByUser,
      },
    };
  });

  return await Promise.all(articlePromises);
}
