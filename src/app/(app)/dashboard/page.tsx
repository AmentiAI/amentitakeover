import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import {
  DollarSign,
  Globe,
  MessagesSquare,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [opps, contacts, convs, sites] = await Promise.all([
    prisma.opportunity.findMany({
      include: { stage: true, business: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.contact.count(),
    prisma.conversation.count(),
    prisma.site.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { rebuilds: true } } },
    }),
  ]);

  const totalValue = opps.reduce((s, o) => s + Number(o.value), 0);
  const wonCount = opps.filter((o) => o.stage.name === "Closed Won").length;
  const byStage = new Map<string, number>();
  for (const o of opps) byStage.set(o.stage.name, (byStage.get(o.stage.name) ?? 0) + 1);

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="flex-1 overflow-auto bg-slate-50 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat icon={Target} label="Opportunities" value={opps.length} />
          <Stat icon={DollarSign} label="Pipeline value" value={`$${totalValue.toFixed(2)}`} />
          <Stat icon={TrendingUp} label="Closed won" value={wonCount} />
          <Stat icon={Users} label="Contacts" value={contacts} />
          <Stat icon={MessagesSquare} label="Conversations" value={convs} />
          <Stat icon={Globe} label="Sites scraped" value={sites.length} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-800">
              Pipeline distribution
            </div>
            <div className="space-y-2">
              {Array.from(byStage.entries()).map(([name, count]) => {
                const pct = Math.round((count / Math.max(opps.length, 1)) * 100);
                return (
                  <div key={name}>
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>{name}</span>
                      <span>
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded bg-slate-100">
                      <div
                        className="h-2 rounded bg-brand-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {byStage.size === 0 && (
                <div className="text-xs text-slate-400">Seed the DB to see data.</div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800">Recent sites</div>
              <Link href="/sites" className="text-xs text-brand-700 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {sites.map((s) => (
                <Link
                  key={s.id}
                  href={`/sites/${s.id}`}
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50"
                >
                  {s.favicon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.favicon} alt="" className="h-4 w-4" />
                  )}
                  <div className="min-w-0 flex-1 truncate">
                    {s.title ?? s.url}
                  </div>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    {s._count.rebuilds} rebuilds
                  </span>
                </Link>
              ))}
              {sites.length === 0 && (
                <div className="text-xs text-slate-400">No sites yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
