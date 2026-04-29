import { prisma } from "@/lib/db";
import { findApexOwner } from "@/lib/website-dedup";

// Industry → OSM tag clauses. Each clause becomes a separate
// `nwr[...](area.region)` query, unioned, then filtered by `["website"]`
// at the OSM level. Add more rows here as new categories come up.
export const INDUSTRY_TAGS: Record<
  string,
  { tags: string[][]; nameMatch?: RegExp }
> = {
  "pest control": {
    tags: [["office", "pest_control"], ["shop", "pest_control"]],
    nameMatch: /pest control|exterminator/i,
  },
  plumbing: { tags: [["craft", "plumber"]], nameMatch: /\bplumb/i },
  roofing: { tags: [["craft", "roofer"]], nameMatch: /\broof/i },
  electrical: { tags: [["craft", "electrician"]], nameMatch: /\belectric/i },
  hvac: {
    tags: [["craft", "hvac"]],
    nameMatch: /hvac|heating|cooling|air[-_ ]conditioning/i,
  },
  landscaping: {
    tags: [["craft", "gardener"], ["shop", "garden_centre"]],
    nameMatch: /landscap|lawn[-_ ]care|tree[-_ ]service/i,
  },
  cleaning: {
    tags: [["shop", "dry_cleaning"]],
    nameMatch: /clean|janitor|maid/i,
  },
  painting: { tags: [["craft", "painter"]], nameMatch: /\bpaint/i },
  flooring: {
    tags: [["craft", "carpenter"], ["shop", "flooring"]],
    nameMatch: /floor|carpet|hardwood/i,
  },
  restaurant: { tags: [["amenity", "restaurant"]] },
  cafe: { tags: [["amenity", "cafe"]] },
  bakery: { tags: [["shop", "bakery"]] },
  hotel: { tags: [["tourism", "hotel"]] },
  "auto repair": {
    tags: [["shop", "car_repair"], ["craft", "motor_mechanic"]],
    nameMatch: /auto|mechanic|car[-_ ]repair/i,
  },
  gym: { tags: [["leisure", "fitness_centre"]] },
  salon: {
    tags: [["shop", "hairdresser"], ["shop", "beauty"]],
    nameMatch: /salon|barber|spa/i,
  },
  dentist: { tags: [["amenity", "dentist"]] },
  veterinary: { tags: [["amenity", "veterinary"]] },
};

export const KNOWN_INDUSTRIES = Object.keys(INDUSTRY_TAGS).sort();

const STATE_NAMES: Record<string, string> = {
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

export type LeadRecord = {
  fsq_id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  locality: string | null;
  region: string | null;
  postcode: string | null;
  country: string;
  email: string | null;
  tel: string | null;
  website: string | null;
  categories: string[];
};

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

// Hard cap on how many records we ask Overpass to send back. We over-fetch
// here (much higher than the operator's `count`) so the dedupe step can
// actually find unseen rows on repeat pulls — Overpass returns results in
// deterministic OSM-id order, so without an over-fetch every "pull 50"
// returns the same 50 forever.
const OVERPASS_HARD_CAP = 1000;

// Lightweight "how many total exist?" probe — runs the same tag/region
// query but returns just a count, no tag data. Fast (a few hundred ms),
// useful for showing "30 with websites out of 100 total" alongside the
// fetch result so the operator knows how saturated the region is.
export async function countOsmRegion(opts: {
  industry: string;
  state: string;
  city?: string;
  overpassUrl?: string;
}): Promise<{ total: number; withWebsite: number; query: string }> {
  const overpassUrl = opts.overpassUrl ?? "https://overpass-api.de/api/interpreter";
  const industryKey = opts.industry.trim().toLowerCase();
  const known = INDUSTRY_TAGS[industryKey];
  const stateName = opts.state.trim().toUpperCase();
  // "ALL" / "*" / "USA" → search the whole country (admin_level=2). Lets
  // the operator skip per-state pulls when they want maximum reach. The
  // city filter can still narrow when state=ALL.
  const isCountrywide =
    stateName === "ALL" || stateName === "*" || stateName === "USA" || stateName === "US";
  const stateFullName = isCountrywide
    ? "United States of America"
    : STATE_NAMES[stateName] ?? stateName;
  const cityName = (opts.city ?? "").trim();

  const tagClauses: string[] = [];
  const tagClausesWithSite: string[] = [];
  if (known?.tags?.length) {
    for (const [k, v] of known.tags) {
      tagClauses.push(`nwr["${k}"="${v}"](area.region);`);
      tagClausesWithSite.push(`nwr["${k}"="${v}"]["website"](area.region);`);
    }
  }
  // Same as fetchOsmLeads — skip name regex for countrywide queries to
  // avoid Overpass timeouts.
  if (!isCountrywide) {
    const nameRegex = known?.nameMatch?.source ?? opts.industry;
    const escaped = nameRegex.replace(/"/g, '\\"');
    tagClauses.push(`nwr["name"~"${escaped}",i](area.region);`);
    tagClausesWithSite.push(`nwr["name"~"${escaped}",i]["website"](area.region);`);
  }

  const areaSelector = cityName
    ? `area["name"="${cityName}"]["admin_level"~"^[678]$"]->.region;`
    : isCountrywide
      ? `area["name"="${stateFullName}"]["admin_level"="2"]->.region;`
      : `area["name"="${stateFullName}"]["admin_level"="4"]->.region;`;

  // One query returning two named result sets so we get both counts in a
  // single round-trip.
  const query = `[out:json][timeout:60];
${areaSelector}
(
${tagClauses.map((c) => `  ${c}`).join("\n")}
)->.all;
(
${tagClausesWithSite.map((c) => `  ${c}`).join("\n")}
)->.withSite;
.all out count;
.withSite out count;`;

  const body = `data=${encodeURIComponent(query)}`;
  const res = await fetch(overpassUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": "AmentiAffiliateBot/1.0 (+local)",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Overpass returned ${res.status}: ${text.slice(0, 400)}`);
  }
  const data = (await res.json()) as {
    elements: { type: string; tags?: Record<string, string> }[];
  };
  // Overpass `out count` returns one element per result set with
  // `tags.total` (and per-type counts). Order matches the .all then
  // .withSite sequence above.
  const counts = (data.elements ?? [])
    .filter((e) => e.type === "count")
    .map((e) => Number(e.tags?.total ?? 0));
  const total = counts[0] ?? 0;
  const withWebsite = counts[1] ?? 0;
  return { total, withWebsite, query };
}

export async function fetchOsmLeads(opts: {
  industry: string;
  state: string;
  city?: string;
  count: number;
  overpassUrl?: string;
}): Promise<{ records: LeadRecord[]; rawCount: number; query: string }> {
  const overpassUrl = opts.overpassUrl ?? "https://overpass-api.de/api/interpreter";
  const industryKey = opts.industry.trim().toLowerCase();
  const known = INDUSTRY_TAGS[industryKey];
  const stateName = opts.state.trim().toUpperCase();
  const isCountrywide =
    stateName === "ALL" || stateName === "*" || stateName === "USA" || stateName === "US";
  const stateFullName = isCountrywide
    ? "United States of America"
    : STATE_NAMES[stateName] ?? stateName;
  const cityName = (opts.city ?? "").trim();

  const tagClauses: string[] = [];
  if (known?.tags?.length) {
    for (const [k, v] of known.tags) {
      tagClauses.push(`nwr["${k}"="${v}"]["website"](area.region);`);
    }
  }
  // Country-wide name-regex scans always time out (they have to scan
  // every named POI in the US). Only run the regex fallback for
  // state/city queries where Overpass can budget the work.
  if (!isCountrywide) {
    const nameRegex = known?.nameMatch?.source ?? opts.industry;
    tagClauses.push(
      `nwr["name"~"${nameRegex.replace(/"/g, '\\"')}",i]["website"](area.region);`,
    );
  }

  const areaSelector = cityName
    ? `area["name"="${cityName}"]["admin_level"~"^[678]$"]->.region;`
    : isCountrywide
      ? `area["name"="${stateFullName}"]["admin_level"="2"]->.region;`
      : `area["name"="${stateFullName}"]["admin_level"="4"]->.region;`;

  // Pull a much larger pool than the operator asked for — the dedup step
  // upstream will skip already-imported rows and take only `count` new
  // ones from this pool. Without the over-fetch, repeat pulls always
  // return the same N (Overpass results are deterministic by OSM id).
  const query = `[out:json][timeout:60];
${areaSelector}
(
${tagClauses.map((c) => `  ${c}`).join("\n")}
);
out tags center ${OVERPASS_HARD_CAP};`;

  // Overpass returns 406 if we don't send a clean form-urlencoded body
  // with an Accept header it likes. Match what `curl --data-urlencode`
  // produces.
  const body = `data=${encodeURIComponent(query)}`;
  const res = await fetch(overpassUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": "AmentiAffiliateBot/1.0 (+local)",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Overpass returned ${res.status}: ${text.slice(0, 400)}`);
  }
  const data = (await res.json()) as { elements: OverpassElement[] };
  const elements = data.elements ?? [];
  // Don't slice to `count` here — caller dedupes against DB first, then
  // takes the first N unseen rows from the full pool.
  const records = elements
    .map(elementToRecord)
    .filter((r): r is LeadRecord => Boolean(r.name && r.website));
  return { records, rawCount: elements.length, query };
}

// Splits a fetched pool into "already imported under this source tag" vs
// "new". Lets the caller present a clear "X already known, Y new" report
// instead of silently re-uploading the same rows on every pull.
export async function partitionByExisting(
  records: LeadRecord[],
  sourceTag: string,
): Promise<{ fresh: LeadRecord[]; alreadyImported: number }> {
  if (records.length === 0) return { fresh: [], alreadyImported: 0 };
  const existing = await prisma.scrapedBusiness.findMany({
    where: {
      source: sourceTag,
      sourceId: { in: records.map((r) => r.fsq_id) },
    },
    select: { sourceId: true },
  });
  const known = new Set(existing.map((e) => e.sourceId));
  const fresh = records.filter((r) => !known.has(r.fsq_id));
  return { fresh, alreadyImported: records.length - fresh.length };
}

function elementToRecord(el: OverpassElement): LeadRecord {
  const t = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;
  const street = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ").trim();
  return {
    fsq_id: `osm-${el.type}-${el.id}`,
    name: t.name ?? "",
    latitude: lat,
    longitude: lon,
    address: street || null,
    locality: t["addr:city"] ?? null,
    region: t["addr:state"] ?? null,
    postcode: t["addr:postcode"] ?? null,
    country: t["addr:country"] ?? "US",
    email: t.email ?? null,
    tel: t.phone ?? null,
    website: t.website ?? null,
    categories: [t.amenity, t.shop, t.craft, t.office, t.tourism, t.leisure]
      .filter(Boolean)
      .map((c) =>
        c!.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
      ),
  };
}

export async function importLeads(
  records: LeadRecord[],
  opts: { industry: string; sourceTag: string },
): Promise<{ created: number; updated: number }> {
  if (records.length === 0) return { created: 0, updated: 0 };
  const existing = await prisma.scrapedBusiness.findMany({
    where: {
      source: opts.sourceTag,
      sourceId: { in: records.map((r) => r.fsq_id) },
    },
    select: { id: true, sourceId: true },
  });
  const existingIds = new Map(existing.map((e) => [e.sourceId!, e.id]));

  let created = 0;
  let updated = 0;
  let skippedDomainDupe = 0;
  for (const r of records) {
    // Seed the phones audit trail at import time tagged with the lead
    // source ("osm-pest-control", "foursquare", etc.) so when a later
    // website scrape adds more numbers, the original is correctly
    // attributed instead of degrading to "import".
    const phonesSeed = r.tel
      ? [{ number: r.tel, source: opts.sourceTag, scrapedAt: new Date().toISOString() }]
      : null;
    const data = {
      source: opts.sourceTag,
      sourceId: r.fsq_id,
      name: r.name,
      website: r.website ?? null,
      phone: r.tel ?? null,
      phones: phonesSeed ?? undefined,
      email: r.email ?? null,
      address: r.address ?? null,
      city: r.locality ?? null,
      state: r.region ?? null,
      postalCode: r.postcode ?? null,
      country: r.country ?? "USA",
      lat: typeof r.latitude === "number" ? r.latitude : null,
      lng: typeof r.longitude === "number" ? r.longitude : null,
      rating: null,
      reviewsCount: 0,
      category: r.categories[0] ?? null,
      industry: opts.industry,
      hasWebsite: Boolean(r.website),
      emailReady: Boolean(r.email),
    };
    const existingId = existingIds.get(r.fsq_id);
    if (existingId) {
      await prisma.scrapedBusiness.update({ where: { id: existingId }, data });
      updated++;
    } else {
      // Reject if any other visible row already owns this apex domain. Same
      // business under different OSM ids (different cities, different node
      // types) was the main duplication source.
      if (r.website) {
        const owner = await findApexOwner(prisma, r.website);
        if (owner) {
          skippedDomainDupe++;
          continue;
        }
      }
      await prisma.scrapedBusiness.create({ data });
      created++;
    }
  }
  return { created, updated, skippedDomainDupe };
}

export function deriveSourceTag(industry: string): string {
  return `osm-${industry.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}
