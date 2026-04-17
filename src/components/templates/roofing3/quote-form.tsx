"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function QuoteForm3({
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
      <div className="rounded-sm border border-white/10 bg-white/[0.03] p-10 text-center">
        <div
          className="mx-auto grid h-12 w-12 place-items-center rounded-full"
          style={{ background: `${accent}22`, color: accent }}
        >
          <Check className="h-5 w-5" />
        </div>
        <div className="mt-6 text-2xl text-white">Request received.</div>
        <div className="mt-2 text-sm text-white/60">
          A project manager will call within the hour to schedule your inspection.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]"
    >
      <div className="grid gap-5 px-8 py-8 sm:grid-cols-2">
        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Smith"
            className="w-full border-0 border-b border-white/10 bg-transparent px-0 py-2 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/40"
          />
        </Field>
        <Field label="Phone">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            type="tel"
            placeholder="(555) 555-0123"
            className="w-full border-0 border-b border-white/10 bg-transparent px-0 py-2 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/40"
          />
        </Field>
        <Field label="ZIP code">
          <input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            required
            inputMode="numeric"
            placeholder="80205"
            className="w-full border-0 border-b border-white/10 bg-transparent px-0 py-2 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/40"
          />
        </Field>
        <Field label="Project type">
          <select
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            className="w-full border-0 border-b border-white/10 bg-transparent px-0 py-2 text-sm text-white outline-none transition focus:border-white/40"
          >
            <option className="bg-[#0b0b0c]">Full roof replacement</option>
            <option className="bg-[#0b0b0c]">Storm / hail damage inspection</option>
            <option className="bg-[#0b0b0c]">Leak repair</option>
            <option className="bg-[#0b0b0c]">Commercial roof</option>
            <option className="bg-[#0b0b0c]">Gutters</option>
            <option className="bg-[#0b0b0c]">Not sure yet</option>
          </select>
        </Field>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-white/[0.02] px-8 py-5">
        <p className="text-[11px] leading-relaxed text-white/40">
          No obligation. Most inspections scheduled within 48 hours.
        </p>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-black transition hover:brightness-110 disabled:opacity-60"
          style={{ background: accent }}
        >
          {state === "submitting" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
          {state === "submitting" ? "Sending" : "Send request"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}
