import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("jwt_refresh")?.value;
  const path = request.nextUrl.pathname;

  const isProtectedRoute =
    path.startsWith("/admin") || path.startsWith("/user");
  const isAuthRoute = path === "/login" || path === "/register";
  const isRootRoute = path === "/";

  if ((isProtectedRoute || isRootRoute) && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && refreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/user/:path*", "/login", "/register"],
};
