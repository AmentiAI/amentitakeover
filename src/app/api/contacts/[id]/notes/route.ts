import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Body = z.object({ body: z.string().min(1), authorId: z.string().optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const note = await prisma.note.create({
    data: { body: parsed.data.body, contactId: id, authorId: parsed.data.authorId },
  });
  await prisma.activityEvent.create({
    data: {
      type: "note.created",
      title: "Note added",
      contactId: id,
      actorId: parsed.data.authorId,
      details: { preview: parsed.data.body.slice(0, 140) },
    },
  });
  return NextResponse.json(note);
}
