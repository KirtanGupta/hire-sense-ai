import { NextResponse } from "next/server";
import { verifyToken } from "./src/lib/auth";

const protectedRoutes = [
  "/dashboard",
  "/dashboard/profile",
  "/dashboard/interview",
  "/dashboard/history",
  "/dashboard/resume",
];

const adminRoute = "/admin";

function getTokenFromCookie(request) {
  const cookie = request.cookies.get("token");
  return cookie?.value || null;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromCookie(request);

  if (pathname.startsWith(adminRoute)) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const payload = verifyToken(token);
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};
