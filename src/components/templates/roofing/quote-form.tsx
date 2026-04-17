"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function QuoteForm({
  accent,
  businessSlug,
}: {
  accent: string;
  businessSlug: string;
}) {
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [need, setNeed] = useState("Full roof replacement");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state !== "idle") return;
    setState("submitting");
    try {
      await fetch("/api/templates/roofing/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessSlug, name, phone, zip, need }),
      }).catch(() => null);
      setState("done");
    } catch {
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full" style={{ background: accent }}>
          <Check className="h-6 w-6 text-white" />
        </div>
        <div className="mt-4 text-lg font-semibold text-slate-900">Got it — we'll call within the hour.</div>
        <div className="mt-1 text-sm text-slate-500">Same-day inspection available in most areas.</div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.25)] sm:p-7"
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Free inspection</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          No-obligation quote in 60 seconds.
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </Field>
        <Field label="Phone">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            type="tel"
            placeholder="(555) 555-0123"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </Field>
        <Field label="ZIP">
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            required
            inputMode="numeric"
            placeholder="80205"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </Field>
        <Field label="What do you need?">
          <select
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option>Full roof replacement</option>
            <option>Storm / hail damage inspection</option>
            <option>Leak repair</option>
            <option>Commercial roof</option>
            <option>Gutters</option>
            <option>Not sure yet</option>
          </select>
        </Field>
      </div>
      <button
        type="submit"
        disabled={state === "submitting"}
        className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:brightness-110 disabled:opacity-60"
        style={{ background: accent }}
      >
        {state === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {state === "submitting" ? "Sending…" : "Book my free inspection"}
      </button>
      <div className="text-center text-[11px] text-slate-400">
        By submitting you agree to be contacted about your roof. No spam, ever.
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}
