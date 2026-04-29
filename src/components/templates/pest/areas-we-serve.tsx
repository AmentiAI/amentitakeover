"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePestTheme } from "./use-pest-theme";
import type { Coverage, CoveragePlace } from "@/app/api/coverage/route";
import { forEachRing, getStatesInBBox, type StateFeature } from "@/lib/us-state-shapes";

type FetchState =
  | { status: "idle" }
  | { status: "loading"; zip: string; miles: number }
  | { status: "ok"; data: Coverage }
  | { status: "error"; message: string };

const FALLBACK_ZIP = "06374";
const DEFAULT_MILES = 30;

const PRESETS: { zip: string; label: string }[] = [
  { zip: "06374", label: "Plainfield, CT" },
  { zip: "92101", label: "San Diego, CA" },
  { zip: "60601", label: "Chicago, IL" },
  { zip: "78701", label: "Austin, TX" },
  { zip: "10001", label: "New York, NY" },
];

const RADIUS_OPTIONS = [10, 20, 30, 50] as const;

function milesToEta(m: number) {
  if (m === 0) return "on-site";
  const minutes = Math.round(8 + m * 1.8);
  return `~${minutes} min`;
}

function zoneFromMiles(m: number, radius: number): { label: string; color: string } {
  const sameDay = Math.min(10, radius * 0.35);
  const next = Math.min(25, radius * 0.7);
  if (m <= sameDay) return { label: "SAME-DAY", color: "#34d399" };
  if (m <= next) return { label: "24-HOUR", color: "#fbbf24" };
  return { label: "SCHEDULED", color: "#60a5fa" };
}

function project(
  lat: number,
  lng: number,
  center: { lat: number; lng: number },
  pxPerMi: number,
  cx: number,
  cy: number,
) {
  const miPerDegLng = 69 * Math.cos((center.lat * Math.PI) / 180);
  const dxMi = (lng - center.lng) * miPerDegLng;
  const dyMi = (lat - center.lat) * 69;
  return { x: cx + dxMi * pxPerMi, y: cy - dyMi * pxPerMi };
}

type Hovered = { kind: "place"; idx: number } | null;

function AtlasCanvas({
  data,
  loading,
  activeIdx,
  onHover,
}: {
  data: Coverage | null;
  loading: boolean;
  activeIdx: number;
  onHover: (h: Hovered) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = usePestTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const dataRef = useRef<Coverage | null>(data);
  dataRef.current = data;
  const activeRef = useRef(activeIdx);
  activeRef.current = activeIdx;
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const hoverIdxRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? false));
    io.observe(canvas);

    const mapMetrics = () => {
      const mapR = (Math.min(w, h) / 2) * 0.86;
      return { cx: w / 2, cy: h / 2, mapR };
    };

    const nearestIdx = (mx: number, my: number) => {
      const d = dataRef.current;
      if (!d) return null;
      const m = mapMetrics();
      const pxPerMi = m.mapR / d.radius;
      let best = -1;
      let bestD = 22 * 22;
      for (let i = 0; i < d.places.length; i++) {
        const p = d.places[i];
        const { x, y } = project(p.lat, p.lng, d.center, pxPerMi, m.cx, m.cy);
        const dd = (x - mx) ** 2 + (y - my) ** 2;
        if (dd < bestD) {
          bestD = dd;
          best = i;
        }
      }
      return best >= 0 ? best : null;
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const idx = nearestIdx(e.clientX - r.left, e.clientY - r.top);
      if (idx !== hoverIdxRef.current) {
        hoverIdxRef.current = idx;
        onHover(idx !== null ? { kind: "place", idx } : null);
      }
    };
    const onLeave = () => {
      hoverIdxRef.current = null;
      onHover(null);
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    const drawPaper = (isLight: boolean) => {
      ctx.fillStyle = isLight ? "#f5eed8" : "#07131a";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = isLight ? "rgba(60,40,20,0.06)" : "rgba(160,200,230,0.04)";
      ctx.lineWidth = 1;
      const g = 24;
      for (let x = 0; x < w; x += g) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += g) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const drawCompass = (isLight: boolean) => {
      const cmpX = w - 40;
      const cmpY = 42;
      ctx.strokeStyle = isLight ? "rgba(60, 40, 20, 0.4)" : "rgba(200, 220, 235, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cmpX, cmpY, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = isLight ? "rgba(60, 40, 20, 0.9)" : "rgba(230, 240, 245, 0.9)";
      ctx.font = "bold 13px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("N", cmpX, cmpY - 12);
      ctx.fillText("S", cmpX, cmpY + 12);
      ctx.fillText("E", cmpX + 14, cmpY);
      ctx.fillText("W", cmpX - 14, cmpY);
      ctx.strokeStyle = isLight ? "rgba(120, 30, 10, 0.7)" : "rgba(250, 170, 110, 0.8)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cmpX, cmpY - 8);
      ctx.lineTo(cmpX, cmpY + 8);
      ctx.stroke();
    };

    const drawHud = (isLight: boolean, d: Coverage | null) => {
      ctx.font = "14px ui-monospace, Menlo, monospace";
      ctx.fillStyle = isLight ? "rgba(60, 40, 20, 0.8)" : "rgba(180, 220, 255, 0.65)";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const centerLabel = d ? `${d.center.name.toUpperCase()}, ${d.center.state} · ${d.center.zip}` : "— · —";
      ctx.fillText(`COVERAGE · ${centerLabel}`, 14, 14);
      ctx.textAlign = "right";
      if (d) {
        ctx.fillText(`${d.places.length} PLACES · ${d.radius}mi`, w - 72, 14);
      } else {
        ctx.fillText("— PLACES", w - 72, 14);
      }
    };

    const drawLoading = (isLight: boolean, t: number) => {
      drawPaper(isLight);
      drawHud(isLight, dataRef.current);
      drawCompass(isLight);
      const cx = w / 2;
      const cy = h / 2;
      ctx.strokeStyle = isLight ? "rgba(60,40,20,0.5)" : "rgba(200,220,235,0.55)";
      ctx.lineWidth = 2;
      const a = t * 0.004;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, a, a + Math.PI * 1.4);
      ctx.stroke();
      ctx.font = "bold 14px ui-monospace, Menlo, monospace";
      ctx.fillStyle = isLight ? "rgba(60,40,20,0.7)" : "rgba(200,220,235,0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Fetching coverage…", cx, cy + 34);
      ctx.font = "13px ui-monospace, Menlo, monospace";
      ctx.fillStyle = isLight ? "rgba(60,40,20,0.5)" : "rgba(200,220,235,0.5)";
      ctx.fillText("Zippopotam + OpenStreetMap", cx, cy + 50);
    };

    const drawMap = (isLight: boolean, d: Coverage, t: number) => {
      drawPaper(isLight);

      const { cx, cy, mapR } = mapMetrics();
      const pxPerMi = mapR / d.radius;

      // ---- State polygons (land) ----
      const bboxMiRadius = d.radius * 1.4;
      const miPerDegLng = 69 * Math.cos((d.center.lat * Math.PI) / 180);
      const bbox = {
        west: d.center.lng - bboxMiRadius / miPerDegLng,
        east: d.center.lng + bboxMiRadius / miPerDegLng,
        north: d.center.lat + bboxMiRadius / 69,
        south: d.center.lat - bboxMiRadius / 69,
      };
      const statesInView = getStatesInBBox(bbox);
      const landFill = isLight ? "rgba(225, 210, 170, 0.85)" : "rgba(30, 50, 62, 0.92)";
      const landStroke = isLight ? "rgba(90, 60, 25, 0.65)" : "rgba(160, 210, 235, 0.6)";
      const waterFill = isLight ? "rgba(170, 200, 220, 0.7)" : "rgba(10, 28, 48, 0.8)";

      // water layer behind everything
      ctx.fillStyle = waterFill;
      ctx.fillRect(0, 0, w, h);

      for (const s of statesInView) {
        ctx.fillStyle = landFill;
        ctx.beginPath();
        forEachRing(s as StateFeature, (ring) => {
          for (let i = 0; i < ring.length; i++) {
            const [lng, lat] = ring[i];
            const { x, y } = project(lat, lng, d.center, pxPerMi, cx, cy);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
        });
        ctx.fill("evenodd");
        ctx.strokeStyle = landStroke;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      const stipple = isLight ? "rgba(100, 75, 30, 0.06)" : "rgba(190, 220, 240, 0.04)";
      ctx.fillStyle = stipple;
      const stippleCount = Math.floor((w * h) / 1500);
      for (let i = 0; i < stippleCount; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }

      // coverage spotlight darkening
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.arc(cx, cy, mapR, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = isLight ? "rgba(30, 20, 10, 0.12)" : "rgba(0, 10, 18, 0.38)";
      ctx.fill();
      ctx.restore();

      // mileage rings
      const miInterval = d.radius >= 40 ? 10 : d.radius >= 20 ? 5 : 2;
      ctx.strokeStyle = isLight ? "rgba(80,55,25,0.2)" : "rgba(140,190,220,0.16)";
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      for (let m = miInterval; m < d.radius; m += miInterval) {
        ctx.beginPath();
        ctx.arc(cx, cy, m * pxPerMi, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // outer boundary
      const glowR = isLight ? "rgba(120,90,40,0.15)" : "rgba(140,200,230,0.18)";
      ctx.strokeStyle = glowR;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, mapR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = isLight ? "rgba(80,55,25,0.75)" : "rgba(160,210,235,0.75)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, mapR, 0, Math.PI * 2);
      ctx.stroke();

      // mile labels
      ctx.font = "14px ui-monospace, Menlo, monospace";
      ctx.fillStyle = isLight ? "rgba(80,55,25,0.7)" : "rgba(180,210,230,0.65)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let m = miInterval * 2; m <= d.radius; m += miInterval * 2) {
        const ry = cy - m * pxPerMi;
        const label = `${m}mi`;
        const lw = label.length * 7 + 6;
        ctx.fillStyle = isLight ? "rgba(245, 238, 216, 0.95)" : "rgba(7, 19, 26, 0.92)";
        ctx.fillRect(cx - lw / 2, ry - 6, lw, 12);
        ctx.fillStyle = isLight ? "rgba(80,55,25,0.85)" : "rgba(180,210,230,0.85)";
        ctx.fillText(label, cx, ry);
      }

      // Spotlight route HQ → focus place
      const active = activeRef.current;
      const hoverIdx = hoverIdxRef.current;
      const focusIdx = hoverIdx !== null ? hoverIdx : active;
      const focusPlace = d.places[focusIdx];
      if (focusPlace) {
        const { x: tx, y: ty } = project(focusPlace.lat, focusPlace.lng, d.center, pxPerMi, cx, cy);
        const dx = tx - cx;
        const dy = ty - cy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const bow = Math.min(40, len * 0.18);
        const midX = (cx + tx) / 2 + (-dy / len) * bow;
        const midY = (cy + ty) / 2 + (dx / len) * bow;

        const zone = zoneFromMiles(focusPlace.miles, d.radius);

        ctx.strokeStyle = `${zone.color}33`;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(midX, midY, tx, ty);
        ctx.stroke();
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -t * 0.025;
        ctx.strokeStyle = `${zone.color}cc`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(midX, midY, tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;

        const pulse = (t * 0.0005) % 1;
        const qx = cx * (1 - pulse) * (1 - pulse) + 2 * midX * (1 - pulse) * pulse + tx * pulse * pulse;
        const qy = cy * (1 - pulse) * (1 - pulse) + 2 * midY * (1 - pulse) * pulse + ty * pulse * pulse;
        ctx.fillStyle = zone.color;
        ctx.beginPath();
        ctx.arc(qx, qy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `${zone.color}55`;
        ctx.beginPath();
        ctx.arc(qx, qy, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // place pins
      const placesToDraw = d.places;
      for (let i = 0; i < placesToDraw.length; i++) {
        const p = placesToDraw[i];
        const { x: sx, y: sy } = project(p.lat, p.lng, d.center, pxPerMi, cx, cy);
        const isActive = i === focusIdx;
        const zone = zoneFromMiles(p.miles, d.radius);
        const r = isActive ? 7 : p.kind === "city" ? 5 : p.kind === "town" ? 4 : 3;

        ctx.fillStyle = isLight ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.ellipse(sx + 1.5, sy + 2.2, r + 1.5, (r + 1) * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `${zone.color}${isActive ? "ff" : "99"}`;
        ctx.lineWidth = isActive ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.arc(sx, sy, r + 2.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = zone.color;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.arc(sx - r * 0.3, sy - r * 0.3, r * 0.35, 0, Math.PI * 2);
        ctx.fill();

        if (isActive) {
          for (let k = 0; k < 2; k++) {
            const ringA = ((t * 0.0015 + k * 0.5) % 1);
            const alpha = (1 - ringA) * 0.8;
            ctx.strokeStyle = `${zone.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(sx, sy, r + 3 + ringA * 24, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      // labels
      ctx.font = "14px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      for (let i = 0; i < placesToDraw.length; i++) {
        const p = placesToDraw[i];
        const { x: sx, y: sy } = project(p.lat, p.lng, d.center, pxPerMi, cx, cy);
        const isActive = i === focusIdx;
        const showLabel = isActive || p.kind === "city" || (p.kind === "town" && p.miles < d.radius * 0.6);
        if (!showLabel) continue;
        const labelAbove = sy > cy - mapR + 20;
        const ly = labelAbove ? sy - 10 : sy + 18;
        const zone = zoneFromMiles(p.miles, d.radius);
        if (isActive) {
          const metrics = ctx.measureText(p.name);
          const lw = metrics.width + 12;
          const lh = 16;
          ctx.fillStyle = isLight ? "rgba(255,250,235,0.97)" : "rgba(10,20,28,0.95)";
          ctx.strokeStyle = zone.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(sx - lw / 2, ly - (labelAbove ? lh : 0), lw, lh, 3);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = isLight ? "#111" : "#fff";
          ctx.textBaseline = "middle";
          ctx.font = "bold 14px ui-sans-serif, system-ui";
          ctx.fillText(p.name, sx, ly - (labelAbove ? lh / 2 : -lh / 2));
          ctx.font = "14px ui-sans-serif, system-ui";
          ctx.textBaseline = "bottom";
        } else {
          const metrics = ctx.measureText(p.name);
          ctx.fillStyle = isLight ? "rgba(245, 238, 216, 0.7)" : "rgba(10, 20, 28, 0.65)";
          ctx.fillRect(sx - metrics.width / 2 - 3, ly - 12, metrics.width + 6, 13);
          ctx.fillStyle = isLight ? "rgba(30, 22, 8, 0.9)" : "rgba(230, 240, 245, 0.9)";
          ctx.fillText(p.name, sx, ly);
        }
      }

      // HQ marker
      for (let k = 0; k < 2; k++) {
        const ringA = ((t * 0.0006 + k * 0.5) % 1);
        const alpha = (1 - ringA) * 0.55;
        ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(cx, cy, 16 + ringA * 36, 0, Math.PI * 2);
        ctx.stroke();
      }
      const baseGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
      baseGlow.addColorStop(0, "rgba(52, 211, 153, 0.55)");
      baseGlow.addColorStop(1, "rgba(52, 211, 153, 0)");
      ctx.fillStyle = baseGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();
      const pulseA = 0.55 + (Math.sin(t * 0.003) + 1) / 2 * 0.35;
      ctx.strokeStyle = `rgba(52, 211, 153, ${pulseA})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, 18 + Math.sin(t * 0.003) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#34d399";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx + 8, cy);
      ctx.lineTo(cx, cy + 8);
      ctx.lineTo(cx - 8, cy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = isLight ? "#0a1f14" : "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.font = "bold 15px ui-sans-serif, system-ui";
      ctx.fillStyle = isLight ? "#0a1f14" : "#f0fdf4";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`HQ · ${d.center.name}`, cx, cy - 14);

      drawCompass(isLight);
      drawHud(isLight, d);

      if (d.degraded) {
        ctx.font = "bold 14px ui-monospace, Menlo, monospace";
        ctx.fillStyle = isLight ? "rgba(180, 40, 20, 0.9)" : "rgba(250, 140, 110, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("⚠ OSM temporarily unavailable · showing cached region", w / 2, h - 8);
      }
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const isLight = themeRef.current === "light";
      const d = dataRef.current;
      if (loadingRef.current || !d) {
        drawLoading(isLight, t);
      } else {
        drawMap(isLight, d, t);
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [onHover]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-pointer" />;
}

export function PestAreasWeServeSection({
  defaultZip,
}: {
  // Optional initial ZIP (e.g. business.postalCode). Falls back to a
  // sensible coastal-CT zip when the business doesn't have one on file.
  defaultZip?: string | null;
}) {
  const { theme } = usePestTheme();
  const isDark = theme === "dark";
  const initialZip = useMemo(() => {
    const candidate = (defaultZip ?? "").trim();
    return /^\d{5}$/.test(candidate) ? candidate : FALLBACK_ZIP;
  }, [defaultZip]);
  const [zip, setZip] = useState(initialZip);
  const [zipInput, setZipInput] = useState(initialZip);
  const [miles, setMiles] = useState<number>(DEFAULT_MILES);
  const [state, setState] = useState<FetchState>({ status: "idle" });
  const [activeIdx, setActiveIdx] = useState(0);
  const [hover, setHover] = useState<Hovered>(null);

  const fetchCoverage = useMemo(
    () => async (z: string, m: number) => {
      setState({ status: "loading", zip: z, miles: m });
      try {
        const r = await fetch(`/api/coverage?zip=${z}&miles=${m}`);
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { error?: string };
          setState({ status: "error", message: j.error ?? `HTTP ${r.status}` });
          return;
        }
        const data = (await r.json()) as Coverage;
        setState({ status: "ok", data });
        setActiveIdx(0);
      } catch (e) {
        setState({ status: "error", message: e instanceof Error ? e.message : "Fetch failed" });
      }
    },
    [],
  );

  useEffect(() => {
    fetchCoverage(zip, miles);
  }, [zip, miles, fetchCoverage]);

  useEffect(() => {
    if (state.status !== "ok") return;
    if (hover) return;
    const id = setInterval(() => {
      setActiveIdx((i) => {
        const total = state.data.places.length;
        if (total === 0) return 0;
        let n = i;
        while (n === i && total > 1) n = Math.floor(Math.random() * total);
        return n;
      });
    }, 3400);
    return () => clearInterval(id);
  }, [state, hover]);

  const effectiveIdx = hover?.kind === "place" ? hover.idx : activeIdx;
  const data = state.status === "ok" ? state.data : null;
  const activePlace: CoveragePlace | null =
    data && data.places[effectiveIdx] ? data.places[effectiveIdx] : null;
  const zone = activePlace && data ? zoneFromMiles(activePlace.miles, data.radius) : null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{5}$/.test(zipInput)) setZip(zipInput);
  };

  const inputBase = isDark
    ? "bg-white/[0.04] border-white/15 text-white placeholder:text-white/35 focus:border-emerald-400/60"
    : "bg-white border-slate-900/15 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600/60";

  return (
    <section
      className="relative w-full overflow-hidden py-14 sm:py-20 lg:py-28"
      style={{ backgroundColor: isDark ? "#06080a" : "#f7f2e4", transition: "background-color 350ms ease" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] ${isDark ? "text-white/45" : "text-slate-500"}`}>
          <span>13</span>
          <span className={`h-px w-8 ${isDark ? "bg-white/20" : "bg-slate-900/20"}`} />
          <span>Coverage</span>
        </div>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div>
            <h2 className={`max-w-3xl text-balance text-[clamp(1.6rem,4.8vw,3rem)] font-semibold leading-[1.1] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Check our <span className={isDark ? "text-emerald-300" : "text-emerald-700"}>service map.</span>
            </h2>
            <p className={`mt-2 max-w-xl text-sm sm:text-base ${isDark ? "text-white/60" : "text-slate-600"}`}>
              Enter any US zip and we&apos;ll render the real towns and state boundaries within that radius.
            </p>
          </div>
          <div className={`flex gap-3 font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-white/60" : "text-slate-600"}`}>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Same-day
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              24-hr
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Scheduled
            </span>
          </div>
        </div>

        <div
          className={`relative mt-6 overflow-hidden rounded-2xl border sm:mt-8 ${
            isDark ? "border-white/10 shadow-2xl shadow-black/40" : "border-slate-900/10 shadow-lg shadow-slate-900/10"
          }`}
        >
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/10]">
            <AtlasCanvas
              data={data}
              loading={state.status === "loading"}
              activeIdx={activeIdx}
              onHover={setHover}
            />

            {data && activePlace && zone && (
              <div
                className={`pointer-events-none absolute left-3 top-[46px] max-w-[70%] rounded-lg border px-3 py-2 backdrop-blur sm:left-4 sm:top-12 sm:max-w-none ${
                  isDark ? "border-white/15 bg-slate-950/70" : "border-slate-900/15 bg-white/90"
                }`}
              >
                <div className={`font-mono text-[9px] uppercase tracking-[0.2em] ${isDark ? "text-white/50" : "text-slate-500"}`}>
                  {hover ? "Hovered" : "Spotlight"}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className={`text-base font-semibold sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                    {activePlace.name}
                  </div>
                  <span
                    className="rounded-full border px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider"
                    style={{ borderColor: `${zone.color}80`, color: zone.color, background: `${zone.color}15` }}
                  >
                    {zone.label}
                  </span>
                </div>
                <div className={`mt-0.5 font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-white/55" : "text-slate-600"}`}>
                  {(activePlace.kind ?? "town").toUpperCase()} · {(activePlace.miles ?? 0).toFixed(1)} mi · {milesToEta(activePlace.miles ?? 0)}
                </div>
              </div>
            )}

            <form
              onSubmit={onSubmit}
              className={`pointer-events-auto absolute bottom-3 left-3 right-3 rounded-xl border p-3 backdrop-blur sm:bottom-5 sm:left-5 sm:right-auto sm:w-auto sm:p-3.5 ${
                isDark
                  ? "border-white/15 bg-slate-950/70"
                  : "border-slate-900/15 bg-white/90 shadow-lg shadow-slate-900/10"
              }`}
            >
              <div className="flex flex-wrap items-end gap-2 sm:flex-nowrap sm:gap-3">
                <div className="flex min-w-[88px] flex-col gap-1">
                  <label className={`font-mono text-[9px] uppercase tracking-[0.2em] ${isDark ? "text-white/55" : "text-slate-500"}`}>
                    Zip
                  </label>
                  <input
                    inputMode="numeric"
                    maxLength={5}
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
                    className={`w-[88px] rounded-md border px-2.5 py-1.5 font-mono text-sm outline-none transition ${inputBase}`}
                    placeholder={initialZip}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`font-mono text-[9px] uppercase tracking-[0.2em] ${isDark ? "text-white/55" : "text-slate-500"}`}>
                    Radius
                  </label>
                  <div className="flex gap-1">
                    {RADIUS_OPTIONS.map((r) => {
                      const on = miles === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setMiles(r)}
                          className={`rounded-md border px-2 py-1.5 font-mono text-[11px] font-semibold transition ${
                            on
                              ? isDark
                                ? "border-emerald-400/70 bg-emerald-400/15 text-emerald-200"
                                : "border-emerald-600/70 bg-emerald-500/15 text-emerald-700"
                              : isDark
                              ? "border-white/15 bg-white/[0.03] text-white/75 hover:border-white/30"
                              : "border-slate-900/15 bg-white text-slate-700 hover:border-slate-900/30"
                          }`}
                        >
                          {r}mi
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={state.status === "loading" || zipInput.length !== 5}
                  className={`h-[34px] shrink-0 rounded-md px-4 text-xs font-bold uppercase tracking-wider transition ${
                    state.status === "loading" || zipInput.length !== 5
                      ? isDark
                        ? "bg-white/10 text-white/40"
                        : "bg-slate-900/10 text-slate-400"
                      : isDark
                      ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {state.status === "loading" ? "…" : "Update"}
                </button>
              </div>

              <div
                className="mt-2 flex flex-wrap items-center gap-1.5 border-t pt-2 sm:mt-2.5 sm:pt-2.5"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
              >
                <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-slate-500"}`}>
                  Try
                </span>
                {PRESETS.map((p) => (
                  <button
                    key={p.zip}
                    type="button"
                    onClick={() => {
                      setZipInput(p.zip);
                      setZip(p.zip);
                    }}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
                      zip === p.zip
                        ? isDark
                          ? "border-white/30 bg-white/[0.08] text-white"
                          : "border-slate-900/30 bg-slate-900 text-white"
                        : isDark
                        ? "border-white/10 text-white/65 hover:border-white/25"
                        : "border-slate-900/10 text-slate-600 hover:border-slate-900/30"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </form>

            {state.status === "error" && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div
                  className={`max-w-sm rounded-xl border p-5 text-center backdrop-blur ${
                    isDark ? "border-rose-400/30 bg-rose-950/60 text-white" : "border-rose-600/30 bg-rose-50 text-slate-900"
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose-400">
                    Coverage error
                  </div>
                  <div className="mt-1 text-sm font-semibold">{state.message}</div>
                  <button
                    type="button"
                    onClick={() => fetchCoverage(zip, miles)}
                    className={`mt-4 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                      isDark
                        ? "border-white/30 text-white hover:bg-white/10"
                        : "border-slate-900/30 text-slate-900 hover:bg-slate-900/5"
                    }`}
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {data && data.places.length > 0 && (
          <>
            <div className={`mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm sm:mt-8 ${isDark ? "text-white/70" : "text-slate-700"}`}>
              <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${isDark ? "text-white/45" : "text-slate-500"}`}>
                {data.places.length} places within {data.radius}mi of {data.center.name}, {data.center.state}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 lg:grid-cols-4">
              {data.places.slice(0, 48).map((p, i) => {
                const z = zoneFromMiles(p.miles, data.radius);
                const active = i === effectiveIdx;
                return (
                  <button
                    key={`${p.name}-${p.lat}-${p.lng}`}
                    type="button"
                    onMouseEnter={() => setHover({ kind: "place", idx: i })}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover({ kind: "place", idx: i })}
                    onBlur={() => setHover(null)}
                    onClick={() => setActiveIdx(i)}
                    className={`group flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition ${
                      active
                        ? isDark
                          ? "border-white/30 bg-white/[0.08]"
                          : "border-slate-900/30 bg-white"
                        : isDark
                        ? "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                        : "border-slate-900/5 bg-white/70 hover:border-slate-900/20 hover:bg-white"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: z.color }} aria-hidden />
                      <span className={`truncate text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                        {p.name}
                      </span>
                    </span>
                    <span className={`shrink-0 font-mono text-[9px] uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>
                      {(p.miles ?? 0).toFixed(0)}mi
                    </span>
                  </button>
                );
              })}
            </div>
            {data.places.length > 48 && (
              <div className={`mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-slate-500"}`}>
                + {data.places.length - 48} more within radius
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
