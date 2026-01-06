import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth(async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  console.log("Middleware called for path:", pathname);

  // 認証関連ページ、API、静的ファイルは除外
  const excludePaths = [
    "/login",
    "/signup",
    "/verify-email",
    "/api/",
    "/auth/",
    "/_next/",
    "/favicon.ico",
  ];
  if (excludePaths.some((path) => pathname.startsWith(path))) {
    console.log("Path excluded from middleware:", pathname);
    return NextResponse.next();
  }

  // Welcomeページは除外（プロフィール設定後の無限ループを防ぐ）
  if (pathname === "/welcome") {
    console.log("Welcome page accessed, skipping middleware");
    return NextResponse.next();
  }

  // セッション情報を取得
  const session = request.auth;
  console.log(
    "Session in middleware:",
    session?.user?.id ? "found" : "not found",
  );

  // 未認証の場合はログインページにリダイレクト
  if (!session?.user?.id) {
    console.log("No session, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // プロフィール完了チェック（認証済みユーザーのみ）
  try {
    console.log("Fetching user profile for middleware check");
    const response = await fetch(`${request.nextUrl.origin}/api/user/me`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    console.log("Profile fetch response status:", response.status);

    if (response.ok) {
      const user = await response.json();
      console.log("User profile in middleware:", {
        displayName: user.displayName,
        userId: user.userId,
        emailVerified: user.emailVerified,
      });

      // displayNameまたはuserIdが未設定の場合はWelcomeページにリダイレクト
      if (!user.displayName || !user.userId) {
        console.log("Profile incomplete, redirecting to welcome page:", {
          path: pathname,
          displayName: user.displayName,
          userId: user.userId,
        });
        return NextResponse.redirect(new URL("/welcome", request.url));
      }

      console.log("Profile complete, allowing access to:", pathname);
    } else {
      console.log("Failed to fetch user profile, status:", response.status);
      // プロフィール取得に失敗した場合もWelcomeページにリダイレクト
      return NextResponse.redirect(new URL("/welcome", request.url));
    }
  } catch (error) {
    console.error("Profile check error:", error);
    // エラーが発生した場合はWelcomeページにリダイレクト（安全側に倒す）
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  return NextResponse.next();
});

export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
