import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (
      !session?.user?.email ||
      session.user.email !== "pinkboy0521@gmail.com"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const debugInfo = {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      hasUploadPreset: !!process.env.CLOUDINARY_UPLOAD_PRESET,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
        ? `${process.env.CLOUDINARY_CLOUD_NAME.slice(0, 3)}...`
        : "undefined",
      apiKey: process.env.CLOUDINARY_API_KEY
        ? `${process.env.CLOUDINARY_API_KEY.slice(0, 3)}...`
        : "undefined",
    };

    return NextResponse.json(debugInfo);
  } catch (error: unknown) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
