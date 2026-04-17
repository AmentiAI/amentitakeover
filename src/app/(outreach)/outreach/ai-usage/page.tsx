import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";

export default async function AiUsagePage() {
  const [events, agg] = await Promise.all([
    prisma.aiUsageEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.aiUsageEvent.aggregate({
      _sum: { inputTokens: true, outputTokens: true, cents: true },
      _count: true,
    }),
  ]);
  const byPurpose = await prisma.aiUsageEvent.groupBy({
    by: ["purpose"],
    _count: true,
    _sum: { inputTokens: true, outputTokens: true },
  });
  return (
    <>
      <OutreachTopbar activeHref="/outreach" />
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-3 md:grid-cols-4">
          <Stat label="Total calls" value={agg._count.toString()} />
          <Stat label="Input tokens" value={(agg._sum.inputTokens ?? 0).toLocaleString()} />
          <Stat label="Output tokens" value={(agg._sum.outputTokens ?? 0).toLocaleString()} />
          <Stat label="Spend" value={`$${((agg._sum.cents ?? 0) / 100).toFixed(2)}`} />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="mb-2 text-sm font-semibold text-white">By purpose</div>
            <div className="space-y-2">
              {byPurpose.map((b) => (
                <div key={b.purpose} className="flex justify-between text-sm">
                  <span className="text-slate-300">{b.purpose}</span>
                  <span className="text-slate-500">
                    {b._count} calls · {(b._sum.outputTokens ?? 0).toLocaleString()} out tok
                  </span>
                </div>
              ))}
              {byPurpose.length === 0 && (
                <div className="text-xs text-slate-500">No usage yet.</div>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="mb-2 text-sm font-semibold text-white">Recent events</div>
            <div className="space-y-1 text-xs">
              {events.slice(0, 12).map((e) => (
                <div key={e.id} className="flex justify-between text-slate-400">
                  <span>{e.purpose} · {e.model}</span>
                  <span>
                    {e.createdAt.toISOString().slice(11, 16)}
                  </span>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-slate-500">No events.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
