"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus, Trash2 } from "lucide-react";

type Row = {
  id: string;
  name: string;
  slug: string;
  passcode: string;
  commissionPct: number;
  active: boolean;
  callsCount: number;
  dealsCount: number;
  commissionOwed: number;
  commissionPaid: number;
  createdAt: string;
};

export function AffiliateAdmin({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [name, setName] = useState("");
  const [pct, setPct] = useState(30);
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    const res = await fetch("/api/affiliates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), commissionPct: pct }),
    });
    setBusy(false);
    if (!res.ok) return;
    setName("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete affiliate? Their calls & deals will be removed.")) return;
    const res = await fetch(`/api/affiliates/${id}`, { method: "DELETE" });
    if (res.ok) setRows(rows.filter((r) => r.id !== id));
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/affiliates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setRows(rows.map((r) => (r.id === id ? { ...r, active } : r)));
  }

  function loginLink(r: Row): string {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/a/${r.slug}?code=${r.passcode}`;
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">New affiliate</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-500">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-64 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-slate-500">Commission %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={pct}
              onChange={(e) => setPct(Number(e.target.value) || 0)}
              className="w-24 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <button
            onClick={create}
            disabled={busy || !name.trim()}
            className="flex items-center gap-1.5 rounded-md bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            {busy ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5">
          <h2 className="text-sm font-semibold text-slate-800">
            {rows.length} affiliate{rows.length === 1 ? "" : "s"}
          </h2>
        </div>
        {rows.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No affiliates yet. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{r.name}</span>
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {r.commissionPct}%
                      </span>
                      {!r.active && (
                        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                          inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">/a/{r.slug}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="flex items-center gap-1 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={r.active}
                        onChange={(e) => toggleActive(r.id, e.target.checked)}
                      />
                      active
                    </label>
                    <button
                      onClick={() => remove(r.id)}
                      className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Calls" value={String(r.callsCount)} />
                  <Stat label="Deals" value={String(r.dealsCount)} />
                  <Stat
                    label="Owed"
                    value={`$${r.commissionOwed.toFixed(2)}`}
                    tone={r.commissionOwed > 0 ? "warn" : undefined}
                  />
                  <Stat label="Paid" value={`$${r.commissionPaid.toFixed(2)}`} />
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
                      {loginLink(r)}
                    </code>
                    <button
                      onClick={() => copy(loginLink(r))}
                      className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                      title="Copy login link"
                    >
                      <Copy className="h-3 w-3" /> Link
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
                      passcode: {r.passcode}
                    </code>
                    <button
                      onClick={() => copy(r.passcode)}
                      className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                    >
                      <Copy className="h-3 w-3" /> Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={`text-sm font-semibold ${
          tone === "warn" ? "text-amber-700" : "text-slate-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
