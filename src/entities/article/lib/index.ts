import { type Article } from "../model";
import { ArticleStatus } from "@prisma/client";

/**
 * 記事関連の計算ロジック・変換処理
 * ストレージに依存しないエンティティ操作関数
 */

/**
 * 記事の文字数を計算
 */
export function calculateArticleLength(content: string): number {
  return content.length;
}

/**
 * 記事の推定読み取り時間を計算（分）
 */
export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200; // 平均読み取り速度
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * 記事ステータスの表示名を取得
 */
export function getStatusDisplayName(status: ArticleStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "公開";
    case "DRAFT":
      return "下書き";
    default:
      return "不明";
  }
}

/**
 * 記事が公開可能かチェック
 */
export function canPublishArticle(article: Partial<Article>): boolean {
  return !!(
    article.title &&
    article.content &&
    article.title.length > 0 &&
    article.content.length > 0
  );
}

/**
 * 記事のサマリーを生成
 */
export function generateArticleSummary(
  content: string,
  maxLength = 150,
): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + "...";
}
