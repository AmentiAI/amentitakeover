"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Per-business panel that surfaces every cheap signal we extract during
// the homepage scrape — CMS, copyright year, mobile flag, SEO checks,
// martech stack, schema.org, stock-photo count. Pulled from
// /api/outreach/businesses/[id]/site so the same Site row that drives
// the contact form panel powers this too.

type Signals = {
  cms: string | null;
  copyrightYear: number | null;
  yearsBehind: number | null;
  mobileViewport: boolean;
  seo: {
    titleLength: number | null;
    descriptionPresent: boolean;
    descriptionLength: number | null;
    canonical: boolean;
    robotsNoindex: boolean;
  };
  analytics: string[];
  bookingWidgets: string[];
  liveChat: string[];
  schemaOrg: { hasLocalBusiness: boolean; types: string[] };
  stockPhotoCount: number;
};

export function BusinessSignalsPanel({ businessId }: { businessId: string }) {
  const [signals, setSignals] = useState<Signals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/outreach/businesses/${businessId}/site`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return;
        setSignals((j?.signals as Signals) ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  if (loading) {
    return (
      <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-[11px] text-slate-500">
        <Loader2 className="mr-1.5 inline h-3 w-3 animate-spin" /> Loading signals…
      </div>
    );
  }
  if (!signals) return null;

  const seoIssues: string[] = [];
  if (!signals.seo.descriptionPresent) seoIssues.push("missing meta description");
  else if ((signals.seo.descriptionLength ?? 0) < 50) seoIssues.push("meta description too short");
  if (!signals.seo.canonical) seoIssues.push("no canonical");
  if (signals.seo.robotsNoindex) seoIssues.push("noindex set");
  if ((signals.seo.titleLength ?? 0) < 30) seoIssues.push("title too short");
  else if ((signals.seo.titleLength ?? 0) > 65) seoIssues.push("title too long");

  return (
    <div className="rounded-md border border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Website signals
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 px-3 py-3 text-[12px] sm:grid-cols-2">
        <SignalRow label="CMS" value={signals.cms ? <Pill tone="violet">{prettyCms(signals.cms)}</Pill> : <span className="text-slate-500">—</span>} />
        <SignalRow
          label="Copyright"
          value={
            signals.copyrightYear ? (
              <span>
                {signals.copyrightYear}{" "}
                {signals.yearsBehind !== null && signals.yearsBehind >= 2 && (
                  <Pill tone="rose">{signals.yearsBehind} years behind</Pill>
                )}
                {signals.yearsBehind !== null && signals.yearsBehind <= 1 && (
                  <Pill tone="emerald">current</Pill>
                )}
              </span>
            ) : (
              <span className="text-slate-500">—</span>
            )
          }
        />
        <SignalRow
          label="Mobile viewport"
          value={
            signals.mobileViewport ? (
              <Pill tone="emerald">responsive</Pill>
            ) : (
              <Pill tone="rose">desktop-only</Pill>
            )
          }
        />
        <SignalRow
          label="Schema.org"
          value={
            signals.schemaOrg.types.length > 0 ? (
              <span title={signals.schemaOrg.types.join(", ")}>
                <Pill tone={signals.schemaOrg.hasLocalBusiness ? "emerald" : "slate"}>
                  {signals.schemaOrg.hasLocalBusiness ? "LocalBusiness" : `${signals.schemaOrg.types.length} types`}
                </Pill>
              </span>
            ) : (
              <Pill tone="rose">none</Pill>
            )
          }
        />
        <SignalRow
          label="SEO"
          value={
            seoIssues.length === 0 ? (
              <Pill tone="emerald">complete</Pill>
            ) : (
              <span className="space-x-1" title={seoIssues.join(" · ")}>
                <Pill tone="amber">{seoIssues.length} issue{seoIssues.length === 1 ? "" : "s"}</Pill>
              </span>
            )
          }
        />
        <SignalRow
          label="Stock photos"
          value={
            signals.stockPhotoCount > 0 ? (
              <Pill tone="amber">{signals.stockPhotoCount} found</Pill>
            ) : (
              <Pill tone="emerald">none</Pill>
            )
          }
        />
        <SignalRow
          label="Analytics"
          full
          value={
            signals.analytics.length > 0 ? (
              <PillList items={signals.analytics} tone="sky" />
            ) : (
              <Pill tone="rose">none detected</Pill>
            )
          }
        />
        <SignalRow
          label="Booking widget"
          full
          value={
            signals.bookingWidgets.length > 0 ? (
              <PillList items={signals.bookingWidgets} tone="emerald" />
            ) : (
              <Pill tone="amber">no booking flow</Pill>
            )
          }
        />
        <SignalRow
          label="Live chat"
          full
          value={
            signals.liveChat.length > 0 ? (
              <PillList items={signals.liveChat} tone="teal" />
            ) : (
              <span className="text-slate-500">—</span>
            )
          }
        />
      </div>
    </div>
  );
}

function SignalRow({
  label,
  value,
  full,
}: {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="min-w-0 truncate text-right">{value}</span>
    </div>
  );
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "emerald" | "amber" | "rose" | "violet" | "sky" | "teal" | "slate";
}) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    sky: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    teal: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    slate: "bg-slate-700/40 text-slate-300 border-slate-600/40",
  };
  return (
    <span className={`inline-block rounded-full border px-1.5 py-0.5 text-[10px] ${map[tone]}`}>
      {children}
    </span>
  );
}

function PillList({ items, tone }: { items: string[]; tone: "sky" | "emerald" | "teal" }) {
  return (
    <span className="inline-flex flex-wrap justify-end gap-1">
      {items.map((item) => (
        <Pill key={item} tone={tone}>
          {item}
        </Pill>
      ))}
    </span>
  );
}

function prettyCms(slug: string): string {
  const map: Record<string, string> = {
    wordpress: "WordPress",
    wix: "Wix",
    squarespace: "Squarespace",
    shopify: "Shopify",
    webflow: "Webflow",
    godaddy: "GoDaddy",
    duda: "Duda",
    weebly: "Weebly",
  };
  return map[slug] ?? slug;
}
