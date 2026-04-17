"use client";

import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  Star,
} from "lucide-react";
import { STATE_BY_FIPS } from "@/lib/us-states";

type MapPoint = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  industry: string | null;
  rating: number | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
};

type Props = {
  points: MapPoint[];
  stateCounts: Record<string, number>;
  topoUrl: string;
};

export function UsaMap({ points, stateCounts, topoUrl }: Props) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [hoverCode, setHoverCode] = useState<string | null>(null);
  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({ coordinates: [-96, 38], zoom: 1 });

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(stateCounts)),
    [stateCounts],
  );

  const colorScale = useMemo(
    () =>
      scaleLinear<string>()
        .domain([0, Math.max(1, maxCount / 4), maxCount])
        .range(["#f0fdf4", "#86efac", "#15803d"]),
    [maxCount],
  );

  const selectedPoints = useMemo(() => {
    if (!selectedCode) return [];
    return points.filter((p) => {
      if (!p.state) return false;
      const st = p.state.toUpperCase();
      if (st === selectedCode) return true;
      const fips = Object.entries(STATE_BY_FIPS).find(
        ([, v]) => v.code === selectedCode,
      );
      if (!fips) return false;
      return p.state.toLowerCase() === fips[1].name.toLowerCase();
    });
  }, [selectedCode, points]);

  const markerPoints = useMemo(() => {
    const base = selectedCode ? selectedPoints : points;
    return base.filter((p) => p.lat != null && p.lng != null);
  }, [points, selectedCode, selectedPoints]);

  const showMarkers = position.zoom >= 2 || selectedCode != null;
  const totalPoints = points.length;
  const totalStates = Object.keys(stateCounts).length;

  function handleZoomIn() {
    setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 12) }));
  }
  function handleZoomOut() {
    setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }));
  }
  function handleReset() {
    setSelectedCode(null);
    setPosition({ coordinates: [-96, 38], zoom: 1 });
  }

  function selectState(code: string) {
    setSelectedCode(code);
    const first = points.find(
      (p) =>
        p.state?.toUpperCase() === code ||
        p.state?.toLowerCase() ===
          Object.values(STATE_BY_FIPS)
            .find((s) => s.code === code)
            ?.name.toLowerCase(),
    );
    if (first?.lat && first?.lng) {
      setPosition({ coordinates: [first.lng, first.lat], zoom: 4 });
    }
  }

  const selectedStateName = selectedCode
    ? Object.values(STATE_BY_FIPS).find((s) => s.code === selectedCode)?.name
    : null;

  return (
    <div className="flex h-full flex-col gap-3 lg:flex-row lg:gap-4">
      <div className="relative h-[55vh] min-h-[340px] overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100 lg:h-full lg:flex-1">
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 px-2 py-1.5 shadow-sm backdrop-blur sm:left-4 sm:top-4 sm:gap-2 sm:px-3 sm:py-2">
          <MapPin className="h-3 w-3 text-slate-500 sm:h-3.5 sm:w-3.5" />
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-[11px]">
            {totalPoints.toLocaleString()} <span className="hidden sm:inline">businesses · {totalStates} states</span>
            <span className="sm:hidden">leads</span>
          </div>
        </div>

        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur sm:right-4 sm:top-4">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="grid h-8 w-8 place-items-center rounded text-slate-600 hover:bg-slate-100 sm:h-7 sm:w-7"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="grid h-8 w-8 place-items-center rounded text-slate-600 hover:bg-slate-100 sm:h-7 sm:w-7"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleReset}
            aria-label="Reset view"
            className="grid h-8 w-8 place-items-center rounded text-slate-600 hover:bg-slate-100 sm:h-7 sm:w-7"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {hoverCode && !selectedCode ? (
          <div className="pointer-events-none absolute bottom-2 left-2 z-10 hidden rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur sm:block sm:bottom-4 sm:left-4">
            <div className="text-[13px] font-semibold text-slate-900">
              {Object.values(STATE_BY_FIPS).find((s) => s.code === hoverCode)?.name}
            </div>
            <div className="text-[11px] text-slate-500">
              {stateCounts[hoverCode] ?? 0} businesses
            </div>
          </div>
        ) : null}

        <div className="absolute bottom-2 right-2 z-10 hidden items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur sm:bottom-4 sm:right-4 sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Density
          </span>
          <div
            className="h-2 w-28 rounded-full"
            style={{
              background:
                "linear-gradient(to right, #f0fdf4, #86efac, #15803d)",
            }}
          />
          <span className="text-[10px] text-slate-400">0</span>
          <span className="text-[10px] text-slate-400">{maxCount}</span>
        </div>

        <ComposableMap projection="geoAlbersUsa" className="h-full w-full">
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMoveEnd={(pos) => setPosition(pos)}
            maxZoom={12}
          >
            <Geographies geography={topoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const fips = String(geo.id).padStart(2, "0");
                  const meta = STATE_BY_FIPS[fips];
                  if (!meta) return null;
                  const count = stateCounts[meta.code] ?? 0;
                  const isSelected = selectedCode === meta.code;
                  const isHover = hoverCode === meta.code;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoverCode(meta.code)}
                      onMouseLeave={() => setHoverCode(null)}
                      onClick={() => selectState(meta.code)}
                      style={{
                        default: {
                          fill: count > 0 ? colorScale(count) : "#f8fafc",
                          stroke: isSelected ? "#0f172a" : "#cbd5e1",
                          strokeWidth: isSelected ? 1.5 : 0.5,
                          outline: "none",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        },
                        hover: {
                          fill:
                            count > 0
                              ? colorScale(Math.min(maxCount, count * 1.3))
                              : "#e2e8f0",
                          stroke: "#0f172a",
                          strokeWidth: 1,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#22c55e",
                          stroke: "#0f172a",
                          strokeWidth: 1,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {showMarkers
              ? markerPoints.map((p) => (
                  <Marker key={p.id} coordinates={[p.lng!, p.lat!]}>
                    <g>
                      <circle
                        r={6 / position.zoom}
                        fill="#22c55e"
                        fillOpacity={0.25}
                      />
                      <circle
                        r={2.5 / position.zoom}
                        fill="#15803d"
                        stroke="#fff"
                        strokeWidth={0.5 / position.zoom}
                      />
                    </g>
                  </Marker>
                ))
              : null}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <div className="flex h-[40vh] min-h-[240px] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:h-full lg:w-80">
        {selectedCode ? (
          <>
            <div className="border-b border-slate-200 px-4 py-3">
              <button
                onClick={handleReset}
                className="mb-2 flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="h-3 w-3" /> All states
              </button>
              <div className="text-lg font-semibold text-slate-900">
                {selectedStateName}
              </div>
              <div className="text-[11px] text-slate-500">
                {selectedPoints.length} businesses scraped
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {selectedPoints.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No businesses in this state yet.
                </div>
              ) : (
                <div className="space-y-1">
                  {selectedPoints.map((p) => (
                    <BusinessRow key={p.id} p={p} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Top states
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Click a state to drill in
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-0.5">
                {Object.entries(stateCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([code, count]) => {
                    const meta = Object.values(STATE_BY_FIPS).find(
                      (s) => s.code === code,
                    );
                    const pct = (count / maxCount) * 100;
                    return (
                      <button
                        key={code}
                        onClick={() => selectState(code)}
                        className="group relative flex w-full items-center justify-between gap-2 rounded px-2.5 py-1.5 text-left hover:bg-slate-50"
                      >
                        <div
                          className="absolute inset-y-0 left-0 rounded"
                          style={{
                            width: `${pct}%`,
                            background: colorScale(count),
                            opacity: 0.25,
                          }}
                        />
                        <div className="relative flex items-center gap-2">
                          <span className="w-7 text-[10px] font-mono font-semibold text-slate-400">
                            {code}
                          </span>
                          <span className="text-xs text-slate-700 group-hover:text-slate-900">
                            {meta?.name ?? code}
                          </span>
                        </div>
                        <span className="relative text-xs font-semibold text-slate-700">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                {Object.keys(stateCounts).length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No scraped businesses yet.
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BusinessRow({ p }: { p: MapPoint }) {
  return (
    <div className="group rounded-md border border-transparent px-2.5 py-2 hover:border-slate-200 hover:bg-slate-50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-slate-900">
            {p.name}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
            {p.city ? <span>{p.city}</span> : null}
            {p.industry ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                {p.industry}
              </span>
            ) : null}
          </div>
        </div>
        {p.website ? (
          <a
            href={p.website}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded p-1 text-slate-400 opacity-0 transition hover:bg-white hover:text-slate-700 group-hover:opacity-100"
            aria-label="Open website"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
      {p.rating ? (
        <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-500">
          <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
          <span className="font-medium">{p.rating.toFixed(1)}</span>
        </div>
      ) : null}
    </div>
  );
}
