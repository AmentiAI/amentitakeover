import { OutreachTopbar } from "@/components/outreach-topbar";

export default function AgentDetailsPage() {
  const agents = [
    { name: "Google Places Agent", status: "idle", lastRun: "—", success: 98 },
    { name: "Yelp Scraper", status: "idle", lastRun: "—", success: 92 },
    { name: "Instagram Discovery", status: "idle", lastRun: "—", success: 87 },
    { name: "Website Enricher", status: "idle", lastRun: "—", success: 95 },
    { name: "Email Finder", status: "idle", lastRun: "—", success: 81 },
    { name: "Social Linker", status: "idle", lastRun: "—", success: 90 },
  ];
  return (
    <>
      <OutreachTopbar activeHref="/outreach/scrape/google" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4 text-sm text-slate-400">
          Agents that power scraping and enrichment.
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((a) => (
            <div
              key={a.name}
              className="rounded-lg border border-slate-800 bg-slate-950 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">{a.name}</div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                  {a.status}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">Last run: {a.lastRun}</div>
              <div className="mt-3 text-[11px] text-slate-500">Success rate</div>
              <div className="mt-1 h-1.5 rounded bg-slate-800">
                <div
                  className="h-1.5 rounded bg-indigo-500"
                  style={{ width: `${a.success}%` }}
                />
              </div>
              <div className="mt-1 text-right text-[11px] text-slate-400">
                {a.success}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
