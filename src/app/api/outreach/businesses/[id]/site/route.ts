import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Returns the lightweight Site fields the drawer panels need (signals,
// contentScore, contactForm). Avoids pulling rawHtml + textContent which
// would be wasted bandwidth for these UI surfaces.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const biz = await prisma.scrapedBusiness.findUnique({
    where: { id },
    select: {
      site: {
        select: {
          signals: true,
          contentScore: true,
          contactForm: true,
        },
      },
    },
  });
  if (!biz?.site) {
    return NextResponse.json({ signals: null, contentScore: null, contactForm: null });
  }
  return NextResponse.json(biz.site);
}
