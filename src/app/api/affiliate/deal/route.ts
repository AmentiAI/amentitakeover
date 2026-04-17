import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";

export async function POST(req: NextRequest) {
  const affiliate = await getAffiliateFromCookies();
  if (!affiliate) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const scrapedBusinessId =
    typeof body?.scrapedBusinessId === "string" ? body.scrapedBusinessId : "";
  const dealValueNum = Number(body?.dealValue);
  const notes =
    typeof body?.notes === "string" ? body.notes.slice(0, 500) : null;

  if (!scrapedBusinessId) {
    return NextResponse.json({ error: "Missing scrapedBusinessId" }, { status: 400 });
  }
  if (!Number.isFinite(dealValueNum) || dealValueNum <= 0) {
    return NextResponse.json({ error: "Invalid dealValue" }, { status: 400 });
  }

  const biz = await prisma.scrapedBusiness.findUnique({
    where: { id: scrapedBusinessId },
    select: { id: true, name: true },
  });
  if (!biz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const commissionPct = affiliate.commissionPct;
  const commissionDue = +((dealValueNum * commissionPct) / 100).toFixed(2);

  const deal = await prisma.affiliateDeal.create({
    data: {
      affiliateId: affiliate.id,
      scrapedBusinessId: biz.id,
      dealValue: dealValueNum,
      commissionPct,
      commissionDue,
      notes,
    },
    select: {
      id: true,
      createdAt: true,
      dealValue: true,
      commissionPct: true,
      commissionDue: true,
    },
  });

  return NextResponse.json({ ok: true, deal });
}
