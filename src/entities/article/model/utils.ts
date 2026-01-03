import { ArticleMeta } from "./types";

/**
 * 記事の読了時間を計算
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // 日本語の場合は文字数/分
  const wordCount = content.length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * 記事のメタ情報を計算
 */
export function calculateArticleMeta(content: string): ArticleMeta {
  return {
    readingTime: calculateReadingTime(content),
    wordCount: content.length,
  };
}
