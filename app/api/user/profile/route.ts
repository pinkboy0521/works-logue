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

    const result = await updateUserProfile(session.user.id, {
      displayName: body.onlyImage ? undefined : body.displayName,
      userId: body.onlyImage ? undefined : body.userId,
      bio: body.onlyImage ? undefined : body.bio,
      website: body.onlyImage ? undefined : body.website,
      location: body.onlyImage ? undefined : body.location,
      statusMessage: body.onlyImage ? undefined : body.statusMessage,
      skillIds: body.onlyImage ? undefined : body.skillIds || [],
      occupationIds: body.onlyImage ? undefined : body.occupationIds || [],
      imageUrl: body.imageUrl,
    });

    console.log("Profile update result:", result);

    if (!result.success) {
      console.error("Profile update failed:", result.error);
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
