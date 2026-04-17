import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  AFFILIATE_COOKIE,
  AFFILIATE_TTL_SECONDS,
  createAffiliateToken,
} from "@/lib/affiliate-auth";

/**
 * Code-only affiliate login. The /login page uses this so an affiliate
 * only needs their passcode — no slug to remember. Passcodes are 8 chars
 * from a 30-char alphabet (~6.5e11 values), so collision is a non-issue.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const matches = await prisma.affiliate.findMany({
    where: { passcode: code, active: true },
    select: { id: true, slug: true },
    take: 2,
  });
  if (matches.length !== 1) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }
  const affiliate = matches[0];

  const token = await createAffiliateToken(affiliate.id);
  const res = NextResponse.json({ ok: true, slug: affiliate.slug });
  res.cookies.set(AFFILIATE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AFFILIATE_TTL_SECONDS,
  });
  return res;
}
