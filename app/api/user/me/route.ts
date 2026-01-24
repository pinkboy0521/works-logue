import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile } from "@/entities";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      console.log("No session or user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // セッションからユーザーIDを直接取得
    const userProfile = await getUserProfile(session.user.id);

    if (!userProfile) {
      // プロフィール未完了の場合は404ではなく、基本的なユーザー情報を返す
      return NextResponse.json({
        id: session.user.id,
        email: session.user.email || null,
        displayName: null,
        userId: null,
        emailVerified: session.user.emailVerified || false,
        userSkills: [],
        userOccupations: [],
        profileCompleted: false,
      });
    }

    // プロフィール完了状態を判定
    const profileCompleted = !!(userProfile.displayName && userProfile.userId);

    return NextResponse.json({
      ...userProfile,
      profileCompleted,
    });
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
