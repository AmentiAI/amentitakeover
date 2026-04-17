import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSiteImages, getSiteImageSet } from "@/lib/site-image-generator";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const b = await prisma.scrapedBusiness.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!b.audited) {
    return NextResponse.json(
      { error: "Run Enrich first — we need the site palette to style images." },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const force = body?.force === true;

  try {
    const set = await generateSiteImages(id, { force });
    return NextResponse.json({ ok: true, ...set });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const set = await getSiteImageSet(id);
  return NextResponse.json(set);
}
