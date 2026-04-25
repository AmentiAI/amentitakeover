"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Send } from "lucide-react";

// Captured contact-form schema returned from
// `GET /api/outreach/businesses/[id]/submit-form`. Mirrors the FormSchema
// type in scraper.ts plus pageUrl/pageKind we tag in deep-scraper.
type CapturedField = {
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
  value?: string;
  options?: { value: string; label: string }[];
};

type StoredForm = {
  action: string;
  method: "GET" | "POST";
  encoding: string | null;
  fields: CapturedField[];
  hasEmailField: boolean;
  hasMessageField: boolean;
  captcha: { type: string; signals: string[] } | null;
  pageUrl: string;
  pageKind: string;
};

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

type SubmitResult =
  | {
      ok: boolean;
      httpStatus: number;
      finalUrl: string | null;
      bodyPreview: string;
      submittedFields: { name: string; type: string; valuePreview: string }[];
      unmatchedRequiredFields: { name: string; type: string; label?: string }[];
      refreshedHidden: boolean;
    }
  | {
      dryRun: true;
      submittedFields: { name: string; type: string; valuePreview: string }[];
      unmatchedRequiredFields: { name: string; type: string; label?: string }[];
    };

export function BusinessFormSubmit({
  businessId,
  onSubmitted,
}: {
  businessId: string;
  onSubmitted?: () => void;
}) {
  const [form, setForm] = useState<StoredForm | null>(null);
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Per-field overrides — keyed by exact field name, value is whatever the
  // operator typed. We seed these with the auto-mapped values once the
  // schema + prefill arrive, then the operator edits inline.
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"dry" | "live" | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(`/api/outreach/businesses/${businessId}/submit-form`).then((r) => r.json()),
      fetch(`/api/outreach/prefill`).then((r) => r.json()),
    ])
      .then(([formRes, prefillRes]) => {
        if (cancelled) return;
        const f = (formRes.contactForm as StoredForm | null) ?? null;
        const p: Prefill = prefillRes.prefill ?? {};
        setForm(f);
        setPrefill(p);
        if (f) setValues(autoMapValues(f.fields, p));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  // Visible (editable) fields: skip hidden inputs (CSRF/state — server
  // refreshes them) and honeypots (we deliberately keep these empty).
  const visibleFields = useMemo(
    () => (form ? form.fields.filter((f) => f.type !== "hidden" && !isHoneypot(f)) : []),
    [form],
  );
  const hiddenFields = useMemo(
    () => (form ? form.fields.filter((f) => f.type === "hidden") : []),
    [form],
  );
  const honeypotFields = useMemo(
    () => (form ? form.fields.filter((f) => isHoneypot(f)) : []),
    [form],
  );

  const submit = useCallback(
    async (dryRun: boolean) => {
      if (!form) return;
      setBusy(dryRun ? "dry" : "live");
      setError(null);
      try {
        // Build fieldValues from the operator's edits, but skip empty
        // strings so the server's intent mapper / captured-value logic
        // can step in for fields the operator didn't touch.
        const fieldValues: Record<string, string> = {};
        for (const f of form.fields) {
          if (f.type === "hidden") continue; // server uses the live token
          if (isHoneypot(f)) continue; // never fill honeypots
          const v = values[f.name];
          if (typeof v === "string") fieldValues[f.name] = v;
        }
        const res = await fetch(
          `/api/outreach/businesses/${businessId}/submit-form`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fieldValues, dryRun }),
          },
        );
        const j = (await res.json()) as SubmitResult & { error?: string };
        if (!res.ok) {
          throw new Error((j as { error?: string }).error || `HTTP ${res.status}`);
        }
        setResult(j);
        if (!dryRun) onSubmitted?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Submit failed");
      } finally {
        setBusy(null);
      }
    },
    [businessId, form, values, onSubmitted],
  );

  if (loading) {
    return (
      <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-[11px] text-slate-500">
        <Loader2 className="mr-1.5 inline h-3 w-3 animate-spin" /> Checking for captured form…
      </div>
    );
  }
  if (!form) return null;

  const liveResult = result && !("dryRun" in result) ? result : null;
  const dryResult = result && "dryRun" in result ? result : null;

  return (
    <details className="group rounded-md border border-slate-800 bg-slate-950" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Send className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
            Push contact form
          </span>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
            {form.fields.length} fields
          </span>
          {!form.hasMessageField && (
            <span
              title="No textarea / message field on this form — contact-info dropoff only"
              className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-300"
            >
              no-msg
            </span>
          )}
          {form.captcha && (
            <span
              title={`Captcha detected: ${form.captcha.type}. Headless submission will be silently rejected unless solved.`}
              className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-300"
            >
              {form.captcha.type}
            </span>
          )}
          {honeypotFields.length > 0 && (
            <span
              title={`Detected ${honeypotFields.length} honeypot field(s) — kept empty`}
              className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-300"
            >
              honeypot
            </span>
          )}
        </div>
        <span className="text-slate-500">
          <ChevronRight className="h-3 w-3 group-open:hidden" />
          <ChevronDown className="hidden h-3 w-3 group-open:inline" />
        </span>
      </summary>

      <div className="space-y-3 border-t border-slate-800 px-3 py-3">
        <div className="space-y-1 text-[11px] leading-snug text-slate-400">
          <div>
            <span className="text-slate-500">Captured on:</span>{" "}
            <a
              href={form.pageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 underline hover:text-white"
            >
              {form.pageUrl}
            </a>
          </div>
          <div>
            <span className="text-slate-500">Submits to:</span>{" "}
            <span className="font-mono text-slate-300">
              {form.method} {form.action}
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Values below were auto-mapped from your{" "}
            <a
              href="/outreach/prefill"
              className="underline hover:text-slate-300"
            >
              prefill defaults
            </a>
            . Edit any field before pushing.
          </div>
        </div>

        {form.captcha && (
          <div className="rounded-md border border-amber-700/40 bg-amber-950/30 px-3 py-2 text-[11px] text-amber-200">
            <div className="mb-1 font-semibold">
              Captcha detected: {form.captcha.type}
            </div>
            <div className="text-amber-300/80">
              Headless submission will likely be silently rejected by the
              recipient. The fields below still preview what we&apos;d send,
              and you can use Dry run to verify mapping — but a real
              &ldquo;Submit form&rdquo; here probably won&apos;t reach the
              business until we wire a solver.
            </div>
            <details className="mt-1.5">
              <summary className="cursor-pointer text-[10px] text-amber-300/70 hover:text-amber-200">
                Detection signals
              </summary>
              <ul className="mt-1 ml-3 list-disc space-y-0.5 font-mono text-[10px] text-amber-300/70">
                {form.captcha.signals.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </details>
          </div>
        )}

        <div className="space-y-2">
          {visibleFields.map((f) => (
            <FieldRow
              key={f.name}
              field={f}
              value={values[f.name] ?? ""}
              onChange={(v) => setValues((prev) => ({ ...prev, [f.name]: v }))}
            />
          ))}
        </div>

        {(hiddenFields.length > 0 || honeypotFields.length > 0) && (
          <details className="rounded border border-slate-800 bg-slate-900/40 text-[11px]">
            <summary className="cursor-pointer list-none px-2 py-1.5 text-slate-400 hover:text-slate-200">
              Auto-handled fields ({hiddenFields.length} hidden + {honeypotFields.length} honeypot)
            </summary>
            <ul className="space-y-0.5 border-t border-slate-800 px-2 py-1.5 font-mono text-[10px] text-slate-400">
              {hiddenFields.map((f, i) => (
                <li key={`h-${f.name}-${i}`}>
                  <span className="text-slate-200">{f.name}</span>
                  <span className="text-slate-500"> (hidden — refreshed on submit)</span>
                </li>
              ))}
              {honeypotFields.map((f, i) => (
                <li key={`hp-${f.name}-${i}`}>
                  <span className="text-amber-300">{f.name}</span>
                  <span className="text-slate-500">
                    {" "}
                    (honeypot — left empty
                    {f.label ? ` :: ${f.label}` : ""})
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => submit(true)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            {busy === "dry" ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Dry run
          </button>
          <button
            onClick={() => submit(false)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy === "live" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Submit form
          </button>
          {error && <span className="text-[11px] text-rose-400">{error}</span>}
        </div>

        {(liveResult || dryResult) && (
          <div
            className={`rounded border px-3 py-2 text-[11px] ${
              liveResult
                ? liveResult.ok
                  ? "border-emerald-700/40 bg-emerald-950/30 text-emerald-200"
                  : "border-rose-700/40 bg-rose-950/30 text-rose-200"
                : "border-slate-700 bg-slate-900/40 text-slate-300"
            }`}
          >
            {liveResult && (
              <div className="mb-1 font-semibold">
                {liveResult.ok ? "Submitted" : "Rejected"} — HTTP {liveResult.httpStatus}
                {liveResult.refreshedHidden && (
                  <span className="ml-2 text-[10px] text-slate-400">
                    (hidden tokens refreshed)
                  </span>
                )}
              </div>
            )}
            {dryResult && <div className="mb-1 font-semibold">Dry run</div>}
            <div className="text-[10px] text-slate-400">
              <span className="text-slate-500">Sent:</span>{" "}
              {(liveResult ?? dryResult)!.submittedFields
                .map((f) => `${f.name}=${f.valuePreview}`)
                .join(", ")}
            </div>
            {((liveResult ?? dryResult)!.unmatchedRequiredFields.length > 0) && (
              <div className="mt-1 text-[10px] text-amber-400">
                Unmatched required:{" "}
                {(liveResult ?? dryResult)!.unmatchedRequiredFields
                  .map((f) => f.name)
                  .join(", ")}
              </div>
            )}
            {liveResult?.finalUrl && (
              <div className="mt-1 text-[10px] text-slate-400">
                Final URL: {liveResult.finalUrl}
              </div>
            )}
            {liveResult?.bodyPreview && (
              <details className="mt-1.5">
                <summary className="cursor-pointer list-none text-slate-400 hover:text-slate-200">
                  Response preview
                </summary>
                <pre className="mt-1.5 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-black/30 p-2 text-[10px] leading-snug">
                  {liveResult.bodyPreview}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

// Renders one captured field as the right input for its type, with the
// field's name + (label or placeholder) shown above. Required fields get a
// red asterisk.
function FieldRow({
  field,
  value,
  onChange,
}: {
  field: CapturedField;
  value: string;
  onChange: (v: string) => void;
}) {
  const intent = inferLikelyIntent(field);
  const labelText =
    field.label?.replace(/\s*\*\s*$/, "") ||
    field.placeholder ||
    field.name;
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between gap-2 text-[11px]">
        <span className="font-semibold text-slate-200">
          {labelText}
          {field.required && <span className="ml-0.5 text-rose-400">*</span>}
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          {field.name} · {field.type}
          {intent ? ` · ${intent}` : ""}
        </span>
      </span>
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="resize-y rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[12px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
        />
      ) : field.type === "select" && field.options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[12px] text-slate-100 focus:border-emerald-500 focus:outline-none"
        >
          {field.options.map((o, i) => (
            <option key={`${o.value}-${i}`} value={o.value}>
              {o.label || o.value || "(blank)"}
            </option>
          ))}
        </select>
      ) : field.type === "checkbox" ? (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === (field.value ?? "on")}
            onChange={(e) => onChange(e.target.checked ? field.value ?? "on" : "")}
            className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900"
          />
          <span className="text-[11px] text-slate-400">
            {field.required ? "(auto-checked because required)" : "Tick to include"}
          </span>
        </div>
      ) : (
        <input
          type={field.type === "email" || field.type === "tel" || field.type === "date" ? field.type : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[12px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
        />
      )}
    </label>
  );
}

// Honeypot detection — labels and field names that scream "bot trap".
// Forms render these visually-hidden; filling them in flags submission as
// spam. We list them in the "Auto-handled" expander so the operator can
// see they were detected, and skip them on submission.
function isHoneypot(f: CapturedField): boolean {
  const haystack = `${f.name} ${f.label ?? ""} ${f.placeholder ?? ""}`.toLowerCase();
  return /honeypot|honey[-_ ]?pot|do[-_ ]?not[-_ ]?fill|spam[-_ ]?protect|fakefield|leave[-_ ]?(this[-_ ])?blank|gotcha|bot[-_ ]?trap/.test(
    haystack,
  );
}

// Mirrors the server-side intent inferrer in form-replay.ts so we can
// pre-fill values consistently before the operator hits Submit. The
// server runs the same logic for fields the operator left untouched.
function inferLikelyIntent(f: CapturedField): string | null {
  const haystack = `${f.name} ${f.label ?? ""} ${f.placeholder ?? ""}`.toLowerCase();
  if (f.type === "email" || /\be[-_ ]?mail\b|emailaddress/.test(haystack)) return "email";
  if (/\bphone\b|telephone|mobile|\bcell\b/.test(haystack)) return "phone";
  if (
    f.type === "textarea" ||
    /message|comments?|details|inquiry|notes|describe|question|project[-_ ]?description/.test(haystack)
  ) {
    return "message";
  }
  if (/how[-_ ]?did[-_ ]?you[-_ ]?hear|hear[-_ ]?about|referr|source|find[-_ ]?us/.test(haystack)) return "referralSource";
  if (/project[-_ ]?type|kind[-_ ]?of[-_ ]?project|type[-_ ]?of[-_ ]?work/.test(haystack)) return "projectType";
  if (/service|interested[-_ ]?in/.test(haystack)) return "service";
  if (/subject|topic|reason|regarding/.test(haystack)) return "subject";
  if (/zip|postal/.test(haystack)) return "zip";
  if (/\bcity\b|town/.test(haystack)) return "city";
  if (/\bstate\b|province/.test(haystack)) return "state";
  if (/\baddress\b|\bstreet\b/.test(haystack)) return "address";
  if (/\bname\b|fullname|first[-_ ]?name|last[-_ ]?name|your[-_ ]?name/.test(haystack)) return "name";
  if (f.type === "tel") return "phone";
  return null;
}

function pickByIntent(intent: string, p: Prefill): string | undefined {
  switch (intent) {
    case "email":
      return p.email ?? undefined;
    case "phone":
      return p.phone ?? undefined;
    case "name":
      return p.name ?? undefined;
    case "message":
      return p.message ?? undefined;
    case "subject":
      return p.subject ?? undefined;
    case "referralSource":
      return p.referralSource ?? undefined;
    case "service":
      return p.service ?? undefined;
    case "projectType":
      return p.projectType ?? undefined;
    case "address":
      return p.address ?? undefined;
    case "city":
      return p.city ?? undefined;
    case "state":
      return p.state ?? undefined;
    case "zip":
      return p.zip ?? undefined;
    default:
      return undefined;
  }
}

const PLACEHOLDER_OPTION_RE =
  /^(\s*|select.*|choose.*|please\s+(select|choose).*|--+.*|—+.*|\.\.\.|pick\s+one.*|none|n\/a)$/i;

function fuzzyMatchOption(
  options: NonNullable<CapturedField["options"]>,
  needle: string,
): string | null {
  const n = needle.trim().toLowerCase();
  if (!n) return null;
  const exact = options.find((o) => o.value.toLowerCase() === n || o.label.toLowerCase() === n);
  if (exact) return exact.value || exact.label;
  const starts = options.find((o) => o.value.toLowerCase().startsWith(n) || o.label.toLowerCase().startsWith(n));
  if (starts) return starts.value || starts.label;
  const sub = options.find((o) => o.value.toLowerCase().includes(n) || o.label.toLowerCase().includes(n));
  return sub ? sub.value || sub.label : null;
}

function pickFirstRealOption(options: NonNullable<CapturedField["options"]>): string {
  for (const o of options) {
    const label = o.label.trim();
    const value = o.value.trim();
    if (!value && PLACEHOLDER_OPTION_RE.test(label)) continue;
    if (!value && !label) continue;
    return value || label;
  }
  return options[0]?.value ?? "";
}

// Computes the auto-mapped value for every visible field, mirroring the
// server's mapping logic so the operator sees the same defaults the
// server would otherwise pick. Leaves honeypots empty.
function autoMapValues(fields: CapturedField[], prefill: Prefill): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    if (f.type === "hidden") continue;
    if (isHoneypot(f)) continue;
    const intent = inferLikelyIntent(f);
    const intentValue = intent ? pickByIntent(intent, prefill) : undefined;
    if (f.type === "select" && f.options && f.options.length > 0) {
      const matched = intentValue ? fuzzyMatchOption(f.options, intentValue) : null;
      out[f.name] = matched ?? pickFirstRealOption(f.options);
      continue;
    }
    if (f.type === "checkbox") {
      out[f.name] = f.required ? f.value ?? "on" : "";
      continue;
    }
    if (intentValue !== undefined) out[f.name] = intentValue;
    else out[f.name] = "";
  }
  return out;
}
