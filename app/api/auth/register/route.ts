import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/features/auth/api";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await registerUser(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { success: false, error: "登録中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
