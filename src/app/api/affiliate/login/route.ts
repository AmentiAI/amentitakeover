import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  AFFILIATE_COOKIE,
  AFFILIATE_TTL_SECONDS,
  createAffiliateToken,
} from "@/lib/affiliate-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!slug || !code) {
    return NextResponse.json({ error: "Missing slug or code" }, { status: 400 });
  }

  const affiliate = await prisma.affiliate.findUnique({
    where: { slug },
    select: { id: true, passcode: true, active: true },
  });
  if (!affiliate || !affiliate.active || affiliate.passcode !== code) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createAffiliateToken(affiliate.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AFFILIATE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AFFILIATE_TTL_SECONDS,
  });
  return res;
}
