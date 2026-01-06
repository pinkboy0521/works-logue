import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/shared/lib/prisma";
import { sendEmail, generateEmailVerificationHtml } from "@/shared/lib/email";

/**
 * メール認証トークンを生成・保存
 */
export async function generateEmailVerificationToken(
  email: string,
): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

  // まずユーザーを検索
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    throw new Error("ユーザーが見つかりません");
  }

  // idを使用してユーザーを更新
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: expiresAt,
    },
  });

  return token;
}

/**
 * メール認証トークンを検証・処理
 */
export async function verifyEmailToken(
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: {
        gt: new Date(), // 有効期限内
      },
    },
  });

  if (!user) {
    return { success: false, error: "トークンが無効または期限切れです" };
  }

  // メール認証を完了
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
  });

  return { success: true };
}

/**
 * 認証メールを送信
 */
export async function sendVerificationEmail(
  email: string,
  name?: string,
): Promise<void> {
  const token = await generateEmailVerificationToken(email);
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  const html = generateEmailVerificationHtml(verificationUrl, name);

  await sendEmail({
    to: email,
    subject: "Works Logue - メールアドレス認証",
    html,
  });
}

/**
 * 認証メールの再送信
 */
export async function resendVerificationEmail(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        emailVerified: false,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "ユーザーが見つからないか、既に認証済みです",
      };
    }

    await sendVerificationEmail(email, user.displayName || undefined);
    return { success: true };
  } catch (error) {
    console.error("Failed to resend verification email:", error);
    return { success: false, error: "メール送信に失敗しました" };
  }
}
