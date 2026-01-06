import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/entities/user/api/profile";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const userProfile = await getUserProfile(userId);

    if (!userProfile) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json(
      { error: "プロフィールの取得に失敗しました" },
      { status: 500 },
    );
  }
}
