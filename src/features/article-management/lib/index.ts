/**
 * 記事管理のユーティリティ関数
 */

import { type Article } from "@/entities/article";

/**
 * 削除可能な記事かどうかをチェック
 */
export function canDeleteArticle(article: Article, userId: string): boolean {
  return article.userId === userId;
}

/**
 * 記事削除の確認メッセージを生成
 */
export function generateDeleteConfirmMessage(articleTitle: string): string {
  return `記事「${articleTitle}」を削除してもよろしいですか？この操作は元に戻せません。`;
}

/**
 * 記事操作エラーメッセージを整形
 */
export function formatManagementError(error: string): string {
  switch (error) {
    case "UNAUTHORIZED":
      return "この操作を行う権限がありません";
    case "NOT_FOUND":
      return "記事が見つかりません";
    case "FORBIDDEN":
      return "この記事にアクセスできません";
    default:
      return "操作に失敗しました。もう一度お試しください";
  }
}
