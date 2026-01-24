import { auth } from "@/auth";
import { getArticleLikeStats, getArticleBookmarkStats } from "@/entities";

/**
 * 記事のリアクション統計情報を取得（認証状態込み）
 */
export async function getArticleReactionStats(articleId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  const [likeStats, bookmarkStats] = await Promise.all([
    getArticleLikeStats(articleId, userId),
    getArticleBookmarkStats(articleId, userId),
  ]);

  return {
    isLoggedIn: !!userId,
    like: likeStats,
    bookmark: bookmarkStats,
  };
}
