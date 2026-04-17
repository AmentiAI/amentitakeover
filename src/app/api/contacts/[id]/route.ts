import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Update = z.object({
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  phoneType: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  contactType: z.string().nullable().optional(),
  contactSource: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  tiktok: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  dndCalls: z.boolean().optional(),
  dndSms: z.boolean().optional(),
  dndEmail: z.boolean().optional(),
  ownerId: z.string().nullable().optional(),
  businessId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.any().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await prisma.contact.findUnique({
    where: { id },
    include: {
      business: true,
      owner: true,
      followers: { include: { user: true } },
      opportunities: { include: { stage: true, pipeline: true } },
      conversations: { include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { lastMessageAt: "desc" } },
      tasks: { orderBy: [{ done: "asc" }, { dueAt: "asc" }] },
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      activities: { include: { actor: true }, orderBy: { createdAt: "desc" }, take: 100 },
    },
  });
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(c);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await req.json();
  const parsed = Update.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const data: any = { ...parsed.data };
  if (typeof data.dateOfBirth === "string") data.dateOfBirth = new Date(data.dateOfBirth);
  const updated = await prisma.contact.update({ where: { id }, data });
  await prisma.activityEvent.create({
    data: {
      type: "contact.updated",
      title: "Contact updated",
      contactId: id,
      details: { fields: Object.keys(parsed.data) },
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
