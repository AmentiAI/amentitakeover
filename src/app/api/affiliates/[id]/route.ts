import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const data: {
    name?: string;
    active?: boolean;
    commissionPct?: number;
  } = {};
  if (typeof body?.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body?.active === "boolean") data.active = body.active;
  if (Number.isFinite(Number(body?.commissionPct))) {
    const n = Math.round(Number(body.commissionPct));
    if (n >= 0 && n <= 100) data.commissionPct = n;
  }
  const affiliate = await prisma.affiliate.update({ where: { id }, data });
  return NextResponse.json(affiliate);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  await prisma.affiliate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
