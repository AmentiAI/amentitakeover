/**
 * Simple password-gated auth for the internal app. Not a real auth system —
 * it's a single-door lock so drive-by visitors can't poke around.
 *
 * Session cookie is an HMAC-signed "expiry.signature" pair so we don't have
 * to persist sessions in the DB. Any secret rotation invalidates all sessions.
 *
 * Uses Web Crypto so it works in the Edge Runtime (middleware).
 */

export const SESSION_COOKIE = "signull_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const DEFAULT_PASSWORD = "Admin123";
const DEFAULT_SECRET = "signull-dev-secret-rotate-me";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || DEFAULT_PASSWORD;
}

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() || DEFAULT_SECRET;
}

export async function createSessionToken(): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiry);
  const sig = await hmac(payload, getSecret());
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(payload, getSecret());
  if (!timingSafeEqual(expected, sig)) return false;
  const expiry = Number(payload);
  if (!Number.isFinite(expiry)) return false;
  return Math.floor(Date.now() / 1000) < expiry;
}

async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return bufToHex(sigBuf);
}

function bufToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
