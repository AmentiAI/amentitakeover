"use client";

import { useState } from "react";
import { AGENTS, type AgentKey } from "@/lib/ai-agents";
import { AgentChat } from "./chat";
import {
  Megaphone,
  Search,
  Reply,
  ScanSearch,
  Target,
  Sparkles,
} from "lucide-react";

const AGENT_ICONS: Record<AgentKey, typeof Megaphone> = {
  "outreach-strategist": Megaphone,
  "site-critique": ScanSearch,
  "reply-drafter": Reply,
  "lead-researcher": Search,
  "close-coach": Target,
};

export function AgentsWorkspace({ hasKey }: { hasKey: boolean }) {
  const [activeKey, setActiveKey] = useState<AgentKey>(AGENTS[0].key);
  const active = AGENTS.find((a) => a.key === activeKey) ?? AGENTS[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <aside className="shrink-0 border-b border-slate-200 bg-white p-2 md:w-64 md:border-b-0 md:border-r md:p-3">
        <div className="mb-2 hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:flex">
          <Sparkles className="h-3 w-3" />
          Agents
        </div>
        <div className="flex gap-1 overflow-x-auto text-sm md:flex-col md:space-y-1 md:overflow-visible">
          {AGENTS.map((a) => {
            const Icon = AGENT_ICONS[a.key];
            const selected = a.key === activeKey;
            return (
              <button
                key={a.key}
                onClick={() => setActiveKey(a.key)}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded px-2 py-1.5 text-left transition md:whitespace-normal ${
                  selected
                    ? "bg-brand-50 font-medium text-brand-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="md:flex md:flex-col">
                  <span>{a.name}</span>
                  <span className="hidden text-[11px] font-normal text-slate-400 md:block">
                    {a.tagline}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
        {!hasKey && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
            <b>OPENAI_API_KEY not set.</b> Add it to <code>.env</code> and restart
            the dev server — these agents use GPT-4o.
          </div>
        )}
        <AgentChat key={activeKey} agent={active} />
      </div>
    </div>
  );
}
