import type { ArticleBookmarkStats } from "./model";
import { getArticleBookmarkCount, isArticleBookmarkedByUser } from "./api";

/**
 * 記事のブックマーク統計情報を取得
 */
export async function getArticleBookmarkStats(
  articleId: string,
  userId?: string,
): Promise<ArticleBookmarkStats> {
  const [count, isBookmarkedByUser] = await Promise.all([
    getArticleBookmarkCount(articleId),
    userId
      ? isArticleBookmarkedByUser(articleId, userId)
      : Promise.resolve(false),
  ]);

  return {
    count,
    isBookmarkedByUser,
  };
}

/**
 * ブックマークの操作が有効かチェック
 */
export function isBookmarkOperationValid(currentUserId?: string): {
  valid: boolean;
  reason?: string;
} {
  if (!currentUserId) {
    return { valid: false, reason: "ログインが必要です" };
  }

  // 自分の記事でもブックマーク可能
  return { valid: true };
}

/**
 * ブックマーク数のフォーマット
 */
export function formatBookmarkCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
