"use client";
import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  ExternalLink,
  Eye,
  Loader2,
  MapPin,
  Phone,
  Plus,
  RefreshCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { LIFECYCLE, type LifecycleStep } from "@/lib/lifecycle";

type DetailData = {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  reviewsCount: number;
  notes: string | null;
  tags: string[];
  lat: number | null;
  lng: number | null;
  hasWebsite: boolean;
  audited: boolean;
  siteGenerated: boolean;
  emailReady: boolean;
  inCampaign: boolean;
  campaignComplete: boolean;
  inSales: boolean;
  closedWon: boolean;
};

export function BusinessDrawer({
  businessId,
  onClose,
}: {
  businessId: string | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<DetailData | null>(null);
  const [tab, setTab] = useState<"overview" | "notes">("overview");
  const [generating, setGenerating] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [syncedOppId, setSyncedOppId] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setData(null);
      return;
    }
    fetch(`/api/outreach/businesses/${businessId}`)
      .then((r) => r.json())
      .then(setData);
  }, [businessId]);

  async function runGenerate() {
    if (!data) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/outreach/businesses/${data.id}/generate`, {
        method: "POST",
      });
      const j = await res.json();
      setData(j);
    } finally {
      setGenerating(false);
    }
  }

  async function syncToCrm() {
    if (!data || syncState === "syncing") return;
    setSyncState("syncing");
    try {
      const res = await fetch(`/api/outreach/businesses/${data.id}/sync-crm`, {
        method: "POST",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "sync failed");
      setSyncedOppId(j.opportunityId ?? null);
      setSyncState("synced");
      setData({ ...data, inSales: true });
    } catch {
      setSyncState("error");
    }
  }

  async function archive() {
    if (!data) return;
    await fetch(`/api/outreach/businesses/${data.id}`, { method: "DELETE" });
    onClose();
  }

  if (!businessId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-2xl flex-col border-l border-slate-800 bg-slate-900 text-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!data ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 border-b border-slate-800 px-6 py-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-800">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-base font-semibold text-white">
                    {data.name}
                  </div>
                  <button className="text-slate-500 hover:text-slate-300">
                    <Trash2
                      onClick={archive}
                      className="h-4 w-4 text-rose-400"
                    />
                  </button>
                </div>
                <div className="text-xs text-slate-400">
                  {data.category ?? "—"}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {(data.city || data.state) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[data.city, data.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {data.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {data.phone}
                    </span>
                  )}
                  {data.rating != null && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {data.rating.toFixed(1)} ({data.reviewsCount} reviews)
                    </span>
                  )}
                  {data.lat != null && data.lng != null && (
                    <a
                      href={`https://www.google.com/maps/@${data.lat},${data.lng},17z`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
                    >
                      <MapPin className="h-3 w-3" />
                      Google Maps
                    </a>
                  )}
                  {syncState === "synced" || data.inSales ? (
                    <a
                      href={syncedOppId ? `/opportunities/${syncedOppId}` : `/companies`}
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="h-3 w-3" />
                      Synced to CRM
                    </a>
                  ) : (
                    <button
                      onClick={syncToCrm}
                      disabled={syncState === "syncing"}
                      className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 disabled:opacity-60"
                    >
                      {syncState === "syncing" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCcw className="h-3 w-3" />
                      )}
                      {syncState === "syncing"
                        ? "Syncing…"
                        : syncState === "error"
                          ? "Retry sync"
                          : "Sync to CRM"}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-slate-800 px-6">
              <div className="flex gap-4">
                {["overview", "notes"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t as any)}
                    className={`relative py-3 text-sm capitalize ${
                      tab === t ? "text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {t}
                    {tab === t && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 rounded bg-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
              {tab === "overview" ? (
                <Overview data={data} />
              ) : (
                <Notes id={data.id} initial={data.notes ?? ""} />
              )}
            </div>

            <div className="space-y-2 border-t border-slate-800 bg-slate-950 p-4">
              {generating ? (
                <div className="overflow-hidden rounded-md bg-gradient-to-r from-purple-600 via-fuchsia-500 to-rose-500 p-3 text-center text-xs font-medium text-white">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating…
                  </div>
                </div>
              ) : (
                <button
                  onClick={runGenerate}
                  disabled={!data.website}
                  className="w-full rounded-md bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {data.website ? "Audit + Generate rebuild" : "No website available to scrape"}
                </button>
              )}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`/p/roofing/${data.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-[11px] font-medium text-slate-300 hover:border-slate-600 hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Bold
                </a>
                <a
                  href={`/p/roofing2/${data.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-[11px] font-medium text-slate-300 hover:border-slate-600 hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Editorial
                </a>
                <a
                  href={`/p/electrical/${data.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-[11px] font-medium text-slate-300 hover:border-slate-600 hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Electrical
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Overview({ data }: { data: DetailData }) {
  return (
    <div className="space-y-6">
      <Section title="Business Details" action="Edit">
        {data.website ? (
          <a
            href={data.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
          >
            {data.website}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <div className="text-sm text-slate-500">No Website</div>
        )}
      </Section>

      <Section title="Tags">
        <div className="flex flex-wrap items-center gap-1">
          {data.tags.length === 0 && (
            <span className="text-xs text-slate-500">No tags yet</span>
          )}
          {data.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300"
            >
              {t}
            </span>
          ))}
          <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-700 px-2 py-0.5 text-[11px] text-slate-500 hover:text-slate-300">
            <Plus className="h-3 w-3" />
            Add tag
          </button>
        </div>
      </Section>

      <Section title="Contact Information">
        <div className="space-y-1 text-sm">
          {data.phone && (
            <a href={`tel:${data.phone}`} className="block text-sky-400 hover:text-sky-300">
              {data.phone}
            </a>
          )}
          {data.email && (
            <a
              href={`mailto:${data.email}`}
              className="block text-sky-400 hover:text-sky-300"
            >
              {data.email}
            </a>
          )}
          {!data.phone && !data.email && (
            <div className="text-slate-500">—</div>
          )}
        </div>
      </Section>

      <Section title="Lifecycle Progress">
        <ol className="space-y-2">
          {LIFECYCLE.map((step, i) => (
            <Step key={step.key} index={i + 1} step={step} done={(data as any)[step.key]} />
          ))}
        </ol>
      </Section>
    </div>
  );
}

function Step({
  index,
  step,
  done,
}: {
  index: number;
  step: LifecycleStep;
  done: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold ${
          done
            ? "bg-emerald-500/20 text-emerald-300"
            : "bg-slate-800 text-slate-500"
        }`}
      >
        {done ? "✓" : index}
      </span>
      <span className={`text-sm ${done ? "text-slate-100" : "text-slate-400"}`}>
        {step.label}
      </span>
    </li>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </div>
        {action && (
          <button className="text-[11px] text-slate-400 hover:text-white">
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Notes({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/outreach/businesses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={14}
        className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
      />
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
