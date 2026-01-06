import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/features/auth/api";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const result = await verifyEmailToken(token);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
