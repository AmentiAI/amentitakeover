"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  DollarSign,
  Search,
  Globe,
  Eye,
  StickyNote,
  PhoneMissed,
  Ban,
  Loader2,
  Check,
} from "lucide-react";

type Biz = {
  id: string;
  name: string;
  phone: string | null;
  website: string | null;
  email: string | null;
  industry: string | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  reviewsCount: number;
  templateChoice: string;
  alreadyCalled: boolean;
  alreadyClosed: boolean;
  note: string | null;
};

type Activity = {
  id: string;
  createdAt: string;
  outcome: string;
  businessName: string;
};

export function OpportunitiesView({
  slug,
  stats,
  businesses,
  recentActivity,
}: {
  slug: string;
  stats: { callsTotal: number; dealsTotal: number; commissionOwed: number };
  businesses: Biz[];
  recentActivity: Activity[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [dealing, setDealing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return businesses;
    return businesses.filter((b) =>
      [b.name, b.industry, b.city, b.state]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(needle)),
    );
  }, [q, businesses]);

  async function logCall(biz: Biz, outcome = "dialed", notes?: string) {
    await fetch("/api/affiliate/call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scrapedBusinessId: biz.id, outcome, notes }),
    });
    router.refresh();
  }

  async function saveNote(biz: Biz) {
    const body = (notesDraft[biz.id] ?? biz.note ?? "").trim();
    if (!body) return;
    setWorking(biz.id);
    await logCall(biz, "note", body);
    setWorking(null);
    setSaved(biz.id);
    setTimeout(() => setSaved((cur) => (cur === biz.id ? null : cur)), 1500);
  }

  async function markNoAnswer(biz: Biz) {
    setWorking(biz.id);
    await logCall(biz, "no_answer", notesDraft[biz.id]?.trim() || undefined);
    setWorking(null);
  }

  async function markNotInterested(biz: Biz) {
    if (!confirm(`Remove "${biz.name}" from your board? This can't be undone from here.`)) return;
    setWorking(biz.id);
    await logCall(biz, "not_interested", notesDraft[biz.id]?.trim() || undefined);
    setWorking(null);
  }

  async function logDeal(biz: Biz) {
    const input = prompt(`Deal value for ${biz.name}? (in dollars)`);
    if (!input) return;
    const dealValue = Number(input.replace(/[$,]/g, ""));
    if (!Number.isFinite(dealValue) || dealValue <= 0) {
      alert("Invalid amount");
      return;
    }
    setDealing(biz.id);
    const res = await fetch("/api/affiliate/deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scrapedBusinessId: biz.id, dealValue }),
    });
    setDealing(null);
    if (!res.ok) {
      alert("Failed to log deal");
      return;
    }
    router.refresh();
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold text-white">Opportunities</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>
            <span className="text-white">{stats.callsTotal}</span> calls
          </span>
          <span>
            <span className="text-white">{stats.dealsTotal}</span> closed
          </span>
          <span>
            Owed{" "}
            <span className={stats.commissionOwed > 0 ? "text-amber-300" : "text-white"}>
              ${stats.commissionOwed.toFixed(2)}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300">
        <Search className="h-3.5 w-3.5" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, industry, city"
          className="flex-1 bg-transparent outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="mt-3 divide-y divide-slate-800 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No businesses match your search.
          </div>
        ) : (
          filtered.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-2 px-3 py-3 hover:bg-slate-900/60 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4"
            >
              <Link
                href={`/a/${slug}/business/${b.id}`}
                className="min-w-0 flex-1 -my-1 py-1"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-white">
                    {b.name}
                  </span>
                  {b.alreadyClosed && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                      closed
                    </span>
                  )}
                  {b.alreadyCalled && !b.alreadyClosed && (
                    <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                      called
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                  {b.industry && <span>{b.industry}</span>}
                  {(b.city || b.state) && (
                    <span>{[b.city, b.state].filter(Boolean).join(", ")}</span>
                  )}
                  {typeof b.rating === "number" && (
                    <span>
                      {b.rating.toFixed(1)}★ ({b.reviewsCount})
                    </span>
                  )}
                  {b.phone && <span className="font-mono">{b.phone}</span>}
                  {b.website && (
                    <span className="inline-flex items-center gap-1 truncate text-sky-400">
                      <Globe className="h-3 w-3" />
                      {b.website.replace(/^https?:\/\//, "").split("/")[0]}
                    </span>
                  )}
                </div>
                {b.note && (
                  <div className="mt-1 flex items-start gap-1 text-[11px] text-amber-200/80">
                    <StickyNote className="mt-0.5 h-3 w-3 shrink-0" />
                    <span className="line-clamp-2">{b.note}</span>
                  </div>
                )}
              </Link>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <a
                  href={`/p/${b.templateChoice || "roofing"}/${b.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 sm:flex-none sm:py-1.5"
                  title="New site (our template)"
                >
                  <Eye className="h-3.5 w-3.5" /> New
                </a>
                {b.website && (
                  <a
                    href={b.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 sm:flex-none sm:py-1.5"
                    title="Old site (their live site)"
                  >
                    <Globe className="h-3.5 w-3.5" /> Old
                  </a>
                )}
                {b.phone && (
                  <a
                    href={`tel:${b.phone.replace(/[^+\d]/g, "")}`}
                    onClick={() => logCall(b, "dialed")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 sm:flex-none sm:py-1.5"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                )}
                <button
                  onClick={() => logDeal(b)}
                  disabled={dealing === b.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-50 sm:flex-none sm:py-1.5"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  {dealing === b.id ? "..." : "Log deal"}
                </button>
                <button
                  onClick={() =>
                    setExpanded((cur) => (cur === b.id ? null : b.id))
                  }
                  className={`flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium sm:py-1.5 ${
                    expanded === b.id
                      ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
                      : "border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                  title="Notes & outcome"
                  aria-expanded={expanded === b.id}
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Notes</span>
                </button>
              </div>
              {expanded === b.id && (
                <div className="mt-1 w-full rounded-md border border-slate-800 bg-slate-950/60 p-3 sm:basis-full">
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Notes
                  </label>
                  <textarea
                    value={notesDraft[b.id] ?? b.note ?? ""}
                    onChange={(e) =>
                      setNotesDraft((d) => ({ ...d, [b.id]: e.target.value }))
                    }
                    placeholder="What happened on the call?"
                    rows={2}
                    maxLength={500}
                    className="mt-1 w-full resize-y rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => saveNote(b)}
                      disabled={working === b.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/40 bg-sky-500/10 px-2.5 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20 disabled:opacity-50"
                    >
                      {working === b.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : saved === b.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <StickyNote className="h-3.5 w-3.5" />
                      )}
                      {saved === b.id ? "Saved" : "Save note"}
                    </button>
                    <button
                      onClick={() => markNoAnswer(b)}
                      disabled={working === b.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                    >
                      <PhoneMissed className="h-3.5 w-3.5" />
                      No answer
                    </button>
                    <button
                      onClick={() => markNotInterested(b)}
                      disabled={working === b.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Not interested
                    </button>
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-500">
                    &quot;No answer&quot; keeps this business on your board.
                    &quot;Not interested&quot; removes it.
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-white">Recent calls</h2>
        <div className="mt-2 divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/50">
          {recentActivity.length === 0 ? (
            <div className="p-4 text-xs text-slate-500">No calls logged yet.</div>
          ) : (
            recentActivity.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-200">
                    {a.businessName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(a.createdAt).toLocaleString()} · {a.outcome}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
