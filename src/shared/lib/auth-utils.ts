import { auth } from "@/auth";
import { getUserProfile } from "@/entities/user/api/profile";

/**
 * 現在のユーザーが管理者かどうかをチェック
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return false;
    }

    // セッションからユーザーIDを直接取得
    const userProfile = await getUserProfile(session.user.id);
    return userProfile?.role === "ADMIN";
  } catch (error) {
    console.error("Failed to check admin status:", error);
    return false;
  }
}

/**
 * 管理者権限を要求するAPI保護関数
 */
export async function requireAdmin() {
  const adminStatus = await isAdmin();

  if (!adminStatus) {
    throw new Error("Admin access required");
  }

  return adminStatus;
}
