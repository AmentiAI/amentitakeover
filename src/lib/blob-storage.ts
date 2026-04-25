import { put } from "@vercel/blob";

// Wraps Vercel Blob's `put` for binary asset uploads. Pulls the token off
// BLOB_READ_WRITE_TOKEN (the env's Vercel Blob credential) so callers don't
// have to wire it through every site. Returns the public URL we can drop
// straight into <img src>.

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN?.trim();

export async function uploadBytesToBlob(opts: {
  pathname: string;
  bytes: Uint8Array;
  contentType: string;
}): Promise<string> {
  if (!BLOB_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }
  const blob = await put(opts.pathname, opts.bytes, {
    access: "public",
    contentType: opts.contentType,
    token: BLOB_TOKEN,
    // Wire `addRandomSuffix: false` to keep paths deterministic for a given
    // business + purpose; we already include a timestamp in the pathname so
    // we don't need extra entropy from Vercel.
    addRandomSuffix: true,
  });
  return blob.url;
}

export function isBlobConfigured(): boolean {
  return Boolean(BLOB_TOKEN);
}
