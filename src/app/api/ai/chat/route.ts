import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, callOpenAI } from "@/lib/openai";
import { getAgent } from "@/lib/ai-agents";
import { z } from "zod";

export const maxDuration = 120;

const Body = z.object({
  agentKey: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const agent = getAgent(parsed.data.agentKey);

  if (!getOpenAI()) {
    return NextResponse.json({
      reply:
        "OPENAI_API_KEY isn't set on the server. Add it to .env and restart the dev server.",
    });
  }

  try {
    const transcript = parsed.data.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
    const { text } = await callOpenAI({
      system: agent.system,
      user: transcript,
      maxTokens: 1800,
    });
    return NextResponse.json({ reply: text.trim(), agent: agent.key });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
