"use client";
import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  ExternalLink,
  Eye,
  Loader2,
  MapPin,
  Palette,
  Phone,
  Plus,
  RefreshCcw,
  Sparkles,
  Star,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { LIFECYCLE, type LifecycleStep } from "@/lib/lifecycle";
import { TEMPLATE_CHOICES, type TemplateChoice } from "@/lib/site-url";

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

            <GenerateWizard
              business={data}
              onChange={(patch) => setData({ ...data, ...patch })}
            />
            </>
        )}
      </div>
    </div>
  );
}

type EnrichResult = {
  logo: string | null;
  ogImage: string | null;
  palette: string[];
  imagesCount: number;
  pagesScraped: number;
};

type ImageSet = {
  hero: { id: string; src: string } | null;
  gallery: { id: string; src: string }[];
};

function GenerateWizard({
  business,
  onChange,
}: {
  business: DetailData;
  onChange: (patch: Partial<DetailData>) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(business.audited ? (business.siteGenerated ? 3 : 2) : 1);
  const [enrichBusy, setEnrichBusy] = useState(false);
  const [enrichResult, setEnrichResult] = useState<EnrichResult | null>(null);
  const [imagesBusy, setImagesBusy] = useState(false);
  const [imageSet, setImageSet] = useState<ImageSet | null>(null);
  const [buildBusy, setBuildBusy] = useState(false);
  const [template, setTemplate] = useState<TemplateChoice>("roofing");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (business.audited) {
      fetch(`/api/outreach/businesses/${business.id}/images`)
        .then((r) => r.json())
        .then((j) => {
          if (j && (j.hero || j.gallery?.length)) setImageSet(j);
        })
        .catch(() => {});
    }
  }, [business.id, business.audited]);

  async function runEnrich() {
    setEnrichBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/businesses/${business.id}/enrich`, {
        method: "POST",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Enrich failed");
      setEnrichResult(j);
      onChange({ audited: true, hasWebsite: true });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrich failed");
    } finally {
      setEnrichBusy(false);
    }
  }

  async function runImages(force = false) {
    setImagesBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/businesses/${business.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Image generation failed");
      setImageSet({ hero: j.hero, gallery: j.gallery });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setImagesBusy(false);
    }
  }

  async function runBuild() {
    setBuildBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/businesses/${business.id}/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateChoice: template }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Build failed");
      setPreviewUrl(j.previewUrl);
      onChange({ siteGenerated: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Build failed");
    } finally {
      setBuildBusy(false);
    }
  }

  return (
    <div className="space-y-3 border-t border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <StepDot n={1} active={step === 1} done={business.audited} label="Enrich" />
        <StepSep />
        <StepDot n={2} active={step === 2} done={Boolean(imageSet?.hero)} label="Images" />
        <StepSep />
        <StepDot n={3} active={step === 3} done={business.siteGenerated} label="Build" />
      </div>

      {error && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            Scrape the prospect&apos;s site for logo, colors, and imagery. Required before we can style the mockup.
          </p>
          <button
            onClick={runEnrich}
            disabled={enrichBusy || !business.website}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {enrichBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scraping site…
              </>
            ) : (
              <>
                <Palette className="h-3.5 w-3.5" />
                {business.website ? "Scrape site for brand" : "No website to scrape"}
              </>
            )}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          {enrichResult && (
            <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/50 p-2">
              {enrichResult.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={enrichResult.logo}
                  alt="logo"
                  className="h-8 w-8 shrink-0 rounded bg-white object-contain"
                />
              )}
              <div className="flex flex-1 flex-wrap gap-1">
                {enrichResult.palette.slice(0, 8).map((c) => (
                  <span
                    key={c}
                    className="h-4 w-4 rounded border border-slate-700"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="text-[10px] text-slate-500">
                {enrichResult.imagesCount} imgs · {enrichResult.pagesScraped} pages
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400">
            AI generates 1 hero + 4 gallery images styled to this business (takes ~30-60s).
          </p>
          <button
            onClick={() => runImages(false)}
            disabled={imagesBusy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-fuchsia-600 to-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {imagesBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating images…
              </>
            ) : imageSet?.hero ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Continue to template
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate site images
              </>
            )}
          </button>
          {imageSet?.hero && (
            <div className="mt-1 flex gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSet.hero.src}
                alt="hero"
                className="h-14 w-20 rounded border border-slate-800 object-cover"
              />
              {imageSet.gallery.slice(0, 3).map((g) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={g.id}
                  src={g.src}
                  alt="gallery"
                  className="h-14 w-14 rounded border border-slate-800 object-cover"
                />
              ))}
              <button
                onClick={() => runImages(true)}
                disabled={imagesBusy}
                className="ml-auto inline-flex items-center gap-1 rounded border border-slate-700 px-2 text-[10px] text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCcw className="h-3 w-3" /> Regenerate
              </button>
            </div>
          )}
          {imageSet?.hero && step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              Skip to template →
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2">
          <div className="rounded-md border border-slate-800 bg-slate-900/50 p-2">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <Wand2 className="h-3 w-3" /> Choose template
            </div>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
              {TEMPLATE_CHOICES.map((t) => {
                const selected = template === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setTemplate(t.value)}
                    className={`rounded px-2 py-1.5 text-[11px] font-semibold transition ${
                      selected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-1.5 text-[10px] leading-snug text-slate-500">
              {TEMPLATE_CHOICES.find((t) => t.value === template)?.hint}
            </div>
          </div>
          <button
            onClick={runBuild}
            disabled={buildBusy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-emerald-600 to-cyan-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {buildBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Building…
              </>
            ) : (
              <>
                <Wand2 className="h-3.5 w-3.5" />
                Build mockup
              </>
            )}
          </button>
          {(previewUrl || business.siteGenerated) && (
            <a
              href={previewUrl ?? `/p/${template}/${business.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
            >
              <Eye className="h-3.5 w-3.5" /> Open preview
            </a>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              ← Back to images
            </button>
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300"
            >
              <RefreshCcw className="h-3 w-3" /> Re-scrape
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepDot({
  n,
  active,
  done,
  label,
}: {
  n: number;
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span
        className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
          done
            ? "bg-emerald-500/20 text-emerald-300"
            : active
              ? "bg-indigo-600 text-white"
              : "bg-slate-800 text-slate-500"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <span
        className={`text-[10px] ${
          active ? "text-white" : done ? "text-emerald-300" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function StepSep() {
  return <span className="h-px w-3 bg-slate-700" />;
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
