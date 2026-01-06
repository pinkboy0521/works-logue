import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile } from "@/entities/user/api/profile";

export async function GET() {
  try {
    console.log("API Route called: /api/user/me");

    const session = await auth();
    console.log("Session:", session?.user?.id);

    if (!session?.user?.id) {
      console.log("No session or user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // セッションからユーザーIDを直接取得
    const userProfile = await getUserProfile(session.user.id);

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    // デバッグ用：返すユーザープロフィールをログ出力
    console.log("Returning user profile:", {
      id: userProfile.id,
      email: userProfile.email,
      displayName: userProfile.displayName,
      userId: userProfile.userId,
      emailVerified: userProfile.emailVerified,
    });

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
