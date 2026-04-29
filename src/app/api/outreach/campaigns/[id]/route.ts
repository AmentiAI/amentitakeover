import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Patch = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  subject: z.string().max(200).nullable().optional(),
  body: z.string().max(10_000).nullable().optional(),
  status: z.enum(["draft", "active", "paused", "archived"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const json = await req.json().catch(() => ({}));
  const parsed = Patch.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.campaign.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
