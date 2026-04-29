import type { PrismaClient } from "@prisma/client";

// One-domain-per-system rule. We treat the apex domain (the part of the
// hostname without `www.`, lowercased) as the unique business identity for
// scraped rows. The rule: only ONE non-archived row may exist per apex,
// regardless of which source brought it in.
//
// Why apex and not the full URL: a single business often appears on imports
// with `https://example.com/`, `http://www.example.com`, and
// `https://example.com/locations/seattle/` — same business, different URLs.
//
// Importers that lack a website value are exempt — those rows can be deduped
// later via name/phone heuristics, but we don't reject them up front.

export function apexOf(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Returns the existing visible (non-archived) ScrapedBusiness id that owns
 * this apex domain, or null if the apex is free. Use BEFORE creating a new
 * row to skip imports that would duplicate an existing business.
 *
 * Postgres LIKE-on-hostname is faster than scanning every row's website
 * field, but to keep this DB-agnostic we just pull rows whose `website`
 * `contains` the apex (case-insensitive) and verify by parsing the URL.
 */
export async function findApexOwner(
  prisma: PrismaClient,
  rawUrl: string | null | undefined,
  opts?: { excludeId?: string },
): Promise<string | null> {
  const apex = apexOf(rawUrl);
  if (!apex) return null;
  const candidates = await prisma.scrapedBusiness.findMany({
    where: {
      archived: false,
      website: { contains: apex, mode: "insensitive" },
      ...(opts?.excludeId ? { NOT: { id: opts.excludeId } } : {}),
    },
    select: { id: true, website: true },
    take: 5,
  });
  for (const c of candidates) {
    if (apexOf(c.website) === apex) return c.id;
  }
  return null;
}

/**
 * Convenience: true when importing this URL would duplicate an existing
 * visible row. Importers should call this and `continue` past the row.
 */
export async function isApexDuplicate(
  prisma: PrismaClient,
  rawUrl: string | null | undefined,
  opts?: { excludeId?: string },
): Promise<boolean> {
  return (await findApexOwner(prisma, rawUrl, opts)) !== null;
}
