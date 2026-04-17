import { NextRequest, NextResponse } from "next/server";
import { generateSiteImages } from "@/lib/site-image-generator";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";

  try {
    const set = await generateSiteImages(id, { force });
    return NextResponse.json({ ok: true, ...set });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
