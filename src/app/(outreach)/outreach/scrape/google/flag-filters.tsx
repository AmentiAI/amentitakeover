"use client";

import { useRouter, useSearchParams } from "next/navigation";

// Filter chips for the badge flags shown in the Flags column. Clicking a chip
// adds it to ?flags=…; clicking again removes it. Multiple flags are AND-ed
// (a row must match all selected flags). Page state resets to 1 on toggle.

export type FlagKey =
  | "web"
  | "email"
  | "form"
  | "nocap"
  | "captcha"
  | "msg"
  | "nomsg"
  | "pass"
  | "fail"
  | "stale"
  | "enriched"
  | "qualified";

const FLAG_DEFS: { key: FlagKey; label: string; tone: string; title: string }[] = [
  { key: "web", label: "Website", tone: "sky", title: "Has a website on file" },
  { key: "email", label: "Email", tone: "teal", title: "Has an email address on file" },
  { key: "form", label: "Form", tone: "emerald", title: "Has a captured contact form" },
  { key: "msg", label: "Form · message", tone: "emerald", title: "Form has a textarea / message field" },
  { key: "nomsg", label: "Form · no-msg", tone: "rose", title: "Form has no message field — info dropoff only" },
  { key: "nocap", label: "Form · no-cap", tone: "emerald", title: "Form has no captcha — pushable headlessly" },
  { key: "captcha", label: "Form · captcha", tone: "amber", title: "Form is gated by recaptcha / hcaptcha / turnstile" },
  { key: "pass", label: "Content ✓", tone: "emerald", title: "Homepage passes content check (1 h1 + ≥3 h2)" },
  { key: "fail", label: "Content ✗", tone: "rose", title: "Homepage fails content check" },
  { key: "stale", label: "Stale ©", tone: "rose", title: "Copyright is 2+ years out of date" },
  { key: "enriched", label: "Enriched", tone: "emerald", title: "Has been enriched by deep-scrape" },
  { key: "qualified", label: "Qualified", tone: "violet", title: "Marked qualified for outreach" },
];

const TONES: Record<string, string> = {
  sky: "border-sky-500/40 text-sky-300 hover:bg-sky-500/10",
  teal: "border-teal-500/40 text-teal-300 hover:bg-teal-500/10",
  emerald: "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10",
  amber: "border-amber-500/40 text-amber-300 hover:bg-amber-500/10",
  rose: "border-rose-500/40 text-rose-300 hover:bg-rose-500/10",
  violet: "border-violet-500/40 text-violet-300 hover:bg-violet-500/10",
};
const TONES_ON: Record<string, string> = {
  sky: "border-sky-400 bg-sky-500/20 text-sky-100",
  teal: "border-teal-400 bg-teal-500/20 text-teal-100",
  emerald: "border-emerald-400 bg-emerald-500/20 text-emerald-100",
  amber: "border-amber-400 bg-amber-500/20 text-amber-100",
  rose: "border-rose-400 bg-rose-500/20 text-rose-100",
  violet: "border-violet-400 bg-violet-500/20 text-violet-100",
};

export function FlagFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const active = new Set(
    (params.get("flags") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as FlagKey[],
  );

  function toggle(key: FlagKey) {
    const next = new Set(active);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    const sp = new URLSearchParams(params.toString());
    if (next.size === 0) sp.delete("flags");
    else sp.set("flags", Array.from(next).join(","));
    sp.delete("page");
    router.push(`/outreach/scrape/google?${sp.toString()}`);
  }

  function clearAll() {
    const sp = new URLSearchParams(params.toString());
    sp.delete("flags");
    sp.delete("page");
    router.push(`/outreach/scrape/google?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Flags
      </span>
      {FLAG_DEFS.map((f) => {
        const on = active.has(f.key);
        return (
          <button
            type="button"
            key={f.key}
            onClick={() => toggle(f.key)}
            title={f.title}
            className={`rounded-full border px-2 py-0.5 text-[10px] transition ${
              on ? TONES_ON[f.tone] : `bg-slate-900 ${TONES[f.tone]}`
            }`}
          >
            {f.label}
          </button>
        );
      })}
      {active.size > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="ml-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400 hover:border-slate-500 hover:text-slate-200"
        >
          Clear flags
        </button>
      )}
    </div>
  );
}
