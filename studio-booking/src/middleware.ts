import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Admin-Routen schützen, ohne `next-auth` im Middleware-Bundle zu laden
 * (sonst zieht der Build u. a. `jose` mit Edge-Warnungen rein).
 * Die echte Session/JWT-Validierung passiert in den Server Components / Route Handlers.
 */
function hasLikelySessionCookie(req: NextRequest): boolean {
  const candidates = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  return candidates.some((name) => req.cookies.has(name));
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = /^\/admin\/login\/?$/.test(pathname);
  if (!pathname.startsWith("/admin") || isLogin) {
    return NextResponse.next();
  }
  if (!hasLikelySessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
