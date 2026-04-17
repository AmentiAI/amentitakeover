import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const r = await prisma.siteRebuild.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(r.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
