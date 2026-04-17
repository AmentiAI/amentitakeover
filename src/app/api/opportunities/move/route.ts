import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  opportunityId: z.string(),
  stageId: z.string(),
  position: z.number().int().nonnegative(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const { opportunityId, stageId, position } = parsed.data;

  const [stage, prev] = await Promise.all([
    prisma.stage.findUnique({ where: { id: stageId } }),
    prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { stage: true },
    }),
  ]);
  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
  if (!prev) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { stageId, position, pipelineId: stage.pipelineId },
  });

  if (prev.stageId !== stageId) {
    await prisma.activityEvent.create({
      data: {
        type: "opportunity.stage_changed",
        title: `Stage: ${prev.stage.name} → ${stage.name}`,
        contactId: prev.contactId,
        opportunityId,
        details: {
          fromStageId: prev.stageId,
          fromStageName: prev.stage.name,
          toStageId: stage.id,
          toStageName: stage.name,
        },
      },
    });
  }

  return NextResponse.json({ ok: true });
}
