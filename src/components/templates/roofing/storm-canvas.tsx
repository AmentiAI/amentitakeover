"use client";

import { useEffect, useRef } from "react";

type Props = {
  // Base color for rain streaks.
  rainColor?: string;
  // Lightning flash color (fills a frame on strike).
  flashColor?: string;
  // Rain density — number of streaks on screen at once. Scaled down on mobile.
  density?: number;
  className?: string;
};

type Drop = {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
};

// Ambient storm-front canvas for the roofing hero. Rain streaks fall diagonally
// across the frame; every few seconds a lightning flash briefly floods the
// scene. Respects prefers-reduced-motion (falls back to a static overlay).
export function StormCanvas({
  rainColor = "rgba(148, 163, 184, 0.6)",
  flashColor = "rgba(226, 232, 240, 0.35)",
  density = 90,
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
    let lastTs = performance.now();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Diagonal wind: streaks fall slightly to the right to feel like a front.
    const windX = 110;
    const gravity = 740;

    const drops: Drop[] = [];
    // Lightning state: flashIntensity decays over the frame after a strike.
    let flashIntensity = 0;
    let nextStrikeIn = 4 + Math.random() * 5;

    function sizeCanvas() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnDrops() {
      drops.length = 0;
      const rect = canvas!.getBoundingClientRect();
      const scaled = rect.width < 640 ? Math.max(30, Math.floor(density * 0.55)) : density;
      for (let i = 0; i < scaled; i++) {
        drops.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          len: 14 + Math.random() * 18,
          speed: 0.8 + Math.random() * 0.7,
          alpha: 0.35 + Math.random() * 0.45,
        });
      }
    }

    function step(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const rect = canvas!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);

      // Lightning scheduling (skip when reduced).
      if (!reduced) {
        nextStrikeIn -= dt;
        if (nextStrikeIn <= 0) {
          flashIntensity = 1;
          nextStrikeIn = 5 + Math.random() * 7;
        }
        if (flashIntensity > 0) {
          // Multi-beat flash: quick bright peak, fast decay. Alpha easing is
          // cubic so the tail is short but visible.
          const a = Math.pow(flashIntensity, 2) * 0.55;
          ctx!.fillStyle = withAlpha(flashColor, a);
          ctx!.fillRect(0, 0, rect.width, rect.height);
          flashIntensity = Math.max(0, flashIntensity - dt * 2.4);
        }
      }

      // Rain streaks (angle ≈ atan2(gravity, windX)).
      const angle = Math.atan2(gravity, windX);
      const vx = Math.cos(angle);
      const vy = Math.sin(angle);

      ctx!.lineCap = "round";
      for (const d of drops) {
        if (!reduced) {
          d.x += windX * d.speed * dt;
          d.y += gravity * d.speed * dt;
          if (d.y > rect.height + 20 || d.x > rect.width + 20) {
            // Recycle back above the top edge at a random x — offset by a
            // small random amount so rows don't visibly sync.
            d.y = -20 - Math.random() * 40;
            d.x = Math.random() * rect.width - 40;
          }
        }
        ctx!.strokeStyle = withAlpha(rainColor, d.alpha);
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(d.x, d.y);
        ctx!.lineTo(d.x + vx * d.len * -0.3, d.y + vy * d.len * -0.3);
        ctx!.stroke();
      }

      frameId = requestAnimationFrame(step);
    }

    const onResize = () => {
      sizeCanvas();
      spawnDrops();
    };

    sizeCanvas();
    spawnDrops();
    window.addEventListener("resize", onResize);
    frameId = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, [rainColor, flashColor, density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
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
