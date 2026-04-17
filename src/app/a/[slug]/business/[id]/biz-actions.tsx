"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, DollarSign } from "lucide-react";

const OUTCOMES = [
  { key: "dialed", label: "Dialed" },
  { key: "connected", label: "Connected" },
  { key: "voicemail", label: "Voicemail" },
  { key: "no_answer", label: "No answer" },
  { key: "bad_number", label: "Bad number" },
];

export function BizActions({
  businessId,
  phone,
  name,
}: {
  businessId: string;
  phone: string | null;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function logCall(outcome: string) {
    setBusy(outcome);
    await fetch("/api/affiliate/call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scrapedBusinessId: businessId, outcome }),
    });
    setBusy(null);
    router.refresh();
  }

  async function logDeal() {
    const input = prompt(`Deal value for ${name}? (in dollars)`);
    if (!input) return;
    const dealValue = Number(input.replace(/[$,]/g, ""));
    if (!Number.isFinite(dealValue) || dealValue <= 0) {
      alert("Invalid amount");
      return;
    }
    setBusy("deal");
    const res = await fetch("/api/affiliate/deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scrapedBusinessId: businessId, dealValue }),
    });
    setBusy(null);
    if (!res.ok) {
      alert("Failed to log deal");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {phone && (
          <a
            href={`tel:${phone.replace(/[^+\d]/g, "")}`}
            onClick={() => logCall("dialed")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 sm:flex-none sm:py-1.5"
          >
            <Phone className="h-3.5 w-3.5" /> Call {phone}
          </a>
        )}
        <button
          onClick={logDeal}
          disabled={busy === "deal"}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50 sm:flex-none sm:py-1.5"
        >
          <DollarSign className="h-3.5 w-3.5" />
          {busy === "deal" ? "..." : "Log deal"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          Outcome:
        </span>
        {OUTCOMES.map((o) => (
          <button
            key={o.key}
            onClick={() => logCall(o.key)}
            disabled={busy === o.key}
            className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-[11px] font-medium text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-50"
          >
            {busy === o.key ? "..." : o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
