import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, callOpenAI } from "@/lib/openai";
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

  if (!getOpenAI()) {
    return NextResponse.json({
      reply:
        "OPENAI_API_KEY isn't set. Add it to .env to enable real AI responses.",
    });
  }
  try {
    const transcript = parsed.data.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
    const { text } = await callOpenAI({
      system: SYSTEM,
      user: transcript,
      maxTokens: 1500,
    });
    return NextResponse.json({ reply: text.trim() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
