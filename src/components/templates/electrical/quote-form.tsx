"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function ElectricalQuoteForm({
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
  const [need, setNeed] = useState("Panel upgrade");
  const [urgency, setUrgency] = useState("This week");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state !== "idle") return;
    setState("submitting");
    try {
      await fetch("/api/templates/electrical/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessSlug, name, phone, zip, need, urgency }),
      }).catch(() => null);
      setState("done");
    } catch {
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-[4px] border border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-white">
          <Check className="h-5 w-5" style={{ color: accent }} />
        </div>
        <div className="mt-5 text-xl font-medium tracking-tight text-slate-900">
          Request received.
        </div>
        <div className="mt-2 text-sm text-slate-500">
          A licensed electrician will call within the hour to schedule dispatch.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="overflow-hidden rounded-[4px] border border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Request service
        </div>
        <div className="mt-2 text-2xl font-medium tracking-tight text-slate-900">
          Tell us what's going on
        </div>
      </div>
      <div className="grid gap-5 px-8 py-7 sm:grid-cols-2">
        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Smith"
            className="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900"
          />
        </Field>
        <Field label="Phone">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            type="tel"
            placeholder="(555) 555-0123"
            className="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900"
          />
        </Field>
        <Field label="ZIP code">
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            required
            inputMode="numeric"
            placeholder="80205"
            className="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900"
          />
        </Field>
        <Field label="Urgency">
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          >
            <option>Emergency — right now</option>
            <option>Today</option>
            <option>This week</option>
            <option>Planning ahead</option>
          </select>
        </Field>
        <Field label="What do you need?">
          <select
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            className="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 sm:col-span-2"
          >
            <option>Panel upgrade</option>
            <option>EV charger installation</option>
            <option>New circuit / outlet</option>
            <option>Lighting / LED retrofit</option>
            <option>Generator / backup power</option>
            <option>Troubleshooting</option>
            <option>Commercial work</option>
            <option>Not sure yet</option>
          </select>
        </Field>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-8 py-5">
        <p className="text-[11px] leading-relaxed text-slate-500">
          Licensed master electrician. Free phone consult. No obligation.
        </p>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[13px] font-medium text-white transition hover:brightness-110 disabled:opacity-60"
          style={{ background: accent, borderColor: accent }}
        >
          {state === "submitting" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {state === "submitting" ? "Sending" : "Request dispatch"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
