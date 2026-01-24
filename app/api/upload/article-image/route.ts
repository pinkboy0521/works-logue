import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Cloudinary関数を動的にインポート（サーバーサイドでのみ）
async function generateArticleImageUploadSignature(userId: string) {
  const { generateArticleImageUploadSignature: cloudinaryFunction } =
    await import("@/shared/lib/cloudinary");
  return cloudinaryFunction(userId);
}

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      "Generating article image upload signature for user:",
      session.user.id,
    );
    const signature = await generateArticleImageUploadSignature(
      session.user.id,
    );

    console.log("Generated signature response:", {
      hasSignature: !!signature.signature,
      timestamp: signature.timestamp,
      cloudName: signature.cloudName,
      publicId: signature.publicId,
    });

    return NextResponse.json({
      ...signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    });
  } catch (error: unknown) {
    console.error("Article image upload signature generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
