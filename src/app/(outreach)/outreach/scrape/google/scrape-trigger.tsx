"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { INDUSTRIES, US_STATES } from "@/lib/industries";
import { Loader2, Play, Radio, Zap } from "lucide-react";

export function ScrapeTrigger({ serpApiReady = false }: { serpApiReady?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [industry, setIndustry] = useState("Plumbing");
  const [state, setState] = useState("CA");
  const [city, setCity] = useState("Los Angeles");
  const [count, setCount] = useState(20);
  const [live, setLive] = useState(serpApiReady);
  const [deepScrape, setDeepScrape] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function run() {
    if (!industry.trim()) {
      setStatus("Enter a business type");
      return;
    }
    setLoading(true);
    const loc = [city.trim(), state.trim()].filter(Boolean).join(", ");
    setStatus(`Searching Google for ${industry} in ${loc || "anywhere"}...`);
    try {
      const res = await fetch("/api/outreach/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "google",
          industry: industry.trim(),
          location: loc,
          count,
          live,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Scrape failed");
      const saved = data?.saved ?? 0;
      setStatus(`Saved ${saved} businesses${data?.live ? " (live)" : " (mock)"}`);

      if (deepScrape && data?.id && saved > 0) {
        setStatus(`Deep-scraping ${saved} websites...`);
        const batch = await fetch("/api/outreach/deep-scrape-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scrapeJobId: data.id, limit: saved }),
        });
        const bd = await batch.json();
        setStatus(`Done: ${bd.done} scraped, ${bd.failed} failed`);
      }

      router.refresh();
      setTimeout(() => {
        setOpen(false);
        setStatus(null);
      }, 2000);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Google Businesses</span>
          {serpApiReady ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
              <Radio className="h-2.5 w-2.5" /> SerpApi ready
            </span>
          ) : (
            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
              SerpApi key missing → mock
            </span>
          )}
          {status && <span className="text-slate-400">· {status}</span>}
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            <Play className="h-3.5 w-3.5" />
            New scrape
          </button>
        )}
      </div>

      {open && (
        <div className="rounded-md border border-slate-700 bg-slate-900 p-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Field label="Business type">
              <input
                list="industry-suggestions"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. HVAC, Bakery, Pilates"
                className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <datalist id="industry-suggestions">
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i} />
                ))}
              </datalist>
            </Field>

            <Field label="State">
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Any</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="City / town">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Austin"
                className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </Field>

            <Field label="How many">
              <input
                type="number"
                min={1}
                max={200}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
                className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </Field>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={live}
                  onChange={(e) => setLive(e.target.checked)}
                  disabled={!serpApiReady}
                  className="h-3 w-3 accent-indigo-500"
                />
                Live (SerpApi)
              </label>
              <label className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={deepScrape}
                  onChange={(e) => setDeepScrape(e.target.checked)}
                  className="h-3 w-3 accent-indigo-500"
                />
                Deep scrape site
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={run}
                disabled={loading || !industry.trim()}
                className="flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                {loading ? "Running..." : `Scrape ${count}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      {children}
    </label>
  );
}
