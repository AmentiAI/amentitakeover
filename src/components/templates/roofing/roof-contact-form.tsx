"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Home, Send } from "lucide-react";
import { SafeImg } from "@/components/safe-img";
import type { SiteData } from "@/lib/templates/site";

type Props = {
  business: SiteData["business"];
};

const ROOF_TYPES = [
  "Asphalt shingle",
  "Metal / standing seam",
  "Tile (clay / concrete)",
  "Flat / low-slope (TPO, EPDM)",
  "Cedar shake",
  "Not sure",
];

const PROJECT_TYPES = [
  "Full replacement",
  "Repair / leak",
  "Storm / insurance claim",
  "New construction",
  "Inspection only",
  "Other",
];

export function RoofContactForm({ business }: Props) {
  const [state, setState] = useState<"idle" | "sent">("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roofType, setRoofType] = useState(ROOF_TYPES[0]);
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = `Roofing inspection request — ${name || "new lead"}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Property address: ${address}`,
      `Roof type: ${roofType}`,
      `Project type: ${projectType}`,
      "",
      "Details:",
      message,
    ].join("\n");
    if (business.email) {
      const href = `mailto:${business.email}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="rounded-3xl border border-amber-400/30 bg-slate-900/60 p-10 text-center shadow-[0_40px_120px_-40px_rgba(251,191,36,0.35)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-400/10 text-amber-300">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="mt-5 font-serif text-3xl font-normal text-slate-50">
          Request sent.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-slate-400">
          Thanks, {name || "neighbor"}. {business.name} will reach out within
          one business day to schedule your free roof inspection.
        </p>
        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.14em] text-[#0b1220] hover:bg-amber-300"
          >
            Call now for same-day response
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.6)] backdrop-blur sm:p-9"
    >
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-400/10 ring-1 ring-amber-400/30">
          {business.logoUrl ? (
            <SafeImg
              src={business.logoUrl}
              alt={`${business.name} logo`}
              className="h-full w-full object-contain p-1.5"
              fallback={
                <Home className="h-7 w-7 text-amber-300" aria-hidden />
              }
            />
          ) : (
            <Home className="h-7 w-7 text-amber-300" aria-hidden />
          )}
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-300">
            Request inspection
          </div>
          <div className="mt-0.5 text-[15px] font-bold tracking-tight text-slate-50">
            {business.name}
          </div>
          <div className="text-[12.5px] text-slate-400">
            {business.phone || business.email || "We'll be in touch within 24 hours."}
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLS}
            placeholder="Jane Homeowner"
            autoComplete="name"
          />
        </Field>
        <Field label="Phone" required>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={INPUT_CLS}
            placeholder="(555) 123-4567"
            autoComplete="tel"
          />
        </Field>
        <Field label="Email" required>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLS}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Property address">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={INPUT_CLS}
            placeholder="123 Oak Street"
            autoComplete="street-address"
          />
        </Field>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Roof type" required>
          <select
            required
            value={roofType}
            onChange={(e) => setRoofType(e.target.value)}
            className={INPUT_CLS}
          >
            {ROOF_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Project type" required>
          <select
            required
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className={INPUT_CLS}
          >
            {PROJECT_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Tell us what you've noticed">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${INPUT_CLS} min-h-[120px] resize-y`}
            placeholder="Age of the roof, visible damage, recent storms, prior repairs..."
          />
        </Field>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6">
        <div className="text-[11.5px] leading-relaxed text-slate-400">
          Free written estimate. No obligation. A real roofer walks the
          property and delivers a scoped plan.
        </div>
        <button
          type="submit"
          disabled={!business.email}
          className="group inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-[13.5px] font-bold uppercase tracking-[0.14em] text-[#0b1220] shadow-md shadow-amber-400/20 transition hover:bg-amber-300 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Request inspection
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
}

const INPUT_CLS =
  "w-full rounded-xl border border-slate-800 bg-[#0b1220] px-4 py-3 text-[14px] text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
        {label}
        {required && <span className="ml-1 text-amber-400">*</span>}
      </span>
      {children}
    </label>
  );
}
