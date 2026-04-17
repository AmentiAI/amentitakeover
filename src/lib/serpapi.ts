const SERPAPI_BASE = "https://serpapi.com/search.json";

export type SerpLocalResult = {
  sourceId: string;
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  reviewsCount: number;
  category: string | null;
  hours: string | null;
  thumbnail: string | null;
};

export function serpApiAvailable(): boolean {
  return Boolean(process.env.SERP_API_KEY);
}

/**
 * Search Google Maps via SerpApi.
 * `location` accepts a city+state string, e.g. "Austin, TX".
 */
export async function searchGoogleMaps({
  query,
  location,
  limit = 20,
}: {
  query: string;
  location: string;
  limit?: number;
}): Promise<SerpLocalResult[]> {
  const key = process.env.SERP_API_KEY;
  if (!key) throw new Error("SERP_API_KEY missing");

  const results: SerpLocalResult[] = [];
  let start = 0;

  while (results.length < limit && start < 100) {
    const params = new URLSearchParams({
      engine: "google_maps",
      type: "search",
      q: `${query} ${location}`.trim(),
      ll: "@0,0,14z",
      start: String(start),
      api_key: key,
    });

    const res = await fetch(`${SERPAPI_BASE}?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`SerpApi ${res.status}: ${await res.text().catch(() => "")}`);
    }
    const data = await res.json();

    const local = (data.local_results ?? data.places_results ?? []) as any[];
    if (!local.length) break;

    for (const r of local) {
      const loc = parseAddress(r.address);
      results.push({
        sourceId: r.place_id ?? r.data_id ?? `${r.title}-${r.address ?? ""}`,
        name: r.title ?? r.name ?? "Unknown",
        website: r.website ?? r.links?.website ?? null,
        phone: r.phone ?? null,
        address: r.address ?? null,
        city: loc.city,
        state: loc.state,
        postalCode: loc.postalCode,
        country: loc.country,
        lat: r.gps_coordinates?.latitude ?? null,
        lng: r.gps_coordinates?.longitude ?? null,
        rating: typeof r.rating === "number" ? r.rating : null,
        reviewsCount: typeof r.reviews === "number" ? r.reviews : 0,
        category: r.type ?? r.types?.[0] ?? null,
        hours: typeof r.hours === "string" ? r.hours : null,
        thumbnail: r.thumbnail ?? null,
      });
      if (results.length >= limit) break;
    }

    start += local.length;
    if (!data.serpapi_pagination?.next) break;
  }

  return results.slice(0, limit);
}

function parseAddress(addr?: string | null): {
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
} {
  if (!addr) return { city: null, state: null, postalCode: null, country: null };
  // Examples: "1234 Main St, Austin, TX 78701" | "Austin, TX" | "10 King, London, UK"
  const parts = addr.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return { city: null, state: null, postalCode: null, country: null };

  const last = parts[parts.length - 1];
  // If last looks like "TX 78701" → state + zip
  const zipMatch = last.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  if (zipMatch) {
    return {
      city: parts[parts.length - 2] ?? null,
      state: zipMatch[1],
      postalCode: zipMatch[2],
      country: "USA",
    };
  }
  // "Austin, TX" style
  const stateOnly = last.match(/^[A-Z]{2}$/);
  if (stateOnly) {
    return {
      city: parts[parts.length - 2] ?? null,
      state: last,
      postalCode: null,
      country: "USA",
    };
  }
  return {
    city: parts[parts.length - 3] ?? null,
    state: parts[parts.length - 2] ?? null,
    postalCode: null,
    country: last,
  };
}
