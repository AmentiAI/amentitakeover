"use client";
import { useState } from "react";
import { Star } from "lucide-react";
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
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div>
      <div className="overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-950 text-left text-[10px] uppercase tracking-wider text-slate-500">
            <tr className="border-b border-slate-800">
              <th className="w-8 px-3 py-2"><input type="checkbox" /></th>
              <th className="px-3 py-2">Business Name</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Industry</th>
              <th className="px-3 py-2">Rating</th>
              <th className="px-3 py-2">Reviews</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Flags</th>
            </tr>
          </thead>
          <tbody>
            {businesses.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                  No businesses yet. Run a scrape above.
                </td>
              </tr>
            )}
            {businesses.map((b) => (
              <tr
                key={b.id}
                onClick={() => setActiveId(b.id)}
                className="cursor-pointer border-b border-slate-800 hover:bg-slate-800/40"
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" />
                </td>
                <td className="px-3 py-2 font-medium text-slate-100">{b.name}</td>
                <td className="px-3 py-2 text-slate-400">
                  {[b.city, b.state].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-3 py-2 text-slate-400">{b.industry ?? "—"}</td>
                <td className="px-3 py-2 text-slate-300">
                  {b.rating != null ? (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {b.rating.toFixed(1)}
                    </span>
                  ) : "—"}
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
              </tr>
            ))}
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
