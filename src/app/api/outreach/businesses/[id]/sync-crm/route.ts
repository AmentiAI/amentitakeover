import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const b = await prisma.scrapedBusiness.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pipeline = await prisma.pipeline.findFirst({
    where: { isDefault: true },
    include: { stages: { orderBy: { position: "asc" } } },
  });
  if (!pipeline || pipeline.stages.length === 0) {
    return NextResponse.json({ error: "No default pipeline" }, { status: 500 });
  }

  const businessId = b.id + "_crm";
  const payload = {
    name: b.name,
    phone: b.phone,
    email: b.email,
    website: b.website,
    address: b.address,
    city: b.city,
    state: b.state,
    zip: b.postalCode,
    industry: b.industry || b.category,
  };

  const business = await prisma.business.upsert({
    where: { id: businessId },
    update: payload,
    create: { id: businessId, ...payload },
  });

  if (b.siteId) {
    await prisma.site.update({
      where: { id: b.siteId },
      data: { businessId: business.id },
    }).catch(() => {});
  }

  let contactId: string | null = null;
  if (b.email || b.phone) {
    const existingContact = await prisma.contact.findFirst({
      where: {
        businessId: business.id,
        ...(b.email ? { email: b.email } : { phone: b.phone }),
      },
    });
    if (existingContact) {
      contactId = existingContact.id;
    } else {
      const contact = await prisma.contact.create({
        data: {
          firstName: b.name,
          email: b.email,
          phone: b.phone,
          address: b.address,
          city: b.city,
          state: b.state,
          postalCode: b.postalCode,
          country: b.country,
          instagram: b.instagram,
          facebook: b.facebook,
          twitter: b.twitter,
          linkedin: b.linkedin,
          tiktok: b.tiktok,
          website: b.website,
          contactSource: "Outreach scrape",
          contactType: "Lead",
          businessId: business.id,
          tags: b.tags,
        },
      });
      contactId = contact.id;
      await prisma.activityEvent.create({
        data: {
          type: "contact.created",
          title: `Contact created from scrape: ${b.name}`,
          contactId: contact.id,
        },
      });
    }
  }

  let opp = await prisma.opportunity.findFirst({
    where: { businessId: business.id },
  });
  if (!opp) {
    opp = await prisma.opportunity.create({
      data: {
        title: b.name,
        pipelineId: pipeline.id,
        stageId: pipeline.stages[0].id,
        businessId: business.id,
        contactId: contactId ?? undefined,
        source: "Outreach scrape",
      },
    });
    await prisma.activityEvent.create({
      data: {
        type: "opportunity.created",
        title: `Opportunity created: ${b.name}`,
        opportunityId: opp.id,
        contactId: contactId ?? undefined,
      },
    });
  }

  await prisma.scrapedBusiness.update({
    where: { id: b.id },
    data: { inSales: true },
  });

  return NextResponse.json({
    ok: true,
    businessId: business.id,
    contactId,
    opportunityId: opp.id,
  });
}
