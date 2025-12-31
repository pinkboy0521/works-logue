import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.includes(".")) {
    console.log("middleware test");
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/blog/:path*"],
};
