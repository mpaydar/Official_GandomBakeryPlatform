import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdmin = pathname.startsWith("/admin");
  const isPublicAdmin =
    pathname === "/admin/login" ||
    pathname === "/admin/setup" ||
    pathname === "/admin/forgot-password";

  if (!isAdmin || isPublicAdmin) return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};