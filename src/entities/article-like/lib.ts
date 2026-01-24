import type { ArticleLikeStats } from "./model";
import { getArticleLikeCount, isArticleLikedByUser } from "./api";

/**
 * 記事のいいね統計情報を取得
 */
export async function getArticleLikeStats(
  articleId: string,
  userId?: string,
): Promise<ArticleLikeStats> {
  const [count, isLikedByUser] = await Promise.all([
    getArticleLikeCount(articleId),
    userId ? isArticleLikedByUser(articleId, userId) : Promise.resolve(false),
  ]);

  return {
    count,
    isLikedByUser,
  };
}

/**
 * いいねの操作が有効かチェック
 */
export function isLikeOperationValid(
  currentUserId?: string,
  _articleAuthorId?: string, // 作者IDは現在未使用
): { valid: boolean; reason?: string } {
  if (!currentUserId) {
    return { valid: false, reason: "ログインが必要です" };
  }

  // 自分の記事にはいいねできないルール（オプション）
  // if (currentUserId === articleAuthorId) {
  //   return { valid: false, reason: "自分の記事にはいいねできません" };
  // }

  return { valid: true };
}

/**
 * いいね数のフォーマット
 */
export function formatLikeCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
