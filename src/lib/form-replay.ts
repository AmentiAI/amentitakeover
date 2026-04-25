import * as cheerio from "cheerio";
import type { FormField, FormSchema } from "@/lib/scraper";

// Replays a captured contact-form submission on the prospect's site.
// Field values are mapped from a small `SubmitInput` shape onto the actual
// field names the prospect's form expects. Hidden inputs (CSRF / nonce)
// are kept as captured by default; pass { refresh: true } to re-fetch the
// page and grab live token values right before submitting — necessary for
// any site that rotates tokens per-request.

export type StoredContactForm = FormSchema & {
  pageUrl: string;
  pageKind: string;
};

export type SubmitInput = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  subject?: string;
  referralSource?: string;
  service?: string;
  projectType?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  // Per-field overrides keyed by exact field name. Wins over inferred
  // mapping below — useful for forms whose service/topic dropdown needs
  // a specific value the heuristic can't guess.
  fieldValues?: Record<string, string>;
  // Re-fetch the page right before submitting and pull live hidden-input
  // values (CSRF tokens, etc.). Default true — captured tokens are stale
  // by the time anyone clicks "submit", and re-fetching is cheap.
  refresh?: boolean;
  // Override the User-Agent we send. Defaults to a desktop Chrome string
  // because some WAFs reject blank or bot UAs outright.
  userAgent?: string;
};

export type SubmitResult = {
  ok: boolean;
  httpStatus: number;
  finalUrl: string | null;
  bodyPreview: string;
  submittedFields: { name: string; type: string; valuePreview: string }[];
  unmatchedRequiredFields: { name: string; type: string; label?: string }[];
  refreshedHidden: boolean;
};

const DEFAULT_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 30_000;
const BODY_PREVIEW_BYTES = 1200;

export async function submitContactForm(
  form: StoredContactForm,
  input: SubmitInput,
): Promise<SubmitResult> {
  // Optional: pull fresh hidden-input values before posting. CSRF tokens
  // captured during scraping are usually invalidated by the time we
  // submit, so we re-scrape the form's page and overlay the live values.
  let hiddenOverlay: Record<string, string> = {};
  let refreshedHidden = false;
  if (input.refresh !== false && form.pageUrl) {
    hiddenOverlay = await refreshHiddenFields(
      form.pageUrl,
      form.action,
      input.userAgent ?? DEFAULT_UA,
    );
    refreshedHidden = Object.keys(hiddenOverlay).length > 0;
  }

  const data = mapInputToFields(form.fields, input, hiddenOverlay);

  const submittedFields = form.fields
    .filter((f) => f.name in data)
    .map((f) => ({
      name: f.name,
      type: f.type,
      valuePreview: previewValue(f, data[f.name]),
    }));

  const unmatchedRequiredFields = form.fields
    .filter((f) => f.required && !(f.name in data))
    .map((f) => ({ name: f.name, type: f.type, label: f.label }));

  const isMultipart = (form.encoding ?? "").toLowerCase().includes("multipart");
  const ua = input.userAgent ?? DEFAULT_UA;

  const headers: Record<string, string> = {
    "User-Agent": ua,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: form.pageUrl,
    Origin: new URL(form.pageUrl).origin,
  };

  let url = form.action;
  let body: BodyInit | undefined;

  if (form.method === "GET") {
    const u = new URL(form.action);
    for (const [k, v] of Object.entries(data)) u.searchParams.set(k, v);
    url = u.toString();
  } else if (isMultipart) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) fd.append(k, v);
    body = fd;
    // Do NOT set Content-Type — fetch fills in the boundary.
  } else {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(data)) params.append(k, v);
    body = params.toString();
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      method: form.method,
      headers,
      body,
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text().catch(() => "");

  return {
    ok: res.ok,
    httpStatus: res.status,
    finalUrl: res.url || null,
    bodyPreview: text.slice(0, BODY_PREVIEW_BYTES),
    submittedFields,
    unmatchedRequiredFields,
    refreshedHidden,
  };
}

// Maps a small set of well-known intents onto the actual fields the
// prospect's form expects. Order of precedence per field:
//   1. Hidden token — kept verbatim from capture, or overlaid with the
//      live value the refresh re-fetch pulled.
//   2. Explicit `fieldValues` override (exact field-name match).
//   3. Inferred intent from name/label/placeholder → SubmitInput value.
//      For selects, the intent value is fuzzy-matched against the
//      captured options before being used directly.
//   4. Type-aware fallback: SELECT auto-picks first non-placeholder
//      option, required CHECKBOX gets ticked, required RADIO picks first.
// Required fields the heuristic still can't fill end up in
// `unmatchedRequiredFields` so the caller can retry with overrides.
function mapInputToFields(
  fields: FormField[],
  input: SubmitInput,
  hiddenOverlay: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    if (f.type === "hidden") {
      const live = hiddenOverlay[f.name];
      if (live !== undefined) out[f.name] = live;
      else if (f.value !== undefined) out[f.name] = f.value;
      continue;
    }

    const override = input.fieldValues?.[f.name];
    if (override !== undefined) {
      out[f.name] = override;
      continue;
    }

    const intent = inferIntent(f);
    const intentValue = pickByIntent(intent, input);

    if (f.type === "select" && Array.isArray(f.options) && f.options.length > 0) {
      // Selects need to resolve to one of the captured option values —
      // the intent value (e.g. "General inquiry") rarely matches a
      // dropdown like ["Roofing","Siding","Other"] verbatim, so fuzzy
      // match first, then fall through to the first non-placeholder
      // option so we never leave a required select blank.
      const matched = intentValue ? matchOption(f.options, intentValue) : null;
      if (matched) {
        out[f.name] = matched;
      } else {
        const fallback = pickFirstRealOption(f.options);
        if (fallback !== null) out[f.name] = fallback;
      }
      continue;
    }

    if (f.type === "checkbox") {
      // Auto-tick required checkboxes — usually a privacy-policy /
      // terms-of-service consent that's gating submission.
      if (f.required) out[f.name] = f.value ?? "on";
      else if (intentValue !== undefined) out[f.name] = intentValue;
      continue;
    }

    if (f.type === "radio" && f.required && intentValue === undefined) {
      // Required radio with no captured value → pick the field's stored
      // value if present (often the first option's value made it onto
      // the input element via `checked`).
      if (f.value !== undefined) out[f.name] = f.value;
      continue;
    }

    if (intentValue !== undefined) out[f.name] = intentValue;
  }
  return out;
}

// Fuzzy-match an intent value against the captured options. We match
// case-insensitively on either the option's value OR its label, preferring
// exact > startsWith > substring. Returns null if no candidate is close
// enough — caller falls back to the first real option.
function matchOption(
  options: NonNullable<FormField["options"]>,
  needle: string,
): string | null {
  const n = needle.trim().toLowerCase();
  if (!n) return null;
  const exact = options.find(
    (o) => o.value.toLowerCase() === n || o.label.toLowerCase() === n,
  );
  if (exact) return exact.value || exact.label;
  const startsWith = options.find(
    (o) =>
      o.value.toLowerCase().startsWith(n) ||
      o.label.toLowerCase().startsWith(n),
  );
  if (startsWith) return startsWith.value || startsWith.label;
  const substring = options.find(
    (o) =>
      o.value.toLowerCase().includes(n) ||
      o.label.toLowerCase().includes(n),
  );
  if (substring) return substring.value || substring.label;
  return null;
}

const PLACEHOLDER_OPTION_RE =
  /^(\s*|select.*|choose.*|please\s+(select|choose).*|--+.*|—+.*|\.\.\.|pick\s+one.*|none|n\/a)$/i;

function pickFirstRealOption(
  options: NonNullable<FormField["options"]>,
): string | null {
  for (const o of options) {
    const label = o.label.trim();
    const value = o.value.trim();
    // Skip empty value AND placeholder-looking labels — those are the
    // "— Select —" rows that shouldn't be auto-submitted.
    if (!value && PLACEHOLDER_OPTION_RE.test(label)) continue;
    if (!value && !label) continue;
    return value || label;
  }
  return null;
}

type Intent =
  | "email"
  | "phone"
  | "name"
  | "message"
  | "subject"
  | "referralSource"
  | "service"
  | "projectType"
  | "address"
  | "city"
  | "state"
  | "zip"
  | null;

// Intent inference based on patterns we observed across real prospect
// sites — Divi (`et_pb_contact_*`), Gravity Forms (`input_X.Y`), Forminator
// (`name-1`/`email-1`), WPForms (`your-name`/`your-email`), Contact Form 7,
// vanilla `name`/`email`/`phone`/`message` fields. Match priority is
// specific → general so a "referral source" field doesn't accidentally hit
// the "name" intent.
function inferIntent(f: FormField): Intent {
  const haystack = `${f.name} ${f.label ?? ""} ${f.placeholder ?? ""}`.toLowerCase();
  if (f.type === "email" || /\be[-_ ]?mail\b|emailaddress/.test(haystack)) {
    return "email";
  }
  if (f.type === "tel" || /\bphone\b|telephone|mobile|\bcell\b/.test(haystack)) {
    return "phone";
  }
  if (f.type === "textarea" || /message|comments?|details|inquiry|notes|describe|question|project[-_ ]?description/.test(haystack)) {
    return "message";
  }
  if (/how[-_ ]?did[-_ ]?you[-_ ]?hear|hear[-_ ]?about|referr|source|find[-_ ]?us/.test(haystack)) {
    return "referralSource";
  }
  if (/project[-_ ]?type|kind[-_ ]?of[-_ ]?project|type[-_ ]?of[-_ ]?work/.test(haystack)) {
    return "projectType";
  }
  if (/service|interested[-_ ]?in/.test(haystack)) {
    return "service";
  }
  if (/subject|topic|reason|regarding/.test(haystack)) {
    return "subject";
  }
  if (/zip|postal/.test(haystack)) return "zip";
  if (/\bcity\b|town/.test(haystack)) return "city";
  if (/\bstate\b|province/.test(haystack)) return "state";
  if (/\baddress\b|\bstreet\b/.test(haystack)) return "address";
  if (/\bname\b|fullname|first[-_ ]?name|last[-_ ]?name|your[-_ ]?name/.test(haystack)) {
    return "name";
  }
  return null;
}

function pickByIntent(intent: Intent, input: SubmitInput): string | undefined {
  switch (intent) {
    case "email":
      return input.email;
    case "phone":
      return input.phone;
    case "name":
      return input.name;
    case "message":
      return input.message;
    case "subject":
      return input.subject;
    case "referralSource":
      return input.referralSource;
    case "service":
      return input.service;
    case "projectType":
      return input.projectType;
    case "address":
      return input.address;
    case "city":
      return input.city;
    case "state":
      return input.state;
    case "zip":
      return input.zip;
    default:
      return undefined;
  }
}

function previewValue(f: FormField, value: string): string {
  if (f.type === "hidden") {
    // Don't dump CSRF tokens to logs in full — just show length.
    return `[hidden ${value.length}b]`;
  }
  return value.length > 80 ? `${value.slice(0, 77)}…` : value;
}

async function refreshHiddenFields(
  pageUrl: string,
  formAction: string,
  ua: string,
): Promise<Record<string, string>> {
  try {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent": ua,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) return {};
    const html = await res.text();
    const $ = cheerio.load(html);
    let bestMatch: Record<string, string> = {};
    let bestScore = -1;
    $("form").each((_i, el) => {
      const $form = $(el);
      const action = ($form.attr("action") ?? "").trim();
      // Match by absolute or relative action — we don't always have the same
      // resolution context, so accept either an exact action or a path match.
      const score =
        action === formAction
          ? 100
          : action && formAction.endsWith(action)
            ? 50
            : 0;
      if (score <= bestScore) return;
      const hiddenValues: Record<string, string> = {};
      $form.find('input[type="hidden"]').each((_j, input) => {
        const name = $(input).attr("name");
        const value = $(input).attr("value");
        if (name && value !== undefined) hiddenValues[name] = value;
      });
      bestMatch = hiddenValues;
      bestScore = score;
    });
    return bestMatch;
  } catch {
    return {};
  }
}
