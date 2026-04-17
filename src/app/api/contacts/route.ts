import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const rows = await prisma.contact.findMany({
    include: { business: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rows);
}

const Create = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  businessId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Create.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const created = await prisma.contact.create({
    data: { ...parsed.data, tags: parsed.data.tags ?? [] },
  });
  await prisma.activityEvent.create({
    data: {
      type: "contact.created",
      title: "Contact created",
      contactId: created.id,
      details: { email: created.email, phone: created.phone },
    },
  });
  return NextResponse.json(created);
}
