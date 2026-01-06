import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateUserProfile } from "@/entities/user/api/profile";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const result = await updateUserProfile(session.user.id, {
      displayName: body.displayName,
      userId: body.userId,
      bio: body.bio,
      website: body.website,
      location: body.location,
      statusMessage: body.statusMessage,
      skillIds: body.skillIds,
      occupationIds: body.occupationIds,
      imageUrl: body.imageUrl,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "プロフィールの更新に失敗しました",
      },
      { status: 500 },
    );
  }
}
