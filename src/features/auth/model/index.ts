/**
 * 認証機能のモデルとバリデーション
 */

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginState {
  isLoading: boolean;
  error?: string;
}

/**
 * ログイン状態の初期値
 */
export const initialLoginState: LoginState = {
  isLoading: false,
  error: undefined,
};

/**
 * ログイン情報のバリデーション
 */
export function validateLoginForm(data: Partial<LoginFormData>): string[] {
  const errors: string[] = [];

  if (!data.email) {
    errors.push("メールアドレスを入力してください");
  } else if (!isValidEmail(data.email)) {
    errors.push("有効なメールアドレスを入力してください");
  }

  if (!data.password) {
    errors.push("パスワードを入力してください");
  } else if (data.password.length < 8) {
    errors.push("パスワードは8文字以上で入力してください");
  }

  return errors;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
