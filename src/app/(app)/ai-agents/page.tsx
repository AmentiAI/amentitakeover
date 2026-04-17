import { Topbar } from "@/components/topbar";
import { AgentChat } from "./chat";

export default function AiAgentsPage() {
  return (
    <>
      <Topbar title="AI Agents" />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="shrink-0 border-b border-slate-200 bg-white p-2 md:w-64 md:border-b-0 md:border-r md:p-3">
          <div className="mb-2 hidden text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:block">
            Agents
          </div>
          <div className="flex gap-1 overflow-x-auto text-sm md:flex-col md:space-y-1 md:overflow-visible">
            <div className="shrink-0 rounded bg-brand-50 px-2 py-1.5 font-medium text-brand-900 whitespace-nowrap">
              Outreach Strategist
            </div>
            <div className="shrink-0 rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50 whitespace-nowrap">
              Site Critique
            </div>
            <div className="shrink-0 rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50 whitespace-nowrap">
              Reply Drafter
            </div>
            <div className="shrink-0 rounded px-2 py-1.5 text-slate-600 hover:bg-slate-50 whitespace-nowrap">
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
