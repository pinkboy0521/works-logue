import { NextRequest, NextResponse } from "next/server";
import { checkUserIdAvailability } from "@/features/auth/api/register";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const result = await checkUserIdAvailability(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("User ID check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
