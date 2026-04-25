import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Routes that stay public without a session. /p/* is critical — outreach
// emails send prospects a live mockup URL, they must not hit a login wall.
const PUBLIC_PREFIXES = [
  "/login",
  "/p/",
  "/a/",
  "/api/auth/",
  "/api/affiliate/",
  "/api/generated-image/",
  "/_next/",
  "/favicon.ico",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname === p.replace(/\/$/, "") || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname + (req.nextUrl.search || ""));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static asset file extensions.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff2?|ttf)).*)",
  ],
};
