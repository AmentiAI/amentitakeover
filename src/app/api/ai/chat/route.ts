import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import { z } from "zod";

export const maxDuration = 120;

const Body = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

const SYSTEM = `You are an in-app AI assistant for a CRM + lead-gen platform used by B2B agencies.
Help users: critique prospect websites, draft cold outreach, summarize inbox threads, plan next steps in their pipeline.
Be concise, direct, and actionable. Use short bullets. Never invent facts about the user's CRM data.`;

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const client = getAnthropic();
  if (!client) {
    return NextResponse.json({
      reply:
        "ANTHROPIC_API_KEY isn't set. Add it to .env to enable real AI responses.",
    });
  }
  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM,
      messages: parsed.data.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    const reply = resp.content
      .map((c) => ("text" in c ? c.text : ""))
      .join("\n")
      .trim();
    return NextResponse.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
