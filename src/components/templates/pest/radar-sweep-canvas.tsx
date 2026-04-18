"use client";

import { useEffect, useRef } from "react";

type Props = {
  // Base color for the sweep arm + pings. Defaults to lime-green radar color.
  color?: string;
  // Grid/ring color (translucent). Defaults to a dim mix of `color`.
  gridColor?: string;
  className?: string;
};

type Ping = {
  x: number;
  y: number;
  age: number; // seconds since spawn
  life: number; // lifetime in seconds
  radius: number; // max ring radius
};

// Full-bleed radar-sweep canvas. Draws concentric rings, a rotating sweep arm
// with trailing fade, and pulsing pings that spawn as the sweep passes over
// them. Designed to sit behind a dark hero image as an ambient pest-detection
// motif.
export function RadarSweepCanvas({
  color = "rgba(134, 239, 172, 0.9)",
  gridColor = "rgba(134, 239, 172, 0.18)",
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
    let sweepAngle = 0; // radians
    const sweepSpeed = 0.7; // rad/sec (≈5.7s per revolution)
    const pings: Ping[] = [];
    let pingCooldown = 0.5;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function sizeCanvas() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawGrid(cx: number, cy: number, maxR: number) {
      ctx!.strokeStyle = gridColor;
      ctx!.lineWidth = 1;
      // Concentric rings
      for (let i = 1; i <= 4; i++) {
        ctx!.beginPath();
        ctx!.arc(cx, cy, (maxR * i) / 4, 0, Math.PI * 2);
        ctx!.stroke();
      }
      // Crosshair
      ctx!.beginPath();
      ctx!.moveTo(cx - maxR, cy);
      ctx!.lineTo(cx + maxR, cy);
      ctx!.moveTo(cx, cy - maxR);
      ctx!.lineTo(cx, cy + maxR);
      ctx!.stroke();
    }

    function drawSweep(cx: number, cy: number, r: number, angle: number) {
      // Build a cone-shaped gradient fading behind the sweep arm.
      const steps = 22;
      const span = Math.PI / 2.4; // 75° trailing cone
      for (let i = 0; i < steps; i++) {
        const a0 = angle - (span * i) / steps;
        const a1 = angle - (span * (i + 1)) / steps;
        const alpha = 0.28 * (1 - i / steps);
        ctx!.beginPath();
        ctx!.moveTo(cx, cy);
        ctx!.arc(cx, cy, r, a1, a0);
        ctx!.closePath();
        ctx!.fillStyle = rgbaWithAlpha(color, alpha);
        ctx!.fill();
      }
      // Leading edge line
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.moveTo(cx, cy);
      ctx!.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx!.stroke();
    }

    function spawnPing(cx: number, cy: number, maxR: number) {
      // Spawn within the visible disc, biased toward mid-radius.
      const r = maxR * (0.25 + Math.random() * 0.65);
      const a = Math.random() * Math.PI * 2;
      pings.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        age: 0,
        life: 1.8,
        radius: 34 + Math.random() * 18,
      });
    }

    function drawPings(dt: number) {
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        p.age += dt;
        const t = p.age / p.life;
        if (t >= 1) {
          pings.splice(i, 1);
          continue;
        }
        const r = p.radius * t;
        const alpha = (1 - t) * 0.9;
        ctx!.strokeStyle = rgbaWithAlpha(color, alpha);
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx!.stroke();
        // solid dot at center
        ctx!.fillStyle = rgbaWithAlpha(color, Math.min(1, alpha + 0.15));
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function step(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const rect = canvas!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);

      // Center the radar below the hero content, slightly off-screen so only
      // the top half of the radar arc is visible behind the hero.
      const cx = rect.width * 0.78;
      const cy = rect.height * 0.55;
      const maxR = Math.max(rect.width, rect.height) * 0.72;

      drawGrid(cx, cy, maxR);

      if (!reduced) {
        sweepAngle += sweepSpeed * dt;
        pingCooldown -= dt;
        if (pingCooldown <= 0) {
          spawnPing(cx, cy, maxR * 0.8);
          pingCooldown = 0.6 + Math.random() * 1.4;
        }
      }

      drawSweep(cx, cy, maxR, sweepAngle);
      drawPings(reduced ? 0 : dt);

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
  }, [color, gridColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

// Takes an rgba() or rgb() or hex color and overrides/sets its alpha channel.
// Keeps prop surface simple — callers pass a color and we derive faded
// variants from it.
function rgbaWithAlpha(input: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const rgbMatch = input.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(",").map((p) => p.trim());
    const [r, g, b] = parts;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  const hexMatch = input.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return input;
}
