"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  total,
}: {
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [jumpValue, setJumpValue] = useState("");

  function goTo(p: number) {
    const sp = new URLSearchParams(params.toString());
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    router.push(`/outreach/scrape/google?${sp.toString()}`);
  }

  function onJumpSubmit(e: FormEvent) {
    e.preventDefault();
    const n = Number(jumpValue);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(1, Math.min(totalPages, Math.trunc(n)));
    goTo(clamped);
    setJumpValue("");
  }

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-end px-3 py-2 text-[11px] text-slate-500">
        {total} {total === 1 ? "result" : "results"}
      </div>
    );
  }

  // Build the visible page-number window. Always show 1 and totalPages, plus
  // a window of 2 either side of the current page. Use null to mark gaps.
  const window = new Set<number>([1, totalPages, page]);
  for (let d = 1; d <= 2; d++) {
    if (page - d >= 1) window.add(page - d);
    if (page + d <= totalPages) window.add(page + d);
  }
  const sorted = Array.from(window).sort((a, b) => a - b);
  const items: (number | null)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) items.push(null);
    items.push(sorted[i]);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-[11px] text-slate-400 sm:px-4">
      <div>
        Page <span className="font-semibold text-slate-200">{page}</span> of{" "}
        <span className="font-semibold text-slate-200">{totalPages}</span> ·{" "}
        <span className="text-slate-300">{total} results</span>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>
        {items.map((n, i) =>
          n === null ? (
            <span key={`gap-${i}`} className="px-1 text-slate-600">
              …
            </span>
          ) : (
            <button
              type="button"
              key={n}
              onClick={() => goTo(n)}
              className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded-md border px-2 transition ${
                n === page
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <form onSubmit={onJumpSubmit} className="ml-2 flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            placeholder="Go to"
            className="h-7 w-16 rounded-md border border-slate-700 bg-slate-900 px-2 text-slate-200 placeholder:text-slate-500"
          />
        </form>
      </div>
    </div>
  );
}
