"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
};

type Zone = {
  label: string;
  // Rect in normalized 0..1 space relative to a house diagram.
  x: number;
  y: number;
  w: number;
  h: number;
  // Phase offset (0..1) so zones pulse on different cycles.
  phase: number;
};

type Crawler = {
  // Parametric position along the house perimeter (0..1).
  t: number;
  speed: number;
  size: number;
};

// Cutaway house diagram with four treatment zones (attic, kitchen, basement,
// perimeter) that pulse emerald to illustrate an active treatment plan. A
// handful of ants crawl along the outer perimeter line. Meant as a hero
// accent on the home page — tells the coverage story visually.
export function TreatmentZonesCanvas({ className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let running = true;
    let frameId = 0;
    let t0 = performance.now();

    const zones: Zone[] = [
      { label: "ATTIC", x: 0.30, y: 0.14, w: 0.40, h: 0.17, phase: 0 },
      { label: "KITCHEN", x: 0.08, y: 0.46, w: 0.28, h: 0.20, phase: 0.25 },
      { label: "LIVING", x: 0.40, y: 0.46, w: 0.26, h: 0.20, phase: 0.5 },
      { label: "FOUNDATION", x: 0.08, y: 0.72, w: 0.84, h: 0.10, phase: 0.75 },
    ];

    const crawlers: Crawler[] = Array.from({ length: 5 }, (_, i) => ({
      t: (i / 5 + Math.random() * 0.1) % 1,
      speed: 0.014 + Math.random() * 0.008,
      size: 4.5 + Math.random() * 1.8,
    }));

    function sizeCanvas() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Parametric perimeter walk for ants. The house outline has six segments
    // (left wall, left roof, right roof, right wall, bottom, and the bottom
    // return). We treat it as a closed polyline and find position by arc.
    function housePoints(W: number, H: number) {
      const pad = 24;
      const x0 = pad;
      const y0 = pad;
      const x1 = W - pad;
      const y1 = H - pad;
      const midX = (x0 + x1) / 2;
      const roofY = y0 + (y1 - y0) * 0.14;
      const wallTopY = y0 + (y1 - y0) * 0.32;
      return {
        topLeft: { x: x0, y: wallTopY },
        peak: { x: midX, y: roofY },
        topRight: { x: x1, y: wallTopY },
        bottomRight: { x: x1, y: y1 },
        bottomLeft: { x: x0, y: y1 },
        floorY: y0 + (y1 - y0) * 0.64,
      };
    }

    function pointOnPerimeter(W: number, H: number, t: number) {
      const p = housePoints(W, H);
      const segs = [
        [p.topLeft, p.peak],
        [p.peak, p.topRight],
        [p.topRight, p.bottomRight],
        [p.bottomRight, p.bottomLeft],
        [p.bottomLeft, p.topLeft],
      ];
      const lens = segs.map(([a, b]) => Math.hypot(b.x - a.x, b.y - a.y));
      const total = lens.reduce((a, b) => a + b, 0);
      let d = (t % 1) * total;
      for (let i = 0; i < segs.length; i++) {
        if (d <= lens[i]) {
          const [a, b] = segs[i];
          const u = d / lens[i];
          const x = a.x + (b.x - a.x) * u;
          const y = a.y + (b.y - a.y) * u;
          const angle = Math.atan2(b.y - a.y, b.x - a.x);
          return { x, y, angle };
        }
        d -= lens[i];
      }
      return { x: 0, y: 0, angle: 0 };
    }

    function drawHouseDiagram(W: number, H: number) {
      const p = housePoints(W, H);

      // Outer outline — solid emerald.
      ctx!.strokeStyle = "rgba(134, 239, 172, 0.85)";
      ctx!.fillStyle = "rgba(6, 12, 9, 0.85)";
      ctx!.lineWidth = 1.8;
      ctx!.beginPath();
      ctx!.moveTo(p.topLeft.x, p.topLeft.y);
      ctx!.lineTo(p.peak.x, p.peak.y);
      ctx!.lineTo(p.topRight.x, p.topRight.y);
      ctx!.lineTo(p.bottomRight.x, p.bottomRight.y);
      ctx!.lineTo(p.bottomLeft.x, p.bottomLeft.y);
      ctx!.closePath();
      ctx!.fill();
      ctx!.stroke();

      // Interior floor line (separates attic from rooms).
      ctx!.strokeStyle = "rgba(134, 239, 172, 0.35)";
      ctx!.lineWidth = 1;
      ctx!.setLineDash([3, 4]);
      ctx!.beginPath();
      ctx!.moveTo(p.topLeft.x, p.floorY);
      ctx!.lineTo(p.topRight.x, p.floorY);
      ctx!.stroke();

      // Interior room divider (kitchen | living).
      const dividerX = (p.topLeft.x + p.topRight.x) / 2 - 6;
      ctx!.beginPath();
      ctx!.moveTo(dividerX, p.floorY);
      ctx!.lineTo(dividerX, p.bottomRight.y);
      ctx!.stroke();
      ctx!.setLineDash([]);
    }

    function drawZone(zone: Zone, W: number, H: number, tGlobal: number) {
      const p = housePoints(W, H);
      const x = p.topLeft.x + (p.topRight.x - p.topLeft.x) * zone.x;
      const y = p.topLeft.y + (H - 48 - p.topLeft.y) * 0; // unused — use direct rect
      const rx = p.topLeft.x + zone.x * (p.topRight.x - p.topLeft.x);
      const ry = p.peak.y + zone.y * (H - 48 - p.peak.y);
      const rw = zone.w * (p.topRight.x - p.topLeft.x);
      const rh = zone.h * (H - 48 - p.peak.y);

      const pulse = 0.5 + 0.5 * Math.sin((tGlobal + zone.phase) * Math.PI * 2);
      const fillAlpha = 0.12 + pulse * 0.22;
      const strokeAlpha = 0.45 + pulse * 0.45;

      // Fill + outline.
      ctx!.fillStyle = `rgba(52, 211, 153, ${fillAlpha.toFixed(3)})`;
      ctx!.strokeStyle = `rgba(134, 239, 172, ${strokeAlpha.toFixed(3)})`;
      ctx!.lineWidth = 1.1;
      ctx!.beginPath();
      roundedRect(ctx!, rx, ry, rw, rh, 6);
      ctx!.fill();
      ctx!.stroke();

      // Label.
      ctx!.fillStyle = `rgba(220, 252, 231, ${(0.7 + pulse * 0.25).toFixed(3)})`;
      ctx!.font = "bold 9px system-ui, -apple-system, sans-serif";
      ctx!.textBaseline = "top";
      ctx!.fillText(zone.label, rx + 8, ry + 6);

      // A small pulsing dot at zone center.
      const cx = rx + rw / 2;
      const cy = ry + rh / 2;
      const r = 2 + pulse * 2;
      ctx!.fillStyle = `rgba(134, 239, 172, ${(0.4 + pulse * 0.6).toFixed(3)})`;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      ctx!.fill();

      // Ripple ring.
      const ringR = 6 + pulse * 20;
      ctx!.strokeStyle = `rgba(52, 211, 153, ${(0.35 * (1 - pulse)).toFixed(3)})`;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx!.stroke();

      // Guard the unused params from eslint-unused warnings.
      void x;
      void y;
    }

    function drawCrawler(c: Crawler, W: number, H: number) {
      const pos = pointOnPerimeter(W, H, c.t);
      ctx!.save();
      ctx!.translate(pos.x, pos.y);
      ctx!.rotate(pos.angle);
      ctx!.fillStyle = "rgba(180, 135, 80, 0.96)";
      // Ant: 3 body segments
      ctx!.beginPath();
      ctx!.arc(c.size * 0.55, 0, c.size * 0.28, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.beginPath();
      ctx!.ellipse(0, 0, c.size * 0.35, c.size * 0.25, 0, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.beginPath();
      ctx!.ellipse(-c.size * 0.5, 0, c.size * 0.45, c.size * 0.3, 0, 0, Math.PI * 2);
      ctx!.fill();
      // Simple legs
      ctx!.strokeStyle = "rgba(180, 135, 80, 0.96)";
      ctx!.lineWidth = 0.8;
      for (const sx of [-0.3, 0, 0.3]) {
        for (const dy of [-1, 1]) {
          ctx!.beginPath();
          ctx!.moveTo(sx * c.size, 0);
          ctx!.lineTo(sx * c.size + 2, dy * c.size * 0.9);
          ctx!.stroke();
        }
      }
      ctx!.restore();
    }

    function step(now: number) {
      if (!running) return;
      const rect = canvas!.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      ctx!.clearRect(0, 0, W, H);

      // Pulsing grid backdrop.
      ctx!.strokeStyle = "rgba(134, 239, 172, 0.06)";
      ctx!.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 22) {
        ctx!.beginPath();
        ctx!.moveTo(gx, 0);
        ctx!.lineTo(gx, H);
        ctx!.stroke();
      }
      for (let gy = 0; gy < H; gy += 22) {
        ctx!.beginPath();
        ctx!.moveTo(0, gy);
        ctx!.lineTo(W, gy);
        ctx!.stroke();
      }

      drawHouseDiagram(W, H);

      const tGlobal = ((now - t0) / 1000) * 0.28;
      for (const z of zones) drawZone(z, W, H, tGlobal);

      if (!reduced) {
        for (const c of crawlers) {
          c.t = (c.t + c.speed * 0.016) % 1;
          drawCrawler(c, W, H);
        }
      } else {
        for (const c of crawlers) drawCrawler(c, W, H);
      }

      frameId = requestAnimationFrame(step);
    }

    const onResize = () => sizeCanvas();
    sizeCanvas();
    window.addEventListener("resize", onResize);
    frameId = requestAnimationFrame(step);
    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}
