import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // NextAuth が使う画面URLの指定
  pages: {
    signIn: "/login",
  },
  // リクエストを通していいかどうか
  callbacks: {
    async authorized({ auth, request }) {
      const isLoggedin = !!auth?.user;
      const isEmailVerified = auth?.user?.emailVerified;
      const pathname = request.nextUrl.pathname;

      // ログイン済みユーザーがログイン画面にアクセスした場合、ルートにリダイレクト
      if (isLoggedin && pathname === "/login") {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      // 認証関連ページ、API、静的ファイルは認証チェック不要
      const excludePaths = [
        "/login",
        "/signup",
        "/verify-email",
        "/auth/verify-email",
        "/api/",
        "/auth/",
        "/_next/",
        "/favicon.ico",
      ];
      if (excludePaths.some((path) => pathname.startsWith(path))) {
        return true;
      }

      // welcomeページ自体へのアクセスは許可（無限リダイレクト防止）
      if (pathname === "/welcome") {
        return true;
      }

      // 未認証ユーザーは基本的にアクセス許可（publicページとして扱う）
      if (!isLoggedin) {
        return true;
      }

      // 一時的にメール認証チェックを無効化（デバッグ用）
      console.log(
        "Auth check - User:",
        auth?.user?.id,
        "EmailVerified:",
        isEmailVerified,
      );

      // プロフィール完了チェック（認証済みユーザーのみ）
      if (isLoggedin) {
        try {
          console.log("Checking profile completion for path:", pathname);

          const response = await fetch(
            `${request.nextUrl.origin}/api/user/me`,
            {
              headers: {
                Cookie: request.headers.get("cookie") || "",
              },
            },
          );

          if (response.ok) {
            const user = await response.json();

            // displayNameまたはuserIdが未設定の場合はWelcomeページにリダイレクト
            if (!user.displayName || !user.userId) {
              console.log("Profile incomplete, redirecting to welcome page:", {
                path: pathname,
                displayName: user.displayName,
                userId: user.userId,
                redirecting: true,
              });
              return Response.redirect(new URL("/welcome", request.nextUrl));
            } else {
              console.log("Profile complete, allowing access:", {
                path: pathname,
                displayName: user.displayName,
                userId: user.userId,
              });
            }
          } else {
            console.log("API response not ok:", response.status);
            // API エラーの場合はWelcomeページにリダイレクト
            return Response.redirect(new URL("/welcome", request.nextUrl));
          }
        } catch (error) {
          console.error("Profile check error:", error);
          // エラーが発生した場合はWelcomeページにリダイレクト
          return Response.redirect(new URL("/welcome", request.nextUrl));
        }
      }

      return true;
    },
  },
  // 認証方法
  providers: [],
} satisfies NextAuthConfig;
