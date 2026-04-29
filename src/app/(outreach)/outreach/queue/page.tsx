import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";
import { RunAllButton } from "./run-all-button";

export const dynamic = "force-dynamic";

export default async function GenerationQueuePage() {
  const pending = await prisma.scrapedBusiness.findMany({
    where: { hasWebsite: true, siteGenerated: false, archived: false },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, name: true, website: true, industry: true, city: true, state: true, audited: true },
  });
  return (
    <>
      <OutreachTopbar activeHref="/outreach/queue" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {pending.length} business{pending.length === 1 ? "" : "es"} waiting
            for site generation
          </div>
          <RunAllButton items={pending.map((b) => ({ id: b.id, audited: b.audited, name: b.name }))} />
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950">
          <table className="w-full border-collapse text-sm">
            <thead className="text-left text-[10px] uppercase tracking-wider text-slate-500">
              <tr className="border-b border-slate-800">
                <th className="px-4 py-2">Business</th>
                <th className="px-4 py-2">Website</th>
                <th className="px-4 py-2">Industry</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((b) => (
                <tr key={b.id} className="border-b border-slate-800">
                  <td className="px-4 py-2 font-medium text-slate-100">{b.name}</td>
                  <td className="px-4 py-2 text-slate-400">
                    <span className="truncate">{b.website ?? "—"}</span>
                  </td>
                  <td className="px-4 py-2 text-slate-400">{b.industry}</td>
                  <td className="px-4 py-2 text-slate-400">
                    {[b.city, b.state].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-4 py-2">
                    {b.audited ? (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
                        queued
                      </span>
                    ) : (
                      <span
                        title="Not yet enriched — Run all will scrape the site first, then build."
                        className="rounded-full border border-slate-600 bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-300"
                      >
                        needs enrich
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Nothing in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
