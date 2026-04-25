"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, RefreshCcw } from "lucide-react";

type Event = {
  id: string;
  type: string;
  title: string;
  details: Record<string, unknown> | null;
  createdAt: string;
};

export function BusinessActivityFeed({
  businessId,
  refreshKey,
}: {
  businessId: string;
  refreshKey?: number;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/businesses/${businessId}/activity`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setEvents(j.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="rounded-md border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Build Activity
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 disabled:opacity-50"
        >
          <RefreshCcw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="px-3 py-2 text-[11px] text-rose-400">{error}</div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="px-3 py-3 text-[11px] text-slate-500">
          No activity yet — run Enrich or Build mockup to see logs here.
        </div>
      )}

      <ul className="max-h-[280px] overflow-y-auto scrollbar-thin">
        {events.map((e) => {
          const level = (e.details?.level as string | undefined) ?? "info";
          const isOpen = !!expanded[e.id];
          const hasDetails =
            e.details &&
            Object.keys(e.details).filter(
              (k) => k !== "scrapedBusinessId" && k !== "level",
            ).length > 0;
          return (
            <li
              key={e.id}
              className="border-b border-slate-900 last:border-b-0 px-3 py-2"
            >
              <button
                onClick={() => setExpanded((m) => ({ ...m, [e.id]: !isOpen }))}
                disabled={!hasDetails}
                className="flex w-full items-start gap-2 text-left"
              >
                <span
                  className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    level === "error"
                      ? "bg-rose-500"
                      : level === "warn"
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[10px] text-slate-500">
                      {e.type}
                    </span>
                    <span className="font-mono text-[10px] text-slate-600">
                      {new Date(e.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-slate-200">
                    {e.title}
                  </div>
                </div>
                {hasDetails && (
                  <span className="mt-0.5 text-slate-500">
                    {isOpen ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </span>
                )}
              </button>
              {isOpen && hasDetails && (
                <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-2 text-[10px] leading-snug text-slate-400 scrollbar-thin">
                  {JSON.stringify(
                    Object.fromEntries(
                      Object.entries(e.details ?? {}).filter(
                        ([k]) => k !== "scrapedBusinessId" && k !== "level",
                      ),
                    ),
                    null,
                    2,
                  )}
                </pre>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
