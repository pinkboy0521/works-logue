import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedin = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/manage");
      if (isOnDashboard) {
        if (isLoggedin) return true;
        return Response.redirect(new URL("/login", nextUrl));
      } else if (isLoggedin && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
