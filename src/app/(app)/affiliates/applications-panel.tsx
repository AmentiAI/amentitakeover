"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  experience: string | null;
  why: string | null;
  status: string;
  createdAt: string;
};

export function ApplicationsPanel({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pct, setPct] = useState<Record<string, number>>({});

  const pending = rows.filter((r) => r.status === "pending");
  const reviewed = rows.filter((r) => r.status !== "pending");

  async function approve(id: string) {
    setBusy(id);
    const commissionPct = pct[id] ?? 30;
    const res = await fetch(`/api/affiliates/applications/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", commissionPct }),
    });
    setBusy(null);
    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
      router.refresh();
    }
  }

  async function reject(id: string) {
    setBusy(id);
    const res = await fetch(`/api/affiliates/applications/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    setBusy(null);
    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this application?")) return;
    const res = await fetch(`/api/affiliates/applications/${id}`, { method: "DELETE" });
    if (res.ok) setRows((rs) => rs.filter((r) => r.id !== id));
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-800">
          Applications
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              {pending.length} pending
            </span>
          )}
        </h2>
      </div>
      {rows.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-500">
          No applications yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {[...pending, ...reviewed].map((r) => (
            <Row
              key={r.id}
              r={r}
              expanded={expanded === r.id}
              onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
              pct={pct[r.id] ?? 30}
              onPct={(v) => setPct((p) => ({ ...p, [r.id]: v }))}
              busy={busy === r.id}
              onApprove={() => approve(r.id)}
              onReject={() => reject(r.id)}
              onDelete={() => remove(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({
  r,
  expanded,
  onToggle,
  pct,
  onPct,
  busy,
  onApprove,
  onReject,
  onDelete,
}: {
  r: Row;
  expanded: boolean;
  onToggle: () => void;
  pct: number;
  onPct: (v: number) => void;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const statusBadge =
    r.status === "pending"
      ? "bg-amber-100 text-amber-800"
      : r.status === "approved"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-slate-200 text-slate-600";
  return (
    <div className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          <span className="mt-0.5 text-slate-400">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{r.name}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusBadge}`}>
                {r.status}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
              <span>{r.email}</span>
              {r.phone && <span>{r.phone}</span>}
              {(r.city || r.state) && (
                <span>{[r.city, r.state].filter(Boolean).join(", ")}</span>
              )}
              <span className="text-slate-400">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1.5">
          {r.status === "pending" ? (
            <>
              <div className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600">
                <span>Commission</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={pct}
                  onChange={(e) => onPct(Number(e.target.value) || 0)}
                  className="w-12 rounded border border-slate-200 bg-white px-1 py-0.5 text-right text-[11px] outline-none focus:border-brand-500"
                />
                <span>%</span>
              </div>
              <button
                onClick={onApprove}
                disabled={busy}
                className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" /> Approve
              </button>
              <button
                onClick={onReject}
                disabled={busy}
                className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" /> Reject
              </button>
            </>
          ) : (
            <button
              onClick={onDelete}
              className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 grid gap-3 rounded-md bg-slate-50 p-3 text-xs sm:grid-cols-2">
          {r.company && <Field label="Company" value={r.company} />}
          {r.experience && <Field label="Experience" value={r.experience} />}
          {r.why && <Field label="Why join" value={r.why} />}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 whitespace-pre-wrap text-slate-700">{value}</div>
    </div>
  );
}
