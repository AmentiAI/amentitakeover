"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

type Fields = {
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  state: string;
  experience: string;
  why: string;
};

const EMPTY: Fields = {
  name: "",
  email: "",
  phone: "",
  company: "",
  city: "",
  state: "",
  experience: "",
  why: "",
};

export function AffiliateApplyForm() {
  const [f, setF] = useState<Fields>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof Fields>(k: K, v: Fields[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliate/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not submit application");
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        <div className="text-base font-semibold text-white">Application received</div>
        <p className="text-xs text-slate-400">
          We&apos;ll review and reach out at the email you provided once approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <Input label="Full name" value={f.name} onChange={(v) => set("name", v)} required />
        <Input label="Email" type="email" value={f.email} onChange={(v) => set("email", v)} required />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Input label="Phone" value={f.phone} onChange={(v) => set("phone", v)} />
        <Input label="Company" value={f.company} onChange={(v) => set("company", v)} />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Input label="City" value={f.city} onChange={(v) => set("city", v)} />
        <Input label="State" value={f.state} onChange={(v) => set("state", v)} />
      </div>
      <Textarea
        label="Sales / outreach experience"
        value={f.experience}
        onChange={(v) => set("experience", v)}
        rows={2}
      />
      <Textarea
        label="Why do you want to join?"
        value={f.why}
        onChange={(v) => set("why", v)}
        rows={2}
      />
      {error && (
        <div className="rounded-md border border-rose-800 bg-rose-950/40 px-3 py-2 text-[12px] text-rose-300">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !f.name.trim() || !f.email.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Submitting" : "Submit application"}
      </button>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
        {required && <span className="ml-0.5 text-fuchsia-400">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-fuchsia-500"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-none rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-fuchsia-500"
      />
    </label>
  );
}
