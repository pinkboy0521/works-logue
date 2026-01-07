import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile } from "@/entities";

export async function GET() {
  try {
    console.log("API Route called: /api/user/me");

    const session = await auth();
    console.log("Session full object:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      console.log("No session or user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Attempting to get user profile for user ID:", session.user.id);

    // セッションからユーザーIDを直接取得
    const userProfile = await getUserProfile(session.user.id);
    console.log(
      "Raw user profile result:",
      userProfile ? "Found" : "Not found",
    );

    if (!userProfile) {
      console.log(
        "User profile not found in database for ID:",
        session.user.id,
      );
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

    // デバッグ用：返すユーザープロフィールをログ出力
    console.log("Returning user profile:", {
      id: userProfile.id,
      email: userProfile.email,
      displayName: userProfile.displayName,
      userId: userProfile.userId,
      emailVerified: userProfile.emailVerified,
    });

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
