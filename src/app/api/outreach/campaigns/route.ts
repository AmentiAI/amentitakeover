import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  DEFAULT_CAMPAIGN_BODY,
  defaultCampaignSubject,
} from "@/lib/default-campaign";

const Body = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  subject: z.string().max(200).optional(),
  body: z.string().max(10_000).optional(),
  status: z.enum(["draft", "active", "paused", "archived"]).optional(),
  useDefaultCopy: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { useDefaultCopy, ...rest } = parsed.data;
  const seedSubject = useDefaultCopy ? defaultCampaignSubject(null) : rest.subject ?? "";
  const seedBody = useDefaultCopy ? DEFAULT_CAMPAIGN_BODY : rest.body ?? "";

  const created = await prisma.campaign.create({
    data: {
      name: rest.name?.trim() || "Untitled campaign",
      channel: "email",
      status: rest.status ?? "draft",
      subject: seedSubject || null,
      body: seedBody || null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
