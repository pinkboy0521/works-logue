import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // NextAuth が使う画面URLの指定
  pages: {
    signIn: "/login",
  },
  // リクエストを通していいかどうか
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedin = !!auth?.user;
      // ログイン済みでログイン画面にアクセスしようとした場合、トップにリダイレクト
      if (isLoggedin && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
  },
  // 認証方法
  providers: [],
} satisfies NextAuthConfig;
