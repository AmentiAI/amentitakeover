import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Body = z.object({
  businessId: z.string(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10_000),
  template: z.literal("site").optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const b = await prisma.scrapedBusiness.findUnique({
    where: { id: parsed.data.businessId },
  });
  if (!b) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  if (parsed.data.template && parsed.data.template !== b.templateChoice) {
    await prisma.scrapedBusiness.update({
      where: { id: b.id },
      data: { templateChoice: parsed.data.template },
    });
  }

  const draft = await prisma.emailDraft.create({
    data: {
      scrapedBusinessId: b.id,
      subject: parsed.data.subject,
      body: parsed.data.body,
      tone: "manual",
      model: "user",
      status: "draft",
    },
  });

  return NextResponse.json(draft);
}
