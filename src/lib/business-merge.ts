// Helpers that decide what to update on a ScrapedBusiness row after a
// fresh scrape. Three rules:
//   1. Backfill city / state when the row was missing them and the
//      website's text reveals them.
//   2. Update `website` when the scraped final URL's host has changed
//      (real domain redirect — `acme-roofing.com` → `acmeroof.io`).
//   3. Accumulate phone numbers — never overwrite the primary number,
//      build up a `phones` array tagged with where each came from.

export type PhoneEntry = {
  number: string;
  source: string;
  scrapedAt: string;
};

export function mergePhones(
  existingPhones: unknown,
  existingPrimary: string | null | undefined,
  newPhones: string[],
  newSource: string,
): PhoneEntry[] {
  const entries: PhoneEntry[] = [];
  const seen = new Set<string>();

  const tryPush = (number: string, source: string, when?: string) => {
    const trimmed = number.trim();
    if (!trimmed) return;
    const key = normalizePhone(trimmed);
    if (!key) return;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({
      number: trimmed,
      source,
      scrapedAt: when ?? new Date().toISOString(),
    });
  };

  // Seed with what's already in the JSON column.
  if (Array.isArray(existingPhones)) {
    for (const e of existingPhones) {
      if (e && typeof e === "object") {
        const obj = e as Partial<PhoneEntry>;
        if (typeof obj.number === "string") {
          tryPush(obj.number, obj.source ?? "unknown", obj.scrapedAt);
        }
      }
    }
  }

  // First-time migration — if the row only has a single `phone` field
  // (no JSON history yet), fold it in tagged as "import" so the audit
  // trail starts including it.
  if (existingPrimary && entries.length === 0) {
    tryPush(existingPrimary, "import");
  }

  // Add the new findings.
  for (const n of newPhones) {
    tryPush(n, newSource);
  }
  return entries;
}

export function normalizePhone(p: string): string {
  return p.replace(/\D/g, "").replace(/^1(\d{10})$/, "$1");
}

// Looks at scraped page text for a "City, ST" or "City, State" pattern.
// Picks the most-frequently-occurring candidate so a one-off mention in
// blog copy doesn't outweigh an actual address in the footer.
const STATE_ABBR_TO_FULL: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};
const STATE_ABBRS = Object.keys(STATE_ABBR_TO_FULL);
const FULL_TO_ABBR: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBR_TO_FULL).map(([abbr, full]) => [full.toLowerCase(), abbr]),
);

export function extractCityState(text: string): { city: string | null; state: string | null } {
  if (!text) return { city: null, state: null };
  const sample = text.slice(0, 50_000);

  const candidates = new Map<string, number>();

  // "Brooklyn, NY 11234" / "Austin, TX" — the dominant US convention.
  const abbrRe = new RegExp(
    String.raw`\b([A-Z][a-zA-Z. '\-]{1,40}?),\s*(${STATE_ABBRS.join("|")})\b(?!\w)`,
    "g",
  );
  let m: RegExpExecArray | null;
  while ((m = abbrRe.exec(sample))) {
    const city = m[1].trim();
    const state = m[2].toUpperCase();
    if (city.length < 2 || city.length > 40) continue;
    if (/^(?:Suite|Ste|Unit|Apt|Building|Floor|Po Box|Pob)$/i.test(city)) continue;
    const key = `${city}|${state}`;
    candidates.set(key, (candidates.get(key) ?? 0) + 1);
  }

  // "Brooklyn, New York" — full-name fallback. Lower priority because
  // generic phrases like "located in New York" are common in blog copy.
  const fullStateNames = Object.keys(FULL_TO_ABBR);
  const fullRe = new RegExp(
    String.raw`\b([A-Z][a-zA-Z. '\-]{1,40}?),\s*(${fullStateNames
      .map((s) => s.replace(/\s+/g, "\\s+"))
      .join("|")})\b`,
    "gi",
  );
  while ((m = fullRe.exec(sample))) {
    const city = m[1].trim();
    const stateFull = m[2].toLowerCase().replace(/\s+/g, " ");
    const state = FULL_TO_ABBR[stateFull];
    if (!state) continue;
    if (city.length < 2 || city.length > 40) continue;
    const key = `${city}|${state}`;
    candidates.set(key, (candidates.get(key) ?? 0) + 0.5); // half-weight
  }

  if (candidates.size === 0) return { city: null, state: null };
  const [bestKey] = [...candidates.entries()].sort((a, b) => b[1] - a[1])[0];
  const [city, state] = bestKey.split("|");
  return { city, state };
}

// Returns true when the post-redirect URL points at a different host
// than the existing website (ignoring www. prefix and trailing slashes).
export function hasDomainChanged(currentUrl: string | null | undefined, scrapedUrl: string): boolean {
  if (!currentUrl || !scrapedUrl) return false;
  try {
    const a = new URL(currentUrl).hostname.replace(/^www\./, "").toLowerCase();
    const b = new URL(scrapedUrl).hostname.replace(/^www\./, "").toLowerCase();
    return a !== b;
  } catch {
    return false;
  }
}
