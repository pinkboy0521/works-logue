import { type User } from "../model";

/**
 * ユーザー関連の計算ロジック・変換処理
 * ストレージに依存しないエンティティ操作関数
 */

/**
 * ユーザー名の表示用フォーマット
 */
export function formatUserDisplayName(
  user: Pick<User, "name" | "email">
): string {
  return user.name || user.email || "Unknown User";
}

/**
 * ユーザーのイニシャルを生成
 */
export function generateUserInitials(name?: string | null): string {
  if (!name) return "U";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * ユーザーが有効かチェック
 */
export function isValidUser(user: Partial<User>): boolean {
  return !!(user.email && user.name);
}

/**
 * ユーザー権限のチェック
 */
export function canUserEdit(userId: string, targetUserId: string): boolean {
  return userId === targetUserId;
}
