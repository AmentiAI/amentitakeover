import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 86400; // 24h

export type CoveragePlace = {
  name: string;
  lat: number;
  lng: number;
  kind: "city" | "town" | "village" | "suburb" | "hamlet";
  population?: number;
  miles: number;
};

export type CoverageHighway = {
  id: number;
  ref?: string;
  name?: string;
  kind: "motorway" | "trunk" | "primary" | "secondary";
  coords: [number, number][];
};

export type Coverage = {
  center: {
    lat: number;
    lng: number;
    name: string;
    zip: string;
    state: string;
    stateName: string;
  };
  radius: number;
  places: CoveragePlace[];
  highways: CoverageHighway[];
  degraded: boolean;
};

function haversineMiles(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 3959;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1));
}

type ZippoResponse = {
  "post code": string;
  country: string;
  "country abbreviation": string;
  places: Array<{
    "place name": string;
    state: string;
    "state abbreviation": string;
    latitude: string;
    longitude: string;
  }>;
};

type OverpassNode = {
  type: "node";
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
};

type OverpassWay = {
  type: "way";
  id: number;
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
};

type OverpassElement = OverpassNode | OverpassWay;

type OverpassResponse = {
  elements: OverpassElement[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zip = (searchParams.get("zip") ?? "").trim();
  const milesParam = parseInt(searchParams.get("miles") ?? "30", 10);
  const miles = Math.max(
    5,
    Math.min(50, Number.isFinite(milesParam) ? milesParam : 30),
  );

  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Zip must be 5 digits" }, { status: 400 });
  }

  // 1) Zip → lat/lng (Zippopotam, free)
  let zipData: ZippoResponse;
  try {
    const zipRes = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!zipRes.ok) {
      return NextResponse.json({ error: "Zip not found" }, { status: 404 });
    }
    zipData = (await zipRes.json()) as ZippoResponse;
  } catch {
    return NextResponse.json(
      { error: "Lookup service unavailable" },
      { status: 502 },
    );
  }

  const place = zipData.places?.[0];
  if (!place) {
    return NextResponse.json({ error: "Zip has no coordinates" }, { status: 404 });
  }
  const lat = parseFloat(place.latitude);
  const lng = parseFloat(place.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Zip has invalid coordinates" }, { status: 502 });
  }
  const centerName = place["place name"];
  const state = place["state abbreviation"] ?? place.state;
  const stateName = place.state ?? "";

  // 2) Overpass — places within radius. Highways are in the response shape
  // but kept as an empty array (OSM road data is too fragmented to render
  // cleanly at this zoom).
  const radiusM = Math.round(miles * 1609.34);
  const query = `
[out:json][timeout:25];
(
  node["place"~"^(city|town|village|suburb|hamlet)$"]["name"](around:${radiusM},${lat},${lng});
);
out body 600;
`.trim();

  const OVERPASS_UA =
    "AmentiAffiliateBot/1.0 (coverage-map; contact: support@amentiai.com)";
  const OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];

  let overpass: OverpassResponse | null = null;
  let lastError: string | null = null;
  for (const url of OVERPASS_MIRRORS) {
    try {
      const r = await fetch(url, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": OVERPASS_UA,
          Accept: "application/json",
        },
        next: { revalidate: 86400 },
      });
      if (r.ok) {
        overpass = (await r.json()) as OverpassResponse;
        break;
      }
      lastError = `${url} → HTTP ${r.status}`;
    } catch (err) {
      lastError = `${url} → ${err instanceof Error ? err.message : "fetch failed"}`;
    }
  }
  if (!overpass && lastError) {
    console.warn("[coverage] Overpass all mirrors failed:", lastError);
  }

  const places: CoveragePlace[] = [];

  if (overpass?.elements) {
    for (const el of overpass.elements) {
      const tags = el.tags ?? {};
      if (el.type === "node" && tags.name && tags.place) {
        const kind = tags.place as CoveragePlace["kind"];
        if (!["city", "town", "village", "suburb", "hamlet"].includes(kind)) continue;
        if (!Number.isFinite(el.lat) || !Number.isFinite(el.lon)) continue;
        const miFromCenter = haversineMiles(lat, lng, el.lat, el.lon);
        if (!Number.isFinite(miFromCenter)) continue;
        if (miFromCenter > miles + 0.5) continue;
        const nameMatchesCenter =
          tags.name.toLowerCase() === centerName.toLowerCase();
        if (nameMatchesCenter && miFromCenter < 3) continue;
        if (miFromCenter < 0.6) continue;
        const popRaw = tags.population ? parseInt(tags.population, 10) : undefined;
        const pop = Number.isFinite(popRaw) ? popRaw : undefined;
        places.push({
          name: tags.name,
          lat: el.lat,
          lng: el.lon,
          kind,
          population: pop,
          miles: miFromCenter,
        });
      }
    }
  }

  const placeByName = new Map<string, CoveragePlace>();
  for (const p of places) {
    const existing = placeByName.get(p.name);
    if (!existing || p.miles < existing.miles) placeByName.set(p.name, p);
  }
  const dedupedPlaces = Array.from(placeByName.values())
    .sort((a, b) => a.miles - b.miles)
    .slice(0, 80);

  const body: Coverage = {
    center: { lat, lng, name: centerName, zip, state, stateName },
    radius: miles,
    places: dedupedPlaces,
    highways: [],
    degraded: overpass === null,
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
