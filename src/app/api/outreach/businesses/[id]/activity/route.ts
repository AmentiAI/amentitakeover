import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Returns the recent ActivityEvent rows tagged with this scraped-business id
// (events written by the build-logger helper). Used to render the drawer's
// Activity feed — a per-biz audit log of every scrape / enrich / build run.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const events = await prisma.activityEvent.findMany({
    where: { details: { path: ["scrapedBusinessId"], equals: id } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, type: true, title: true, details: true, createdAt: true },
  });
  return NextResponse.json({ events });
}
