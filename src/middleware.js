import { NextResponse } from "next/server";

function decodeJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("bajaj_token")?.value;
  const payload = token ? decodeJwt(token) : null;
  const isOperator = payload?.roleCode === "OPERATOR";

  // Require authentication for all protected routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/operator")) {
    if (!token || !payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Strict RBAC boundary: Operators cannot access /admin console routes
  if (pathname.startsWith("/admin") && isOperator) {
    return NextResponse.redirect(new URL("/operator", request.url));
  }

  // Route / and /login to role-appropriate home
  if (pathname === "/" || pathname === "/login") {
    if (token && payload) {
      if (isOperator) {
        return NextResponse.redirect(new URL("/operator", request.url));
      }
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/operator/:path*", "/login", "/"],
};
