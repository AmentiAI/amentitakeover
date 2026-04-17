import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";
import { Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AffiliateEarningsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const affiliate = await prisma.affiliate.findUnique({
    where: { slug },
    select: { id: true, active: true },
  });
  if (!affiliate) notFound();

  const session = await getAffiliateFromCookies();
  if (!session || session.slug !== slug || !affiliate.active) {
    redirect(`/a/${slug}`);
  }

  const deals = await prisma.affiliateDeal.findMany({
    where: { affiliateId: affiliate.id },
    orderBy: { createdAt: "desc" },
  });

  const bizIds = deals.map((d) => d.scrapedBusinessId);
  const bizNames = bizIds.length
    ? await prisma.scrapedBusiness.findMany({
        where: { id: { in: bizIds } },
        select: { id: true, name: true },
      })
    : [];
  const bizMap = new Map(bizNames.map((b) => [b.id, b.name]));

  const owed = deals.reduce(
    (s, d) => (d.paidAt ? s : s + Number(d.commissionDue)),
    0,
  );
  const paid = deals.reduce(
    (s, d) => (d.paidAt ? s + Number(d.commissionDue) : s),
    0,
  );
  const lifetimeValue = deals.reduce((s, d) => s + Number(d.dealValue), 0);

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <h1 className="text-xl font-semibold text-white">Earnings</h1>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Commission owed"
          value={`$${owed.toFixed(2)}`}
          tone={owed > 0 ? "warn" : undefined}
        />
        <Stat label="Paid out" value={`$${paid.toFixed(2)}`} />
        <Stat label="Deal volume" value={`$${lifetimeValue.toFixed(2)}`} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-white">Closed deals</h2>
        <div className="mt-2 divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/50">
          {deals.length === 0 ? (
            <div className="p-4 text-xs text-slate-500">
              No deals closed yet. Start calling to earn commission.
            </div>
          ) : (
            deals.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-3 py-2.5 text-xs"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-200">
                    {bizMap.get(d.scrapedBusinessId) ?? "(unknown)"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(d.createdAt).toLocaleDateString()} · $
                    {Number(d.dealValue).toFixed(2)} × {d.commissionPct}% = $
                    {Number(d.commissionDue).toFixed(2)}
                  </div>
                </div>
                {d.paidAt ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    <Check className="h-3 w-3" />
                    paid {new Date(d.paidAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    pending
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={`mt-1 text-lg font-semibold ${
          tone === "warn" ? "text-amber-300" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
