import { Topbar } from "@/components/topbar";
import { AgentChat } from "./chat";

export default function AiAgentsPage() {
  return (
    <>
      <Topbar title="AI Agents" />
      <div className="flex min-h-0 flex-1">
        <div className="w-64 shrink-0 border-r border-slate-200 bg-white p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Agents
          </div>
          <div className="space-y-1 text-sm">
            <div className="rounded bg-brand-50 px-2 py-1.5 font-medium text-brand-900">
              Outreach Strategist
            </div>
            <div className="rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50">
              Site Critique
            </div>
            <div className="rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50">
              Reply Drafter
            </div>
            <div className="rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50">
              Lead Researcher
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
          <AgentChat />
        </div>
      </div>
    </>
  );
}
