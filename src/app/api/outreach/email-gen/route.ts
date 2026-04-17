import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import { z } from "zod";

export const maxDuration = 120;

const Body = z.object({
  businessId: z.string(),
  tone: z.string().default("friendly-professional"),
  hook: z.string().default("website audit"),
});

const SYSTEM = `You write short, sharp cold emails for B2B agency outreach.
- Max 110 words.
- Open with a specific observation, not flattery.
- One concrete benefit.
- One clear CTA (15-min call or reply).
- No jargon, no "I hope this finds you well".
Return JSON: {"subject":"...","body":"..."}`;

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const b = await prisma.scrapedBusiness.findUnique({
    where: { id: parsed.data.businessId },
  });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const client = getAnthropic();
  let subject = `Quick idea for ${b.name}`;
  let body = `Hey — I looked at ${b.website ?? "your Google listing"} and wanted to share a quick thought.\n\nHappy to send a 2-minute Loom. Worth a look?`;
  let model = "fallback";

  if (client) {
    const userPrompt = [
      `Business: ${b.name}`,
      `Category: ${b.category ?? b.industry ?? ""}`,
      `Location: ${[b.city, b.state].filter(Boolean).join(", ")}`,
      `Website: ${b.website ?? "none"}`,
      `Rating: ${b.rating ?? "n/a"} (${b.reviewsCount} reviews)`,
      `Tone: ${parsed.data.tone}`,
      `Hook/angle: ${parsed.data.hook}`,
    ].join("\n");
    try {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 500,
        system: SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
      });
      const text = resp.content.map((c) => ("text" in c ? c.text : "")).join("\n");
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        const obj = JSON.parse(m[0]);
        if (obj.subject) subject = obj.subject;
        if (obj.body) body = obj.body;
      }
      model = MODEL;
      await prisma.aiUsageEvent.create({
        data: {
          model: MODEL,
          purpose: "email_generation",
          inputTokens: resp.usage?.input_tokens ?? 0,
          outputTokens: resp.usage?.output_tokens ?? 0,
        },
      });
    } catch {
      // fall through to fallback
    }
  }

  const draft = await prisma.emailDraft.create({
    data: {
      scrapedBusinessId: b.id,
      subject,
      body,
      tone: parsed.data.tone,
      model,
      status: "draft",
    },
  });

  await prisma.scrapedBusiness.update({
    where: { id: b.id },
    data: { emailReady: true },
  });

  return NextResponse.json(draft);
}
