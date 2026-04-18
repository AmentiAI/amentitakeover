import { OutreachTopbar } from "@/components/outreach-topbar";

export default function ApiUsagePage() {
  const routes = [
    { path: "/api/outreach/scrape", calls: 0, avgMs: 0 },
    { path: "/api/outreach/email-gen", calls: 0, avgMs: 0 },
    { path: "/api/sites/scrape", calls: 0, avgMs: 0 },
    { path: "/api/sites/rebuild", calls: 0, avgMs: 0 },
    { path: "/api/opportunities/move", calls: 0, avgMs: 0 },
    { path: "/api/ai/chat", calls: 0, avgMs: 0 },
  ];
  return (
    <>
      <OutreachTopbar activeHref="/outreach" />
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="rounded-lg border border-slate-800 bg-slate-950">
          <table className="w-full border-collapse text-sm">
            <thead className="text-left text-[10px] uppercase tracking-wider text-slate-500">
              <tr className="border-b border-slate-800">
                <th className="px-4 py-2">Endpoint</th>
                <th className="px-4 py-2">Calls (24h)</th>
                <th className="px-4 py-2">Avg latency</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.path} className="border-b border-slate-800">
                  <td className="px-4 py-2 font-mono text-slate-200">{r.path}</td>
                  <td className="px-4 py-2 text-slate-400">{r.calls}</td>
                  <td className="px-4 py-2 text-slate-400">{r.avgMs} ms</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                      healthy
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
