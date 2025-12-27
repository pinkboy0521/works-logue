import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(request: NextRequest) {
  try {
    // v4正式版でセッション取得
    const session = await auth0.getSession();
    
    console.log("Session:", session); // デバッグログ
    
    if (!session) {
      return NextResponse.json(
        { error: "No session found" },
        { status: 401 }
      );
    }

    // セッションから直接アクセストークンを取得
    // v4では session.tokenSet.accessToken でアクセス可能
    const accessToken = session.tokenSet?.accessToken;
    
    console.log("Access Token:", accessToken ? "Found" : "Not found"); // デバッグログ

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token not available" },
        { status: 401 }
      );
    }

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("Failed to get access token:", error);
    return NextResponse.json(
      { error: "Failed to get access token" },
      { status: 500 }
    );
  }
}