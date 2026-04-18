"use client";

import { useState } from "react";
import { ArrowRight, Bug, CheckCircle2, Send } from "lucide-react";
import { SafeImg } from "@/components/safe-img";
import type { SiteData } from "@/lib/templates/site";

type Props = {
  business: SiteData["business"];
};

const PEST_OPTIONS = [
  "Ants",
  "Termites",
  "Rodents",
  "Wasps / hornets",
  "Mosquitos",
  "Cockroaches",
  "Spiders",
  "Bed bugs",
  "Other / not sure",
];

// Real, submitable contact form for the pest template. Company logo sits at
// the form's header (with a bug-icon fallback when no scraped logo). Submit
// packages the fields into a mailto: to business.email — keeps the preview
// site static-safe and doesn't require server infra. On submit, we show a
// confirmation state in place of the form.
export function PestContactForm({ business }: Props) {
  const [state, setState] = useState<"idle" | "sent">("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pest, setPest] = useState(PEST_OPTIONS[0]);
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = `Pest inspection request — ${name || "new lead"}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Property address: ${address}`,
      `Pest concern: ${pest}`,
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
      <div className="rounded-3xl border border-emerald-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="mt-5 font-serif text-3xl font-normal text-slate-900">
          Request sent.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-slate-600">
          Thanks, {name || "neighbor"}. {business.name} will reach out within
          one business day to schedule your free inspection.
        </p>
        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-emerald-500"
          >
            Call now for same-day service{" "}
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-emerald-900/5 sm:p-9"
    >
      {/* Form header with company logo */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 ring-1 ring-emerald-200">
          {business.logoUrl ? (
            <SafeImg
              src={business.logoUrl}
              alt={`${business.name} logo`}
              className="h-full w-full object-contain p-1.5"
              fallback={
                <Bug className="h-7 w-7 text-emerald-700" aria-hidden />
              }
            />
          ) : (
            <Bug className="h-7 w-7 text-emerald-700" aria-hidden />
          )}
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
            Request inspection
          </div>
          <div className="mt-0.5 text-[15px] font-bold tracking-tight text-slate-900">
            {business.name}
          </div>
          <div className="text-[12.5px] text-slate-500">
            {business.phone || business.email || "We’ll be in touch within 24 hours."}
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
            placeholder="Jane Neighbor"
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

      <div className="mt-5">
        <Field label="What are you seeing?" required>
          <select
            required
            value={pest}
            onChange={(e) => setPest(e.target.value)}
            className={INPUT_CLS}
          >
            {PEST_OPTIONS.map((p) => (
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
            placeholder="Where you've seen activity, how long it's been going on, any prior treatments..."
          />
        </Field>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
        <div className="text-[11.5px] leading-relaxed text-slate-500">
          Free inspection. No obligation. A real technician walks the property
          and emails a written plan.
        </div>
        <button
          type="submit"
          disabled={!business.email}
          className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-[13.5px] font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-50"
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
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200";

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
      <span className="mb-1.5 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
        {label}
        {required && <span className="ml-1 text-emerald-600">*</span>}
      </span>
      {children}
    </label>
  );
}
