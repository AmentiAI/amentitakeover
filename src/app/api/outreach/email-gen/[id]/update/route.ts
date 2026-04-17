import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Body = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10_000),
});

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const draft = await prisma.emailDraft.findUnique({ where: { id } });
  if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  if (draft.status === "sent") {
    return NextResponse.json({ error: "Cannot edit a sent draft" }, { status: 400 });
  }

  const updated = await prisma.emailDraft.update({
    where: { id },
    data: {
      subject: parsed.data.subject,
      body: parsed.data.body,
    },
  });

  return NextResponse.json(updated);
}
