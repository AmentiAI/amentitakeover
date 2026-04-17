import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const rows = await prisma.opportunity.findMany({
    include: { business: true, stage: true, pipeline: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(rows);
}

const Create = z.object({
  title: z.string().min(1),
  value: z.number().optional(),
  pipelineId: z.string(),
  stageId: z.string(),
  businessId: z.string().optional(),
  contactId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Create.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const created = await prisma.opportunity.create({ data: parsed.data });
  await prisma.activityEvent.create({
    data: {
      type: "opportunity.created",
      title: `Opportunity created: ${created.title}`,
      contactId: created.contactId,
      opportunityId: created.id,
      details: { value: created.value, stageId: created.stageId },
    },
  });
  return NextResponse.json(created);
}
