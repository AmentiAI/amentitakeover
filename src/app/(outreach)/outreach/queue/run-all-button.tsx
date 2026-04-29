"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";

// Walks the queued businesses and runs each through enrich → build. Enrich
// is skipped when a row is already audited (its Site row exists) — that's
// the common case after the operator's already poked around. Concurrency is
// capped at 2 because build invokes the LLM rebuilder; fanning out 50 of
// them at once would burn through quota fast.
export function RunAllButton({
  items,
}: {
  items: { id: string; audited: boolean; name: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number } | null>(
    null,
  );
  const [errorPreview, setErrorPreview] = useState<string | null>(null);

  async function runAll() {
    if (busy || items.length === 0) return;
    setBusy(true);
    setProgress({ done: 0, total: items.length, failed: 0 });
    setErrorPreview(null);
    const CONCURRENCY = 5;
    let cursor = 0;
    let completed = 0;
    let failed = 0;
    let lastError: string | null = null;

    const worker = async () => {
      while (true) {
        const i = cursor++;
        if (i >= items.length) return;
        const item = items[i];
        try {
          if (!item.audited) {
            const enrich = await fetch(
              `/api/outreach/businesses/${item.id}/enrich`,
              { method: "POST" },
            );
            if (!enrich.ok) {
              const j = await enrich.json().catch(() => ({}));
              throw new Error(`enrich: ${j.error ?? enrich.status}`);
            }
          }
          const build = await fetch(`/api/outreach/businesses/${item.id}/build`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          if (!build.ok) {
            const j = await build.json().catch(() => ({}));
            throw new Error(`build: ${j.error ?? build.status}`);
          }
          completed++;
        } catch (err) {
          failed++;
          lastError = `${item.name}: ${err instanceof Error ? err.message : String(err)}`;
        }
        setProgress({ done: completed, total: items.length, failed });
        if (lastError) setErrorPreview(lastError);
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    // Brief delay so the operator sees the final "X/Y" before the page
    // refresh wipes the counter.
    setTimeout(() => {
      setBusy(false);
      setProgress(null);
      router.refresh();
    }, 1200);
  }

  if (items.length === 0) {
    return (
      <div className="text-[11px] text-slate-500">Nothing queued.</div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {progress && (
        <div className="text-[11px] text-slate-400">
          {progress.done}/{progress.total} done
          {progress.failed > 0 && (
            <span className="ml-1 text-rose-400">· {progress.failed} failed</span>
          )}
          {errorPreview && (
            <span
              title={errorPreview}
              className="ml-2 max-w-[280px] truncate text-rose-400/80"
            >
              {errorPreview}
            </span>
          )}
        </div>
      )}
      <button
        onClick={runAll}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        {busy ? "Running" : `Run all (${items.length})`}
      </button>
    </div>
  );
}
