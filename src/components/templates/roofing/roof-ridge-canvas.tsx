"use client";

import { useEffect, useRef } from "react";

type Props = {
  // Color of the ridge line and shingle grid. Defaults to a cool slate.
  color?: string;
  // Warm accent used for the sun glow behind the ridge.
  sunColor?: string;
  className?: string;
};

// Decorative ridge canvas: draws a pitched-roof silhouette with a grid of
// shingle/tile squares that "lay" down row-by-row on mount, plus a warm sun
// haze behind the peak. Pairs with the storm-canvas for a
// weather-confronts-craftsmanship hero composition.
export function RoofRidgeCanvas({
  color = "rgba(226, 232, 240, 0.85)",
  sunColor = "rgba(251, 191, 36, 0.35)",
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let frameId = 0;
    const startTs = performance.now();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function sizeCanvas() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function step(now: number) {
      if (!running) return;

      const rect = canvas!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);

      const cx = rect.width / 2;
      const peakY = rect.height * 0.22;
      const baseY = rect.height * 0.78;
      const span = Math.min(rect.width * 0.9, rect.height * 1.8);

      // Warm sun glow behind the peak.
      const glow = ctx!.createRadialGradient(cx, peakY, 6, cx, peakY, span * 0.5);
      glow.addColorStop(0, sunColor);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, rect.width, rect.height);

      // Row-by-row shingle lay-in. Each row "drops in" with a slight vertical
      // offset + fade-in over the first 1.4s after mount.
      const elapsed = (now - startTs) / 1000;
      const rows = 6;
      const rowH = (baseY - peakY) / rows;

      ctx!.strokeStyle = withAlpha(color, 0.85);
      ctx!.lineWidth = 1.6;

      for (let r = 0; r < rows; r++) {
        const rowDelay = r * 0.16;
        const t = reduced ? 1 : clamp01((elapsed - rowDelay) / 0.5);
        if (t <= 0) continue;

        const y = peakY + rowH * (r + 1);
        // Roof pitch: the shingle rows get wider as they descend from the peak.
        const halfWidth = ((y - peakY) / (baseY - peakY)) * (span / 2);
        const leftX = cx - halfWidth;
        const rightX = cx + halfWidth;

        // Vertical "drop" animation: rows start ~14px above and ease to rest.
        const dropOffset = (1 - t) * -14;
        const alpha = t * 0.9;

        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.translate(0, dropOffset);

        // Horizontal shingle row line.
        ctx!.beginPath();
        ctx!.moveTo(leftX, y);
        ctx!.lineTo(rightX, y);
        ctx!.stroke();

        // Vertical shingle breaks (offset alternately per row for realism).
        const tileCount = 10 + r * 2;
        const tileW = (rightX - leftX) / tileCount;
        const offset = r % 2 === 0 ? 0 : tileW / 2;
        for (let i = 0; i <= tileCount; i++) {
          const x = leftX + offset + i * tileW;
          if (x < leftX - 1 || x > rightX + 1) continue;
          ctx!.beginPath();
          ctx!.moveTo(x, y - rowH * 0.9);
          ctx!.lineTo(x, y);
          ctx!.stroke();
        }
        ctx!.restore();
      }

      // Ridge line on top (peak triangle).
      ctx!.strokeStyle = withAlpha(color, 0.98);
      ctx!.lineWidth = 2.2;
      ctx!.beginPath();
      ctx!.moveTo(cx - span / 2, baseY);
      ctx!.lineTo(cx, peakY);
      ctx!.lineTo(cx + span / 2, baseY);
      ctx!.stroke();

      // Ridge cap (small highlighted line along the peak).
      ctx!.strokeStyle = withAlpha(color, 0.6);
      ctx!.lineWidth = 3;
      ctx!.beginPath();
      ctx!.moveTo(cx - 22, peakY + 6);
      ctx!.lineTo(cx + 22, peakY + 6);
      ctx!.stroke();

      // Keep rendering for sun shimmer effect unless reduced.
      if (!reduced) {
        frameId = requestAnimationFrame(step);
      }
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
  }, [color, sunColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function withAlpha(input: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const rgb = input.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1].split(",").map((p) => p.trim());
    const [r, g, b] = parts;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return input;
}
