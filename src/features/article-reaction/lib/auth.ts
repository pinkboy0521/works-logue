import { auth } from "@/auth";

/**
 * 認証状態をチェック
 */
export async function checkAuthStatus() {
  const session = await auth();
  return {
    isLoggedIn: !!session?.user?.id,
    userId: session?.user?.id,
  };
}

/**
 * 認証が必要な操作かチェック
 */
export function requiresAuthentication(_action: "like" | "bookmark"): boolean {
  // アクション名は将来のログ用
  // すべてのリアクション操作にログインが必要
  return true;
}
