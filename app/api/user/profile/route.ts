import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateUserProfile } from "@/entities/user/api/profile";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    console.log("Profile update - Session:", session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Profile update - Request body keys:", Object.keys(body));

    const result = await updateUserProfile(session.user.id, {
      displayName: body.displayName,
      userId: body.userId,
      bio: body.bio,
      website: body.website,
      location: body.location,
      statusMessage: body.statusMessage,
      skillIds: body.skillIds || [],
      occupationIds: body.occupationIds || [],
      imageUrl: body.imageUrl,
    });

    console.log("Profile update result:", result);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

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
