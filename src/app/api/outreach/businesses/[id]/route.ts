import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const b = await prisma.scrapedBusiness.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(b);
}

const Patch = z.object({
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  archived: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const json = await req.json();
  const parsed = Patch.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const updated = await prisma.scrapedBusiness.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.scrapedBusiness.update({
    where: { id },
    data: { archived: true },
  });
  return NextResponse.json({ ok: true });
}
