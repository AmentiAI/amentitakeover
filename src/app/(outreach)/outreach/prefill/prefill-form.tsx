"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

type Prefill = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  referralSource?: string | null;
  service?: string | null;
  projectType?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  fieldOverrides?: Record<string, string> | null;
};

export function OutreachPrefillForm({ initial }: { initial: Prefill | null }) {
  const [name, setName] = useState(initial?.name ?? "Wilson");
  const [email, setEmail] = useState(initial?.email ?? "wilson@amentiaiaffiliates.com");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "Website inquiry");
  const [message, setMessage] = useState(
    initial?.message ??
      "Hi — I came across your site and had a quick question about a possible website refresh. Would love a few minutes to chat. Thanks!",
  );
  const [referralSource, setReferralSource] = useState(initial?.referralSource ?? "Online search");
  const [service, setService] = useState(initial?.service ?? "General inquiry");
  const [projectType, setProjectType] = useState(initial?.projectType ?? "Other");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [stateField, setStateField] = useState(initial?.state ?? "");
  const [zip, setZip] = useState(initial?.zip ?? "");
  const [overrides, setOverrides] = useState<{ key: string; value: string }[]>(
    initial?.fieldOverrides
      ? Object.entries(initial.fieldOverrides).map(([key, value]) => ({ key, value }))
      : [],
  );

  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const fieldOverrides: Record<string, string> = {};
      for (const { key, value } of overrides) {
        const k = key.trim();
        const v = value.trim();
        if (k && v) fieldOverrides[k] = v;
      }
      const res = await fetch("/api/outreach/prefill", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
          referralSource,
          service,
          projectType,
          address,
          city,
          state: stateField,
          zip,
          fieldOverrides: Object.keys(fieldOverrides).length ? fieldOverrides : null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSavedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Section title="Identity" hint="Used as the from-person on every form push">
        <Grid>
          <Field label="Name" value={name} onChange={setName} placeholder="Wilson" />
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="wilson@amentiaiaffiliates.com"
          />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="(555) 555-0123" />
          <Field label="Subject" value={subject} onChange={setSubject} placeholder="Website inquiry" />
        </Grid>
        <Textarea label="Message" value={message} onChange={setMessage} rows={5} />
      </Section>

      <Section
        title="Smart dropdown defaults"
        hint='Mapped automatically when a form has a matching field — e.g., "How did you hear about us?" → Referral source'
      >
        <Grid>
          <Field
            label="Referral source"
            value={referralSource}
            onChange={setReferralSource}
            placeholder="Online search"
            note='Fills "How did you hear about us?" / "Referral" / "Source"'
          />
          <Field
            label="Service of interest"
            value={service}
            onChange={setService}
            placeholder="General inquiry"
            note='Fills "Service" / "Interested in"'
          />
          <Field
            label="Project type"
            value={projectType}
            onChange={setProjectType}
            placeholder="Other"
            note='Fills "Project type" / "Type of work"'
          />
        </Grid>
      </Section>

      <Section title="Address" hint="Optional — only fills if the form asks for them">
        <Grid>
          <Field label="Street" value={address} onChange={setAddress} placeholder="123 Main St" />
          <Field label="City" value={city} onChange={setCity} placeholder="Austin" />
          <Field label="State" value={stateField} onChange={setStateField} placeholder="TX" />
          <Field label="ZIP" value={zip} onChange={setZip} placeholder="78701" />
        </Grid>
      </Section>

      <Section
        title="Per-field overrides"
        hint="Escape hatch for sites whose field names don't match any of the intents above. Key = exact form field name, Value = what to fill it with."
      >
        <div className="space-y-2">
          {overrides.map((entry, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={entry.key}
                onChange={(e) =>
                  setOverrides((prev) =>
                    prev.map((p, j) => (i === j ? { ...p, key: e.target.value } : p)),
                  )
                }
                placeholder="field-name (e.g. wpforms[fields][12])"
                className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 font-mono text-[12px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
              />
              <input
                value={entry.value}
                onChange={(e) =>
                  setOverrides((prev) =>
                    prev.map((p, j) => (i === j ? { ...p, value: e.target.value } : p)),
                  )
                }
                placeholder="value"
                className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[12px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => setOverrides((prev) => prev.filter((_, j) => j !== i))}
                className="rounded-md border border-slate-700 px-2 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => setOverrides((prev) => [...prev, { key: "", value: "" }])}
            className="text-[11px] text-slate-400 hover:text-white"
          >
            + Add override
          </button>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <div className="text-[11px] text-slate-500">
          {savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : "Not saved yet"}
          {error && <span className="ml-2 text-rose-400">— {error}</span>}
        </div>
        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save defaults
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  note,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  note?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[13px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
      />
      {note && <span className="text-[10px] text-slate-500">{note}</span>}
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
    <label className="mt-3 flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="resize-y rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[13px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
      />
    </label>
  );
}
