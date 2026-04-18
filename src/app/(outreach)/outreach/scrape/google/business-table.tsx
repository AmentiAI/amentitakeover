"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, Trash2 } from "lucide-react";
import { BusinessDrawer } from "@/components/business-drawer";

export type Row = {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  state: string | null;
  industry: string | null;
  rating: number | null;
  reviews: number;
  confidence: number;
  enriched: boolean;
  qualified: boolean;
  hasEmail: boolean;
  hasWebsite: boolean;
};

export function BusinessTable({ businesses }: { businesses: Row[] }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  const visible = useMemo(
    () => businesses.filter((b) => !hiddenIds.has(b.id)),
    [businesses, hiddenIds],
  );
  const allChecked = visible.length > 0 && visible.every((b) => selected.has(b.id));

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
    else setSelected(new Set(visible.map((b) => b.id)));
  }

  async function deleteOne(id: string) {
    if (rowBusy) return;
    setRowBusy(id);
    try {
      const res = await fetch(`/api/outreach/businesses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      setHiddenIds((prev) => new Set(prev).add(id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {
      alert("Couldn't delete that business — try again.");
    } finally {
      setRowBusy(null);
      router.refresh();
    }
  }

  async function deleteSelected() {
    if (bulkBusy || selected.size === 0) return;
    const ids = Array.from(selected);
    if (!confirm(`Remove ${ids.length} business${ids.length === 1 ? "" : "es"}?`))
      return;
    setBulkBusy(true);
    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/outreach/businesses/${id}`, { method: "DELETE" }),
        ),
      );
      const ok = new Set<string>();
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value.ok) ok.add(ids[i]);
      });
      setHiddenIds((prev) => {
        const next = new Set(prev);
        ok.forEach((id) => next.add(id));
        return next;
      });
      setSelected(new Set());
    } finally {
      setBulkBusy(false);
      router.refresh();
    }
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-2 backdrop-blur">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-white">{selected.size}</span>{" "}
            selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-md border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
            >
              Clear
            </button>
            <button
              onClick={deleteSelected}
              disabled={bulkBusy}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
            >
              {bulkBusy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Remove selected
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
              <th className="px-3 py-2">Business Name</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Industry</th>
              <th className="px-3 py-2">Rating</th>
              <th className="px-3 py-2">Reviews</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Flags</th>
              <th className="w-10 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center text-slate-500">
                  No businesses yet. Run a scrape above.
                </td>
              </tr>
            )}
            {visible.map((b) => {
              const isChecked = selected.has(b.id);
              const isBusy = rowBusy === b.id;
              return (
                <tr
                  key={b.id}
                  onClick={() => setActiveId(b.id)}
                  className={`group cursor-pointer border-b border-slate-800 hover:bg-slate-800/40 ${
                    isChecked ? "bg-indigo-500/5" : ""
                  }`}
                >
                  <td
                    className="px-3 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(b.id)}
                      aria-label={`Select ${b.name}`}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-100">
                    {b.name}
                  </td>
                  <td className="px-3 py-2 text-slate-400">
                    {[b.city, b.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-400">
                    {b.industry ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {b.rating != null ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {b.rating.toFixed(1)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-400">{b.reviews || 0}</td>
                  <td className="px-3 py-2">
                    <ConfBar value={b.confidence} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {b.hasWebsite && <Badge color="sky">Web</Badge>}
                      {b.hasEmail && <Badge color="teal">Email</Badge>}
                      {b.enriched && <Badge color="emerald">Enriched</Badge>}
                      {b.qualified && <Badge color="violet">Qualified</Badge>}
                    </div>
                  </td>
                  <td
                    className="px-3 py-2 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => deleteOne(b.id)}
                      disabled={isBusy}
                      title="Remove business"
                      aria-label={`Remove ${b.name}`}
                      className="grid h-7 w-7 place-items-center rounded-md border border-transparent text-slate-500 opacity-0 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 group-hover:opacity-100 disabled:opacity-60"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <BusinessDrawer
        businessId={activeId}
        onClose={() => setActiveId(null)}
      />
    </div>
  );
}

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "sky" | "teal" | "emerald" | "violet";
}) {
  const map: Record<string, string> = {
    sky: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    teal: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  };
  return (
    <span className={`rounded-full border px-1.5 py-0.5 text-[10px] ${map[color]}`}>
      {children}
    </span>
  );
}

function ConfBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const color =
    pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded bg-slate-800">
        <div className={`h-1.5 rounded ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-slate-400">{pct}%</span>
    </div>
  );
}
