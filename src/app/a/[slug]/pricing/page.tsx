import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";
import {
  PRICING_SERVICES,
  formatTierPrice,
  formatTierUnit,
  type PricingService,
  type PricingTier,
} from "@/lib/pricing";
import { Check, Sparkles } from "lucide-react";

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
          Use these packages when pitching clients. Prices are fixed — don&apos;t
          negotiate below the listed tier. Your commission rate:{" "}
          <span className="font-semibold text-indigo-300">{pct}%</span>. Custom
          tiers pay out on scoped quote approval.
        </p>
      </div>

      <div className="mt-8 space-y-10">
        {PRICING_SERVICES.map((service) => (
          <ServiceBlock key={service.key} service={service} pct={pct} />
        ))}
      </div>
    </div>
  );
}

function ServiceBlock({
  service,
  pct,
}: {
  service: PricingService;
  pct: number;
}) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          {service.emoji}
        </span>
        <h2 className="text-lg font-semibold text-white">{service.name}</h2>
      </div>
      <p className="mt-1 text-sm text-slate-400">{service.tagline}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {service.tiers.map((tier) => (
          <TierCard key={tier.key} tier={tier} pct={pct} />
        ))}
      </div>
    </section>
  );
}

function TierCard({ tier, pct }: { tier: PricingTier; pct: number }) {
  const popular = tier.badge === "Popular";
  const isCustom = tier.price == null;
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-5 ${
        popular
          ? "border-indigo-500/50 bg-indigo-500/5"
          : isCustom
            ? "border-cyan-500/30 bg-cyan-500/5"
            : "border-slate-800 bg-slate-900/50"
      }`}
    >
      {tier.badge && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          {tier.badge}
        </div>
      )}

      <div className="mb-3">
        <h3 className="text-base font-semibold text-white">{tier.name}</h3>
        {tier.tagline && (
          <p className="mt-1 text-[11px] text-slate-400">{tier.tagline}</p>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">
            {formatTierPrice(tier)}
          </span>
          <span className="text-xs text-slate-400">
            {formatTierUnit(tier)}
          </span>
        </div>
      </div>

      {/* Affiliate take-home */}
      <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          You earn ({pct}%)
        </div>
        {isCustom ? (
          <div className="mt-1 text-xs text-emerald-200">
            Paid on approved quote. Talk to admin for splits above standard.
          </div>
        ) : (
          <div className="mt-1 text-sm font-bold text-emerald-300">
            ${Math.round((tier.price ?? 0) * pct / 100).toLocaleString()}
            <span className="ml-1 text-xs font-normal text-emerald-300/70">
              per sale{tier.unit === "monthly" ? " · recurring monthly" : ""}
            </span>
          </div>
        )}
      </div>

      <ul className="mb-4 flex-1 space-y-2 text-sm">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-slate-300">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        disabled
        className={`mt-auto w-full rounded-md px-3 py-2 text-sm font-semibold transition ${
          popular
            ? "bg-indigo-600 text-white"
            : isCustom
              ? "inline-flex items-center justify-center gap-1.5 bg-cyan-600 text-white"
              : "border border-slate-700 bg-slate-950 text-slate-200"
        } opacity-70`}
        title={isCustom ? "Request a quote — coming soon" : "Checkout not wired yet"}
      >
        {isCustom && <Sparkles className="h-3.5 w-3.5" />}
        {isCustom ? "Request quote" : "Select tier"}
      </button>
    </div>
  );
}
