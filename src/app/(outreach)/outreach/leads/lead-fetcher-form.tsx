"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

type FetchResult = {
  ok?: boolean;
  dryRun?: boolean;
  rawCount: number;
  poolSize?: number;
  alreadyImported?: number;
  kept?: number;
  created?: number;
  updated?: number;
  sourceTag?: string;
  records: { name: string; website: string | null; city: string | null; state: string | null }[];
};

export function LeadFetcherForm({ knownIndustries }: { knownIndustries: string[] }) {
  const [industry, setIndustry] = useState("Pest Control");
  const [state, setState] = useState("NY");
  const [city, setCity] = useState("");
  const [count, setCount] = useState(50);
  const [busy, setBusy] = useState<"dry" | "live" | null>(null);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(dryRun: boolean) {
    if (busy) return;
    setBusy(dryRun ? "dry" : "live");
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/outreach/leads/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, state, city: city.trim() || undefined, count, dryRun }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setResult(j as FetchResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Field label="Industry" hint="Known industries get tag-precise queries">
            <input
              list="industry-suggestions"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Pest Control"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[13px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
            />
            <datalist id="industry-suggestions">
              {knownIndustries.map((i) => (
                <option key={i} value={i.replace(/\b\w/g, (m) => m.toUpperCase())} />
              ))}
            </datalist>
          </Field>
          <Field label="State" hint="Pick ALL to scan the whole US">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[13px] text-slate-100 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">ALL — entire USA</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="City (optional)">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Brooklyn"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[13px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </Field>
          <Field label={`How many (${count})`}>
            <input
              type="range"
              min={5}
              max={500}
              step={5}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => run(true)}
            disabled={busy !== null || !industry.trim() || !state.trim()}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-[12px] font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            {busy === "dry" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            Preview
          </button>
          <button
            onClick={() => run(false)}
            disabled={busy !== null || !industry.trim() || !state.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy === "live" ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
            Fetch {count} & import
          </button>
          {error && <span className="text-[11px] text-rose-400">{error}</span>}
        </div>
      </div>

      {result && (
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-[12px] text-slate-300">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {result.dryRun ? "Preview" : "Imported"}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px]">
            {result.poolSize !== undefined && (
              <Stat
                label="Total in OSM"
                value={result.poolSize}
                tooltip="Businesses with websites that match your filters in OSM. This is your full pool — repeat pulls draw from this same set."
              />
            )}
            {result.alreadyImported !== undefined && (
              <Stat
                label="Already imported"
                value={result.alreadyImported}
                accent={result.alreadyImported > 0 ? "amber" : undefined}
                tooltip="Already in your DB under this source tag"
              />
            )}
            <Stat
              label="Available"
              value={Math.max(0, (result.poolSize ?? 0) - (result.alreadyImported ?? 0))}
              tooltip="Pool size minus what's already imported — businesses you haven't pulled yet"
            />
            {!result.dryRun && (
              <Stat label="Created" value={result.created ?? 0} accent="emerald" />
            )}
            <Stat
              label="New this run"
              value={result.records.length}
              accent={result.records.length > 0 ? "emerald" : undefined}
              tooltip="Genuinely new businesses pulled this time"
            />
            {result.sourceTag && (
              <span className="font-mono text-[11px] text-slate-500">
                source: {result.sourceTag}
              </span>
            )}
          </div>

          {result.records.length === 0 ? (
            <div className="mt-3 rounded-md border border-amber-700/40 bg-amber-950/30 px-3 py-2 text-[11px] text-amber-200">
              {(result.alreadyImported ?? 0) > 0 ? (
                <>
                  <span className="font-semibold">No new leads available.</span>{" "}
                  Every match in the OSM pool ({result.poolSize ?? 0}) for these
                  filters has already been imported under{" "}
                  <code className="font-mono">{result.sourceTag}</code>. Try a
                  different city, a broader industry, or a different state to
                  find untouched rows.
                </>
              ) : (
                <>
                  No matching businesses with websites. Try a wider search
                  (drop the city, broader industry, or different state).
                </>
              )}
            </div>
          ) : (
            <ul className="mt-3 max-h-[400px] space-y-1 overflow-y-auto pr-1 scrollbar-thin">
              {result.records.map((r, i) => (
                <li key={`${r.name}-${i}`} className="flex items-baseline justify-between gap-3 border-b border-slate-900 py-1.5 last:border-b-0">
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-100">
                    {r.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {r.city ?? "?"}, {r.state ?? "?"}
                  </span>
                  {r.website && (
                    <a
                      href={r.website}
                      target="_blank"
                      rel="noreferrer"
                      className="max-w-[260px] truncate text-[11px] text-emerald-300 underline hover:text-emerald-200"
                    >
                      {r.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!result.dryRun && (result.created ?? 0) > 0 && (
            <div className="mt-4 rounded-md border border-emerald-700/40 bg-emerald-950/30 px-3 py-2 text-[12px]">
              <span className="font-semibold text-emerald-200">Next:</span>{" "}
              <a href="/outreach/queue" className="text-emerald-300 underline">
                head to Queue
              </a>{" "}
              and click <strong>Run all</strong> to scrape these.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {children}
      {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
    </label>
  );
}

function Stat({
  label,
  value,
  accent,
  tooltip,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "amber";
  tooltip?: string;
}) {
  const tone =
    accent === "emerald"
      ? "text-emerald-300"
      : accent === "amber"
        ? "text-amber-300"
        : "text-slate-200";
  return (
    <span title={tooltip}>
      <span className="text-slate-500">{label}: </span>
      <span className={`font-semibold ${tone}`}>{value}</span>
    </span>
  );
}
