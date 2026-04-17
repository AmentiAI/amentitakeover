"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, RotateCcw } from "lucide-react";
import type { AgentDefinition } from "@/lib/ai-agents";

type Msg = { role: "user" | "assistant"; content: string };

export function AgentChat({ agent }: { agent: AgentDefinition }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: agent.intro },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentKey: agent.key, messages: next }),
      });
      const j = await res.json();
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            j.reply ??
            (typeof j.error === "string"
              ? `Error: ${j.error}`
              : "(no response)"),
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setMessages([
        ...next,
        { role: "assistant", content: `Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([{ role: "assistant", content: agent.intro }]);
    setInput("");
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">
            {agent.name}
          </div>
          <div className="truncate text-[11px] text-slate-500">
            {agent.tagline}
          </div>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
          title="Start fresh"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm shadow-sm sm:max-w-[75%] ${
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                send(e as unknown as React.FormEvent);
              }
            }}
            rows={2}
            placeholder={agent.placeholder}
            className="flex-1 resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center gap-1 rounded-md bg-brand-700 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <div className="mt-1 text-[10px] text-slate-400">
          ⌘/Ctrl + Enter to send
        </div>
      </form>
    </>
  );
}
