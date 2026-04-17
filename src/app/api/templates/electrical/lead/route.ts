import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { notifyLead } from "@/lib/lead-notification";

const Body = z.object({
  businessSlug: z.string(),
  name: z.string().min(1).max(120),
  phone: z.string().min(4).max(40),
  zip: z.string().max(12).optional(),
  need: z.string().max(200).optional(),
  urgency: z.string().max(60).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const { businessSlug, name, phone, zip, need, urgency } = parsed.data;

  const scraped = await prisma.scrapedBusiness
    .findUnique({ where: { id: businessSlug } })
    .catch(() => null);

  const firstName = name.split(/\s+/)[0] || name;
  const lastName = name.split(/\s+/).slice(1).join(" ") || null;

  let businessId: string | null = null;
  if (scraped) {
    const crmId = scraped.id + "_crm";
    const biz = await prisma.business.upsert({
      where: { id: crmId },
      update: {},
      create: {
        id: crmId,
        name: scraped.name,
        website: scraped.website,
        phone: scraped.phone,
        city: scraped.city,
        state: scraped.state,
        industry: scraped.industry ?? scraped.category,
      },
    });
    businessId = biz.id;
  }

  const tags = [need, urgency].filter(Boolean) as string[];

  const contact = await prisma.contact.create({
    data: {
      firstName,
      lastName,
      phone,
      postalCode: zip,
      contactSource: "Electrical template lead form",
      contactType: "Lead",
      tags,
      businessId: businessId ?? undefined,
    },
  });

  await prisma.activityEvent.create({
    data: {
      type: "lead.captured",
      title: `Electrical dispatch request: ${name}`,
      details: { need, urgency, zip, businessSlug, source: "template:electrical" },
      contactId: contact.id,
    },
  });

  if (scraped?.email) {
    await notifyLead({
      to: scraped.email,
      businessName: scraped.name,
      industry: "electrical",
      lead: { name, phone, zip, need, urgency },
    });
  }

  return NextResponse.json({ ok: true, contactId: contact.id });
}
