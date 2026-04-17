import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";

function str(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  const affiliate = await getAffiliateFromCookies();
  if (!affiliate) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = str(body?.name, 200);
  const phone = str(body?.phone, 40);
  const website = str(body?.website, 300);
  const email = str(body?.email, 200);
  const industry = str(body?.industry, 100);
  const city = str(body?.city, 100);
  const state = str(body?.state, 100);
  const notes = str(body?.notes, 500);
  const dealValueNum = Number(body?.dealValue);

  if (!name) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }
  if (!Number.isFinite(dealValueNum) || dealValueNum <= 0) {
    return NextResponse.json({ error: "Invalid dealValue" }, { status: 400 });
  }

  const commissionPct = affiliate.commissionPct;
  const commissionDue = +((dealValueNum * commissionPct) / 100).toFixed(2);

  const { deal } = await prisma.$transaction(async (tx) => {
    const biz = await tx.scrapedBusiness.create({
      data: {
        source: "manual",
        name,
        phone,
        website,
        email,
        industry,
        city,
        state,
        hasWebsite: !!website,
        inSales: true,
        closedWon: true,
      },
      select: { id: true, name: true },
    });

    const deal = await tx.affiliateDeal.create({
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

    return { biz, deal };
  });

  return NextResponse.json({ ok: true, deal });
}
