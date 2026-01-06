/**
 * 認証機能のモデルとバリデーション
 */

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginState {
  isLoading: boolean;
  error?: string;
}

export interface RegisterState {
  isLoading: boolean;
  error?: string;
  success?: boolean;
}

/**
 * ログイン状態の初期値
 */
export const initialLoginState: LoginState = {
  isLoading: false,
  error: undefined,
};

/**
 * 登録状態の初期値
 */
export const initialRegisterState: RegisterState = {
  isLoading: false,
  error: undefined,
  success: false,
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

/**
 * 登録情報のバリデーション
 */
export function validateRegisterForm(
  data: Partial<RegisterFormData>,
): string[] {
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
  } else if (!isStrongPassword(data.password)) {
    errors.push("パスワードは英数字を含む8文字以上で入力してください");
  }

  if (!data.confirmPassword) {
    errors.push("確認用パスワードを入力してください");
  } else if (data.password !== data.confirmPassword) {
    errors.push("パスワードが一致しません");
  }

  return errors;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isStrongPassword(password: string): boolean {
  // 最低8文字、英字と数字を含む
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  return hasLetter && hasNumber && isLongEnough;
}
