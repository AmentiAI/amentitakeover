// Polygon-data wrapper around us-atlas states-10m TopoJSON.
// Sister file to ./us-states.ts (which only has FIPS / name / abbrev lookups);
// kept separate so we don't pull topojson-client into routes that just want
// the code-to-name map.

import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";
import { feature } from "topojson-client";
import statesTopo from "us-atlas/states-10m.json";
import { normalizeState } from "./us-states";

export type StateFeature = Feature<Polygon | MultiPolygon, { name: string }>;

type BBox = { west: number; east: number; north: number; south: number };

let cached: StateFeature[] | null = null;
let byName: Map<string, StateFeature> | null = null;

function load(): StateFeature[] {
  if (cached) return cached;
  const gj = feature(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    statesTopo as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (statesTopo as any).objects.states,
  ) as unknown as FeatureCollection<Polygon | MultiPolygon, { name: string }>;
  cached = gj.features as StateFeature[];
  byName = new Map();
  for (const f of cached) {
    if (f.properties?.name) byName.set(f.properties.name.toLowerCase(), f);
  }
  return cached;
}

export function getStateByName(name: string): StateFeature | null {
  if (!name) return null;
  load();
  return byName!.get(name.toLowerCase()) ?? null;
}

// Accepts a 2-letter abbreviation or a full state name; resolves either to
// the polygon feature. Returns null for non-US strings.
export function getStateByCodeOrName(raw: string | null | undefined): StateFeature | null {
  const norm = normalizeState(raw);
  if (norm) return getStateByName(norm.name);
  if (raw) return getStateByName(raw);
  return null;
}

export function getAllStates(): StateFeature[] {
  return load();
}

export function featureBBox(f: StateFeature): BBox {
  let west = Infinity, east = -Infinity, north = -Infinity, south = Infinity;
  const rings =
    f.geometry.type === "Polygon"
      ? [f.geometry.coordinates]
      : f.geometry.coordinates;
  for (const poly of rings) {
    for (const ring of poly) {
      for (const [lng, lat] of ring) {
        if (lng < west) west = lng;
        if (lng > east) east = lng;
        if (lat < south) south = lat;
        if (lat > north) north = lat;
      }
    }
  }
  return { west, east, north, south };
}

export function getStatesInBBox(bbox: BBox): StateFeature[] {
  const all = load();
  const out: StateFeature[] = [];
  for (const f of all) {
    const fb = featureBBox(f);
    const intersects =
      fb.west <= bbox.east &&
      fb.east >= bbox.west &&
      fb.south <= bbox.north &&
      fb.north >= bbox.south;
    if (intersects) out.push(f);
  }
  return out;
}

export function forEachRing(
  f: StateFeature,
  cb: (ring: [number, number][], isOuter: boolean) => void,
) {
  const polys =
    f.geometry.type === "Polygon"
      ? [f.geometry.coordinates]
      : f.geometry.coordinates;
  for (const poly of polys) {
    for (let i = 0; i < poly.length; i++) {
      cb(poly[i] as [number, number][], i === 0);
    }
  }
}

