import { BadgeCheck, DollarSign, FileCheck2, HandCoins, Phone, ShieldCheck, Wrench } from "lucide-react";

export function TrustBadgeStrip({ accent }: { accent: string }) {
  const items = [
    { label: "GAF Master Elite", sub: "Top 2% of contractors" },
    { label: "Owens Corning Platinum", sub: "Preferred installer" },
    { label: "CertainTeed SELECT", sub: "ShingleMaster" },
    { label: "BBB A+ Accredited", sub: "Accredited business" },
    { label: "Google Guaranteed", sub: "Backed by Google" },
    { label: "$2M Liability", sub: "Insured + bonded" },
  ];
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center gap-4 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          <span className="h-px w-8 bg-slate-300" />
          Certified & Backed By
        </div>
        <ul className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {items.map((i) => (
            <li key={i.label} className="flex items-start gap-2.5">
              <span
                className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full"
                style={{ background: accent + "18", color: accent }}
              >
                <BadgeCheck className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <div className="text-[13px] font-semibold text-slate-900">{i.label}</div>
                <div className="text-[11px] text-slate-500">{i.sub}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FinancingBand({ accent, phoneHref }: { accent: string; phoneHref: string }) {
  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            <HandCoins className="h-3.5 w-3.5" style={{ color: accent }} />
            Financing available
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <div
              className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.02em]"
              style={{ color: accent }}
            >
              0% APR
            </div>
            <div className="text-[clamp(1.25rem,2vw,1.75rem)] font-semibold tracking-tight text-slate-900">
              up to 24 months
            </div>
            <div className="text-sm font-medium text-slate-600">· $0 down · approval in minutes</div>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            Don't let a failing roof wait for payday. Qualified homeowners finance full replacements
            from as little as <span className="font-semibold text-slate-900">$89/month</span>, with
            no pre-payment penalty.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <a
            href="#quote"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            style={{ background: accent, boxShadow: `0 18px 40px -18px ${accent}` }}
          >
            Pre-qualify in 60 seconds
          </a>
          <a
            href={phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            <Phone className="h-4 w-4" />
            Talk to a rep
          </a>
        </div>
      </div>
    </section>
  );
}

export function InsuranceClaimSteps({ accent }: { accent: string }) {
  const steps = [
    {
      num: "01",
      title: "Free damage inspection",
      body: "We climb up, document hail/wind damage with geo-tagged photos, and send you the report in writing.",
      icon: <FileCheck2 className="h-4 w-4" />,
    },
    {
      num: "02",
      title: "We file with your adjuster",
      body: "Our claims team speaks the adjuster's language — we meet them on the roof, walk the damage, and make sure nothing gets missed.",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      num: "03",
      title: "You pay the deductible",
      body: "Insurance pays the replacement. You pay your deductible. We install. Full tear-off in 1–2 days, with a lifetime workmanship warranty.",
      icon: <Wrench className="h-4 w-4" />,
    },
  ];
  return (
    <section className="relative border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start">
          <div>
            <div className="flex items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              <span className="h-px w-8 bg-slate-300" />
              Storm damage?
            </div>
            <h2 className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-slate-950">
              We handle the insurance{" "}
              <span className="italic" style={{ color: accent }}>
                start to finish.
              </span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
              Nine out of ten homeowners we inspect after a storm qualify for a partial or full
              replacement under their policy. You shouldn't have to chase the adjuster alone.
            </p>
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                <DollarSign className="h-3.5 w-3.5" />
                You pay only the deductible
              </div>
              <p className="mt-1.5 text-sm leading-snug text-amber-900">
                If damage is approved, your policy covers the rest — even if it means a full new
                roof at no additional out-of-pocket cost.
              </p>
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <li
                key={s.num}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full text-white shadow"
                    style={{ background: accent }}
                  >
                    {s.icon}
                  </span>
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Step {s.num}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-slate-950">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function WarrantyCallout({ accent }: { accent: string }) {
  return (
    <div className="relative flex gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6">
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-white shadow-lg"
        style={{ background: accent }}
      >
        <ShieldCheck className="h-6 w-6" />
      </span>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Golden Pledge Warranty
        </div>
        <div className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
          Up to 50-year materials · Lifetime workmanship
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          The strongest warranty in the industry — transferable to the next owner, backed by GAF.
        </p>
      </div>
    </div>
  );
}
