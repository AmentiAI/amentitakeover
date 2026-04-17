import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";

export default async function IndustryProgressPage() {
  const rows = await prisma.industryProgress.findMany({
    orderBy: { totalFound: "desc" },
  });
  return (
    <>
      <OutreachTopbar activeHref="/outreach/industry" />
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-lg border border-slate-800 bg-slate-950">
          <table className="w-full border-collapse text-sm">
            <thead className="text-left text-[10px] uppercase tracking-wider text-slate-500">
              <tr className="border-b border-slate-800">
                <th className="px-4 py-2">Industry</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Enriched</th>
                <th className="px-4 py-2">Qualified</th>
                <th className="px-4 py-2">Emailed</th>
                <th className="px-4 py-2">Progress</th>
                <th className="px-4 py-2">Last run</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No scraping runs recorded yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const pct = r.totalFound
                  ? Math.round((r.qualified / r.totalFound) * 100)
                  : 0;
                return (
                  <tr key={r.id} className="border-b border-slate-800">
                    <td className="px-4 py-2 font-medium text-slate-100">
                      {r.industry}
                    </td>
                    <td className="px-4 py-2 text-slate-400">{r.totalFound}</td>
                    <td className="px-4 py-2 text-slate-400">{r.enriched}</td>
                    <td className="px-4 py-2 text-slate-400">{r.qualified}</td>
                    <td className="px-4 py-2 text-slate-400">{r.emailed}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 rounded bg-slate-800">
                          <div
                            className="h-1.5 rounded bg-indigo-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {r.lastRunAt
                        ? r.lastRunAt.toISOString().slice(0, 16).replace("T", " ")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
