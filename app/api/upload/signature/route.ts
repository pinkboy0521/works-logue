import { NextResponse } from "next/server";
import { generateProfileUploadSignature } from "@/features/profile";
import { auth } from "@/auth";

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
