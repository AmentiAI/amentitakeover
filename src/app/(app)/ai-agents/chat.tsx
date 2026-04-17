"use client";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function AgentChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm your Outreach Strategist. Give me a prospect URL or paste copy, and I'll help you plan outreach, critique the site, or draft replies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const j = await res.json();
      setMessages([
        ...next,
        { role: "assistant", content: j.reply ?? j.error ?? "(no response)" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm shadow-sm sm:max-w-[75%] ${
              m.role === "user"
                ? "ml-auto bg-brand-700 text-white"
                : "bg-white text-slate-800"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            thinking…
          </div>
        )}
      </div>
      <form onSubmit={send} className="border-t border-slate-200 bg-white p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Ask the agent…"
            className="flex-1 resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1 rounded-md bg-brand-700 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </form>
    </>
  );
}
