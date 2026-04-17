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
  Plus,
  X,
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
  const [showManualDeal, setShowManualDeal] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = businesses.filter((b) => !hiddenIds.has(b.id));
    if (!needle) return base;
    return base.filter((b) =>
      [b.name, b.industry, b.city, b.state]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(needle)),
    );
  }, [q, businesses, hiddenIds]);

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
    setHiddenIds((cur) => {
      const next = new Set(cur);
      next.add(biz.id);
      return next;
    });
    setExpanded((cur) => (cur === biz.id ? null : cur));
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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
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
          <button
            onClick={() => setShowManualDeal(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-500/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add deal
          </button>
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
                      onClick={() => logDeal(b)}
                      disabled={dealing === b.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      {dealing === b.id ? "..." : "Log deal"}
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

      {showManualDeal && (
        <ManualDealModal
          onClose={() => setShowManualDeal(false)}
          onSaved={() => {
            setShowManualDeal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function ManualDealModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = Number(dealValue.replace(/[$,]/g, ""));
    if (!name.trim()) {
      setError("Business name is required");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a valid deal value");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/affiliate/deal/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        email: email.trim() || undefined,
        industry: industry.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        dealValue: value,
        notes: notes.trim() || undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Failed to log deal");
      return;
    }
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-800 bg-slate-950 sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-white">Log a new deal</h2>
            <p className="text-[11px] text-slate-400">
              For businesses not already on your board.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <Field label="Business name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className={fieldInputClass}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Deal value ($)" required>
              <input
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                inputMode="decimal"
                placeholder="1500"
                required
                className={fieldInputClass}
              />
            </Field>
            <Field label="Industry">
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Roofing, HVAC, etc."
                className={fieldInputClass}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className={fieldInputClass}
              />
            </Field>
            <Field label="Email">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className={fieldInputClass}
              />
            </Field>
          </div>

          <Field label="Website">
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              className={fieldInputClass}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="City">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={fieldInputClass}
              />
            </Field>
            <Field label="State">
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="CA"
                className={fieldInputClass}
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
              className={`${fieldInputClass} resize-y`}
            />
          </Field>

          {error && (
            <p className="mt-2 text-xs text-rose-300">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <DollarSign className="h-3.5 w-3.5" />
            )}
            Log deal
          </button>
        </div>
      </form>
    </div>
  );
}

const fieldInputClass =
  "mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
        {required && <span className="ml-1 text-rose-400">*</span>}
      </span>
      {children}
    </label>
  );
}
