import { Resend } from "resend";

/**
 * Thin Resend wrapper.
 *
 * Env:
 *   RESEND_API_KEY    — required to actually send
 *   RESEND_FROM       — "Name <address@domain>" (defaults to onboarding@resend.dev,
 *                       Resend's shared sandbox address — fine for testing)
 *   RESEND_REPLY_TO   — optional default reply-to
 *
 * Usage:
 *   await sendEmail({ to, subject, text, html });
 *
 * Returns `{ id }` on success, throws on failure. When RESEND_API_KEY is
 * missing we return `{ id: null, skipped: true }` so local dev without a key
 * doesn't explode — the caller can still record the attempt.
 */

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  tags?: { name: string; value: string }[];
};

export type SendEmailResult =
  | { ok: true; id: string; skipped?: false }
  | { ok: false; skipped: true; reason: "no_api_key" }
  | { ok: false; skipped: false; error: string };

// Resend requires the sender's domain to be verified in their dashboard.
// Freemail providers (gmail.com, outlook.com, etc.) can never be verified
// because the domains aren't ours to prove ownership of — catch these before
// we waste a Resend round-trip and show a clear error to the user.
const FREEMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "protonmail.com",
  "proton.me",
  "pm.me",
  "gmx.com",
  "mail.com",
]);

function extractEmailAddress(from: string): string {
  // Accept either "Name <addr@host>" or "addr@host".
  const m = from.match(/<([^>]+)>/);
  return (m ? m[1] : from).trim().toLowerCase();
}

function validateFromAddress(from: string): string | null {
  const addr = extractEmailAddress(from);
  const at = addr.lastIndexOf("@");
  if (at < 0) return `RESEND_FROM="${from}" is not a valid email address.`;
  const domain = addr.slice(at + 1);
  if (FREEMAIL_DOMAINS.has(domain)) {
    return `Cannot send from "${addr}" — "${domain}" is a consumer email provider and can't be verified in Resend. Add a domain you own at https://resend.com/domains and set RESEND_FROM to an address on that domain (e.g. "Wilson <wilson@amentiaiaffiliates.online>").`;
  }
  return null;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resend = getClient();
  if (!resend) {
    return { ok: false, skipped: true, reason: "no_api_key" };
  }

  const from = input.from ?? process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const replyTo = input.replyTo ?? process.env.RESEND_REPLY_TO ?? undefined;

  const fromError = validateFromAddress(from);
  if (fromError) {
    return { ok: false, skipped: false, error: fromError };
  }

  if (!input.text && !input.html) {
    return { ok: false, skipped: false, error: "Either text or html body is required." };
  }

  try {
    // Resend's v6 types use a discriminated union across html/text/react/template.
    // We know at least one of html/text is set (checked above), so cast to the
    // loose shape that Resend actually accepts at runtime.
    const payload = {
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo,
      cc: input.cc,
      bcc: input.bcc,
      tags: input.tags,
    } as Parameters<typeof resend.emails.send>[0];
    const res = await resend.emails.send(payload);
    if (res.error) {
      return { ok: false, skipped: false, error: res.error.message ?? "Resend rejected the send." };
    }
    const id = res.data?.id;
    if (!id) {
      return { ok: false, skipped: false, error: "Resend returned no message id." };
    }
    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      skipped: false,
      error: err instanceof Error ? err.message : "Unknown send error.",
    };
  }
}

/**
 * Convert a plain-text email body (as produced by our AI drafts) into a
 * minimal but readable HTML body. Preserves paragraph breaks; escapes HTML.
 */
export function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px 0;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#0f172a;">${paragraphs}</div>`;
}
