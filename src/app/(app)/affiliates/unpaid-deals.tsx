"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type UnpaidDeal = {
  id: string;
  affiliateName: string;
  businessName: string;
  dealValue: number;
  commissionPct: number;
  commissionDue: number;
  createdAt: string;
};

export function UnpaidDeals({ initial }: { initial: UnpaidDeal[] }) {
  const [deals, setDeals] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function markPaid(id: string) {
    setBusy(id);
    const res = await fetch(`/api/affiliates/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid: true }),
    });
    setBusy(null);
    if (res.ok) setDeals(deals.filter((d) => d.id !== id));
  }

  const totalOwed = deals.reduce((s, d) => s + d.commissionDue, 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-800">
          Unpaid commissions
        </h2>
        <span className="text-xs text-slate-500">
          ${totalOwed.toFixed(2)} across {deals.length} deal
          {deals.length === 1 ? "" : "s"}
        </span>
      </div>
      {deals.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-500">
          No pending commissions.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {deals.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900">
                  {d.businessName}
                </div>
                <div className="text-xs text-slate-500">
                  {d.affiliateName} · ${d.dealValue.toFixed(2)} ×{" "}
                  {d.commissionPct}% = ${d.commissionDue.toFixed(2)} ·{" "}
                  {new Date(d.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => markPaid(d.id)}
                disabled={busy === d.id}
                className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                {busy === d.id ? "..." : "Mark paid"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
