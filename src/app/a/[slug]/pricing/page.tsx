import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";
import { PRICING_TIERS, formatMonthly, formatSetup } from "@/lib/pricing";
import { Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AffiliatePricingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const affiliate = await prisma.affiliate.findUnique({
    where: { slug },
    select: { active: true, commissionPct: true },
  });
  if (!affiliate) notFound();

  const session = await getAffiliateFromCookies();
  if (!session || session.slug !== slug || !affiliate.active) {
    redirect(`/a/${slug}`);
  }

  const pct = affiliate.commissionPct;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Pricing</h1>
        <p className="mt-1 text-sm text-slate-400">
          Use these packages when pitching clients. Prices are fixed — don't
          negotiate below the listed monthly or setup fee. Your commission rate:{" "}
          <span className="font-semibold text-indigo-300">{pct}%</span>.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.key}
            className={`relative flex flex-col rounded-xl border p-6 ${
              tier.badge
                ? "border-indigo-500/50 bg-indigo-500/5"
                : "border-slate-800 bg-slate-900/50"
            }`}
          >
            {tier.badge && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                {tier.badge}
              </div>
            )}

            <div className="mb-4">
              <div className="text-2xl">{tier.emoji}</div>
              <h2 className="mt-2 text-lg font-semibold text-white">
                {tier.name}
              </h2>
              <p className="mt-1 text-xs text-slate-400">{tier.tagline}</p>
            </div>

            <div className="mb-4">
              {tier.monthly == null ? (
                <>
                  <div className="text-3xl font-bold text-white">Custom</div>
                  <div className="text-xs text-slate-400">Pricing</div>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">
                      {formatMonthly(tier)}
                    </span>
                    <span className="text-sm text-slate-400">/month</span>
                  </div>
                  {tier.setup != null && (
                    <div className="mt-0.5 text-xs text-slate-400">
                      + {formatSetup(tier)} one-time setup fee
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Affiliate take-home */}
            <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                You earn ({pct}%)
              </div>
              {tier.monthly == null ? (
                <div className="mt-1 text-sm text-emerald-200">
                  Negotiated per deal — talk to admin for custom splits.
                </div>
              ) : (
                <div className="mt-1 space-y-0.5 text-sm text-emerald-100">
                  <div>
                    <span className="font-bold text-emerald-300">
                      ${Math.round((tier.setup ?? 0) * pct / 100).toLocaleString()}
                    </span>
                    <span className="text-xs text-emerald-300/70"> on setup</span>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-300">
                      ${Math.round(tier.monthly * pct / 100).toLocaleString()}
                    </span>
                    <span className="text-xs text-emerald-300/70">
                      /mo recurring
                    </span>
                  </div>
                  <div className="mt-1 border-t border-emerald-500/20 pt-1 text-[11px] text-emerald-300/70">
                    Year 1 total:{" "}
                    <span className="font-semibold text-emerald-200">
                      $
                      {Math.round(
                        ((tier.setup ?? 0) + tier.monthly * 12) * pct / 100,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <ul className="mb-5 flex-1 space-y-2 text-sm">
              {tier.inheritsFrom && (
                <li className="flex items-start gap-2 font-medium text-indigo-300">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Everything in {tier.inheritsFrom}
                </li>
              )}
              {tier.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-slate-300"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-800 pt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Best for
              </div>
              <p className="mt-1 text-xs text-slate-400">{tier.bestFor}</p>
            </div>

            <button
              disabled
              className={`mt-4 w-full rounded-md px-3 py-2 text-sm font-semibold transition ${
                tier.badge
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-700 bg-slate-950 text-slate-200"
              } opacity-70`}
              title="Checkout not wired yet"
            >
              {tier.ctaLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
