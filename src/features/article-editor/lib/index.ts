/**
 * 記事編集機能のユーティリティ関数
 */

/**
 * マークダウンテキストをプレーンテキストに変換
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, "") // ヘッダー
    .replace(/\*\*(.*?)\*\*/g, "$1") // ボールド
    .replace(/\*(.*?)\*/g, "$1") // イタリック
    .replace(/`(.*?)`/g, "$1") // インラインコード
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // リンク
    .replace(/!\[(.*?)\]\(.*?\)/g, "$1") // 画像
    .trim();
}

/**
 * 記事の自動保存間隔（ミリ秒）
 */
export const AUTO_SAVE_INTERVAL = 30000; // 30秒

/**
 * 記事のバックアップキーを生成
 */
export function generateBackupKey(articleId?: string): string {
  const timestamp = Date.now();
  return `article_backup_${articleId || "new"}_${timestamp}`;
}

/**
 * 記事内容の差分チェック
 */
export function hasContentChanged(
  original: { title: string; content: string },
  current: { title: string; content: string },
): boolean {
  return (
    original.title !== current.title || original.content !== current.content
  );
}
