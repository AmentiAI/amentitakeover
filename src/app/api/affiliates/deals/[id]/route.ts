import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const paid = body?.paid === true;
  const deal = await prisma.affiliateDeal.update({
    where: { id },
    data: { paidAt: paid ? new Date() : null },
  });
  return NextResponse.json(deal);
}
