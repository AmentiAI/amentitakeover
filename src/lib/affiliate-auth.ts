/**
 * Session auth for the /a/<slug> affiliate portal. Separate cookie from
 * the admin session so an affiliate can't stumble into admin routes by
 * virtue of holding a session cookie — proxy checks the right one
 * based on URL prefix.
 *
 * Token format: "affiliateId.expiry.signature". Signature is an HMAC of
 * "affiliateId.expiry" with AFFILIATE_SESSION_SECRET (falls back to the
 * admin secret so a single rotation nukes both).
 */

export const AFFILIATE_COOKIE = "signull_affiliate";
export const AFFILIATE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  return (
    process.env.AFFILIATE_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    "signull-dev-secret-rotate-me"
  );
}

export async function createAffiliateToken(affiliateId: string): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + AFFILIATE_TTL_SECONDS;
  const payload = `${affiliateId}.${expiry}`;
  const sig = await hmac(payload, getSecret());
  return `${payload}.${sig}`;
}

export async function verifyAffiliateToken(
  token: string | undefined | null,
): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [affiliateId, expiryStr, sig] = parts;
  if (!affiliateId || !expiryStr || !sig) return null;
  const expected = await hmac(`${affiliateId}.${expiryStr}`, getSecret());
  if (!timingSafeEqual(expected, sig)) return null;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry)) return null;
  if (Math.floor(Date.now() / 1000) >= expiry) return null;
  return affiliateId;
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
