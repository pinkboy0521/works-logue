import * as bcrypt from "bcryptjs";
import { prisma } from "@/shared";
import { sendVerificationEmail } from "./email-verification";

export interface RegisterData {
  email: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * 新規ユーザー登録
 */
export async function registerUser(
  data: RegisterData,
): Promise<RegisterResult> {
  const { email, password } = data;

  try {
    // メールアドレス重複チェック（emailが存在する場合のみ）
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "このメールアドレスは既に登録されています",
      };
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザー作成（トランザクション）
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          displayName: null, // Welcomeページで設定
          userId: null, // Welcomeページで設定
          role: "USER",
          emailVerified: false, // メール認証が必要
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: email,
          access_token: hashedPassword,
        },
      });

      return user;
    });

    // 認証メールを送信
    try {
      await sendVerificationEmail(email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // メール送信失敗でも登録は成功扱い
    }

    return { success: true, userId: result.id };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "登録中にエラーが発生しました" };
  }
}

/**
 * ユーザーIDの重複チェック
 */
export async function checkUserIdAvailability(
  userId: string,
): Promise<{ available: boolean }> {
  const existingUser = await prisma.user.findFirst({
    where: { userId },
  });

  return { available: !existingUser };
}

/**
 * メールアドレスの重複チェック
 */
export async function checkEmailAvailability(
  email: string,
): Promise<{ available: boolean }> {
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  return { available: !existingUser };
}
