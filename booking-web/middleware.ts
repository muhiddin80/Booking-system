import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/register"];

  const protectedRoutes = ["/events", "/bookings"];

  const apiRoutes = ["/api"];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isApiRoute = apiRoutes.some((route) => pathname.startsWith(route));

  if (isApiRoute || pathname.includes(".") || pathname.includes("_next")) {
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    const response = NextResponse.next();
    response.headers.set("x-protected-route", "true");
    return response;
  }

  if (isPublicRoute) {
    const response = NextResponse.next();
    response.headers.set("x-auth-route", "true");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
