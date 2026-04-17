import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";

const ALLOWED_OUTCOMES = new Set([
  "dialed",
  "connected",
  "voicemail",
  "no_answer",
  "bad_number",
  "not_interested",
  "note",
]);

export async function POST(req: NextRequest) {
  const affiliate = await getAffiliateFromCookies();
  if (!affiliate) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const scrapedBusinessId =
    typeof body?.scrapedBusinessId === "string" ? body.scrapedBusinessId : "";
  const outcomeRaw = typeof body?.outcome === "string" ? body.outcome : "dialed";
  const outcome = ALLOWED_OUTCOMES.has(outcomeRaw) ? outcomeRaw : "dialed";
  const notes =
    typeof body?.notes === "string" ? body.notes.slice(0, 500) : null;

  if (!scrapedBusinessId) {
    return NextResponse.json({ error: "Missing scrapedBusinessId" }, { status: 400 });
  }

  const biz = await prisma.scrapedBusiness.findUnique({
    where: { id: scrapedBusinessId },
    select: { id: true, phone: true },
  });
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const call = await prisma.affiliateCall.create({
    data: {
      affiliateId: affiliate.id,
      scrapedBusinessId: biz.id,
      phone: biz.phone,
      outcome,
      notes,
    },
    select: { id: true, createdAt: true, outcome: true },
  });

  return NextResponse.json({ ok: true, call });
}
