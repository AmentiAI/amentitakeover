"use client";

import { useMemo, useState } from "react";
import { Copy, ExternalLink, Loader2, PlayCircle, ShieldAlert } from "lucide-react";

export type SubmissionRow = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  industry: string | null;
  website: string | null;
  hasForm: boolean;
  formFieldCount: number;
  formHasMessage: boolean;
  formCaptcha: string | null;
  formPageUrl: string | null;
  // How many additional ScrapedBusiness rows pointed at the exact same
  // form pageUrl and were folded into this canonical row. 1 == this is
  // the only entry. Surfaced as a "+N branches" chip so the operator can
  // tell a row covers multiple GMB locations of one franchise.
  branchCount: number;
};

// Per-row dry-run state, accumulated as the bulk run progresses.
type RowResult = {
  status: "idle" | "running" | "ok" | "error";
  // What the form-replay layer mapped from prefill.
  submittedFields?: { name: string; type: string; valuePreview: string }[];
  // What it couldn't fill — these are the entries we want to surface
  // and feed back into prefill.fieldOverrides.
  unmatchedRequiredFields?: { name: string; type: string; label?: string }[];
  error?: string;
};

// Aggregated view of every unmatched field across the run, keyed by a
// normalized (lowercased + trimmed) name so "Email" and "email" don't show
// up as two separate gaps.
type AggregatedField = {
  key: string;
  name: string;
  type: string;
  label: string | null;
  count: number;
  // Sample of business names that hit this field — useful when copy/pasting
  // the list to chat to give context like "this is a 'topic' dropdown on
  // Wix sites." Capped at 3 so the JSON stays readable.
  sampleBusinesses: string[];
};

const CONCURRENCY = 4;

export function SubmissionsTable({ rows }: { rows: SubmissionRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, RowResult>>({});
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const eligibleSelected = useMemo(
    () => rows.filter((r) => selected.has(r.id) && r.hasForm),
    [rows, selected],
  );

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  }

  async function dryRunSelected() {
    if (running || eligibleSelected.length === 0) return;
    const ids = eligibleSelected.map((r) => r.id);
    setRunning(true);
    setProgress({ done: 0, total: ids.length });
    setResults((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = { status: "running" }));
      return next;
    });

    let cursor = 0;
    let completed = 0;
    const worker = async () => {
      while (true) {
        const i = cursor++;
        if (i >= ids.length) return;
        const id = ids[i];
        try {
          const res = await fetch(
            `/api/outreach/businesses/${id}/submit-form`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dryRun: true }),
            },
          );
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setResults((prev) => ({
              ...prev,
              [id]: {
                status: "error",
                error: body.error ?? `HTTP ${res.status}`,
              },
            }));
          } else {
            const body = await res.json();
            setResults((prev) => ({
              ...prev,
              [id]: {
                status: "ok",
                submittedFields: body.submittedFields ?? [],
                unmatchedRequiredFields: body.unmatchedRequiredFields ?? [],
              },
            }));
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "request failed";
          setResults((prev) => ({
            ...prev,
            [id]: { status: "error", error: msg },
          }));
        }
        completed++;
        setProgress({ done: completed, total: ids.length });
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setRunning(false);
    setProgress(null);
  }

  // Aggregate every unmatched field across the rows we've actually run, so
  // the operator sees "phone-2 is missing on 27 sites" instead of having to
  // eyeball each row. Order: most-frequent first, since wide-impact fields
  // are the ones worth fixing in prefill first.
  const { aggregated, runStats } = useMemo(() => {
    const byKey = new Map<string, AggregatedField>();
    let okCount = 0;
    let errCount = 0;
    let coveredCount = 0; // ok runs with zero unmatched fields
    for (const row of rows) {
      const r = results[row.id];
      if (!r || r.status === "idle" || r.status === "running") continue;
      if (r.status === "error") {
        errCount++;
        continue;
      }
      okCount++;
      const unmatched = r.unmatchedRequiredFields ?? [];
      if (unmatched.length === 0) coveredCount++;
      for (const f of unmatched) {
        const key = `${(f.name ?? "").trim().toLowerCase()}|${f.type}`;
        const existing = byKey.get(key);
        if (existing) {
          existing.count++;
          if (existing.sampleBusinesses.length < 3) {
            existing.sampleBusinesses.push(row.name);
          }
        } else {
          byKey.set(key, {
            key,
            name: f.name ?? "",
            type: f.type,
            label: f.label ?? null,
            count: 1,
            sampleBusinesses: [row.name],
          });
        }
      }
    }
    const list = Array.from(byKey.values()).sort((a, b) => b.count - a.count);
    return {
      aggregated: list,
      runStats: { okCount, errCount, coveredCount },
    };
  }, [rows, results]);

  const coveragePct =
    runStats.okCount > 0
      ? Math.round((runStats.coveredCount / runStats.okCount) * 100)
      : null;

  // Markdown blob the operator pastes into chat: I respond with proposed
  // values for each missing field, they go to /outreach/prefill and add
  // them to fieldOverrides. Re-run, repeat.
  const aggregatedMarkdown = useMemo(() => {
    if (aggregated.length === 0) return "";
    const lines: string[] = [];
    lines.push(
      `# Unmapped form fields (${aggregated.length} unique, across ${runStats.okCount} dry-runs)`,
    );
    lines.push("");
    for (const f of aggregated) {
      lines.push(`## \`${f.name}\` (${f.type}) — ${f.count} site(s)`);
      if (f.label) lines.push(`- Label: ${f.label}`);
      if (f.sampleBusinesses.length > 0) {
        lines.push(`- Sample businesses: ${f.sampleBusinesses.join(", ")}`);
      }
      lines.push("");
    }
    return lines.join("\n");
  }, [aggregated, runStats.okCount]);

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(aggregatedMarkdown);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      // ignore — most browsers only block clipboard outside HTTPS
    }
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-4 py-2 backdrop-blur">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-white">{selected.size}</span>{" "}
            selected
            {progress && (
              <span className="ml-2 text-[11px] text-slate-400">
                · dry-running {progress.done}/{progress.total}
              </span>
            )}
            {!running && eligibleSelected.length < selected.size && (
              <span className="ml-2 text-[11px] text-amber-300">
                · {selected.size - eligibleSelected.length} skipped (no form)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              disabled={running}
              className="rounded-md border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Clear
            </button>
            <button
              onClick={dryRunSelected}
              disabled={running || eligibleSelected.length === 0}
              title="Build the form payload for each selected business — no submission. Aggregates required fields prefill couldn't fill."
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {running ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <PlayCircle className="h-3 w-3" />
              )}
              Dry-run selected
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto scrollbar-thin">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-950 text-left text-[10px] uppercase tracking-wider text-slate-500">
            <tr className="border-b border-slate-800">
              <th className="w-8 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="px-3 py-2">Business</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Industry</th>
              <th className="px-3 py-2">Form</th>
              <th className="px-3 py-2">Dry-run</th>
              <th className="w-10 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                  No matching businesses for this scope.
                </td>
              </tr>
            )}
            {rows.map((b) => {
              const isChecked = selected.has(b.id);
              const r = results[b.id];
              const loc = [b.city, b.state].filter(Boolean).join(", ") || "—";
              return (
                <tr
                  key={b.id}
                  className={`border-b border-slate-800 hover:bg-slate-800/40 ${
                    isChecked ? "bg-indigo-500/5" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(b.id)}
                      aria-label={`Select ${b.name}`}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-100">
                    <div className="flex items-center gap-2">
                      <span>{b.name}</span>
                      {b.branchCount > 1 && (
                        <span
                          title={`${b.branchCount - 1} other location row${b.branchCount - 1 === 1 ? "" : "s"} share this exact contact form — folded in to avoid duplicate submissions. Use 'All branches' to see them.`}
                          className="shrink-0 rounded-full border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[10px] text-violet-200"
                        >
                          +{b.branchCount - 1} branch
                          {b.branchCount - 1 === 1 ? "" : "es"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-400">{loc}</td>
                  <td className="px-3 py-2 text-slate-400">
                    {b.industry ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <FormPill row={b} />
                  </td>
                  <td className="px-3 py-2">
                    <DryRunCell result={r} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    {b.formPageUrl && (
                      <a
                        href={b.formPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open form page"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Aggregated unmapped-fields panel — shows after the first dry-run
          finishes. Operator hits "Copy" and pastes into chat for proposed
          prefill values, then drops them into /outreach/prefill. */}
      {aggregated.length > 0 && (
        <div className="border-t border-slate-800 bg-slate-950/60 p-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Unmapped required fields
              </div>
              <div className="mt-0.5 text-xs text-slate-300">
                {aggregated.length} unique field
                {aggregated.length === 1 ? "" : "s"} across{" "}
                {runStats.okCount} successful dry-run
                {runStats.okCount === 1 ? "" : "s"}
                {runStats.errCount > 0 && (
                  <>
                    {" · "}
                    <span className="text-rose-300">
                      {runStats.errCount} error
                      {runStats.errCount === 1 ? "" : "s"}
                    </span>
                  </>
                )}
                {coveragePct !== null && (
                  <>
                    {" · "}
                    <span
                      className={
                        coveragePct === 100
                          ? "text-emerald-300"
                          : coveragePct >= 80
                            ? "text-amber-300"
                            : "text-rose-300"
                      }
                    >
                      {coveragePct}% coverage
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={copyMarkdown}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
            >
              <Copy className="h-3 w-3" />
              {copyState === "copied" ? "Copied" : "Copy as markdown"}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {aggregated.map((f) => (
              <div
                key={f.key}
                className="rounded-md border border-slate-800 bg-slate-900/60 p-3 text-[12px]"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <code className="truncate font-mono text-[12px] text-emerald-300">
                    {f.name || "(unnamed)"}
                  </code>
                  <span className="shrink-0 rounded-full border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">
                    {f.type}
                  </span>
                </div>
                {f.label && (
                  <div className="mt-1 truncate text-[11px] text-slate-300">
                    {f.label}
                  </div>
                )}
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {f.count} site{f.count === 1 ? "" : "s"}
                  </span>
                  {f.sampleBusinesses[0] && (
                    <span className="truncate text-right">
                      e.g. {f.sampleBusinesses[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FormPill({ row }: { row: SubmissionRow }) {
  if (!row.hasForm) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-500">
        none
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300">
        {row.formFieldCount} fields
      </span>
      {row.formHasMessage ? (
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300">
          msg
        </span>
      ) : (
        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-300">
          no-msg
        </span>
      )}
      {row.formCaptcha && (
        <span
          className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300"
          title={`Gated by ${row.formCaptcha}`}
        >
          <ShieldAlert className="h-3 w-3" />
          {row.formCaptcha}
        </span>
      )}
    </div>
  );
}

function DryRunCell({ result }: { result?: RowResult }) {
  if (!result || result.status === "idle") {
    return <span className="text-[11px] text-slate-500">—</span>;
  }
  if (result.status === "running") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
        <Loader2 className="h-3 w-3 animate-spin" /> running
      </span>
    );
  }
  if (result.status === "error") {
    return (
      <span
        title={result.error}
        className="rounded-full border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-300"
      >
        error
      </span>
    );
  }
  const submitted = result.submittedFields?.length ?? 0;
  const unmatched = result.unmatchedRequiredFields?.length ?? 0;
  if (unmatched === 0) {
    return (
      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300">
        ✓ {submitted} mapped
      </span>
    );
  }
  return (
    <span
      title={(result.unmatchedRequiredFields ?? [])
        .map((f) => `${f.name}${f.label ? ` (${f.label})` : ""}`)
        .join(", ")}
      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300"
    >
      {submitted} mapped · {unmatched} missing
    </span>
  );
}
