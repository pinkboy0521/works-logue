/**
 * 記事管理機能のモデルとビジネスロジック
 */

export interface ArticleManagementState {
  isCreating: boolean;
  isDeleting: boolean;
  error?: string;
}

export const initialArticleManagementState: ArticleManagementState = {
  isCreating: false,
  isDeleting: false,
  error: undefined,
};

/**
 * 記事管理操作の結果
 */
export type ArticleManagementResult =
  | { success: true; articleId?: string }
  | { success: false; error: string };

/**
 * 記事削除確認のデータ
 */
export interface DeleteConfirmation {
  articleId: string;
  articleTitle: string;
  confirmed: boolean;
}
