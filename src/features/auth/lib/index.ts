/**
 * 認証関連のユーティリティ関数
 * モデルに書くほど重くないビジネスロジック
 */

/**
 * パスワード強度をチェック
 */
export function checkPasswordStrength(
  password: string
): "weak" | "medium" | "strong" {
  if (password.length < 8) return "weak";

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaCount = [
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  ].filter(Boolean).length;

  if (criteriaCount >= 3) return "strong";
  if (criteriaCount >= 2) return "medium";
  return "weak";
}

/**
 * ログインエラーメッセージを整形
 */
export function formatAuthError(error: string): string {
  switch (error) {
    case "CredentialsSignin":
      return "メールアドレスまたはパスワードが間違っています";
    case "EmailNotVerified":
      return "メールアドレスが確認されていません";
    case "AccountNotFound":
      return "アカウントが見つかりません";
    default:
      return "ログインに失敗しました。もう一度お試しください";
  }
}

/**
 * セッションの有効性をチェック
 */
export function isSessionValid(session: unknown): boolean {
  return !!(
    session &&
    typeof session === "object" &&
    "user" in session &&
    session.user &&
    typeof session.user === "object" &&
    "id" in session.user &&
    "email" in session.user
  );
}
