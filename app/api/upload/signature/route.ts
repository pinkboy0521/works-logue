import { NextResponse } from "next/server";
import { auth } from "@/auth";

// プロフィール画像アップロード関数を動的にインポート
async function generateProfileUploadSignature(userId: string) {
  const { generateProfileUploadSignature: profileFunction } =
    await import("@/features/profile");
  return profileFunction(userId);
}

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signature = await generateProfileUploadSignature(session.user.id);

    return NextResponse.json(signature);
  } catch (error: unknown) {
    console.error("Upload signature generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
