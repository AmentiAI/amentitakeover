import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// One-shot retro-fill route. The semantics of `siteGenerated` changed: it
// used to mean "AI imagery + LLM rebuild has completed" but now means "we
// have enough scraped data to render the on-the-fly demo." Every row that
// was successfully scraped (audited === true) before this change still has
// siteGenerated === false, which makes the outreach queue/templates pages
// hide demos that are perfectly viewable. POST this once to flip those.
export async function POST() {
  const result = await prisma.scrapedBusiness.updateMany({
    where: { audited: true, siteGenerated: false },
    data: { siteGenerated: true },
  });
  return NextResponse.json({ updated: result.count });
}
