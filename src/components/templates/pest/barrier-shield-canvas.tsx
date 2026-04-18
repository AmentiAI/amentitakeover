"use client";

import { useEffect, useRef } from "react";

type Props = {
  color?: string;
  glowColor?: string;
  className?: string;
};

type Intruder = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  repelled: boolean;
  repelFrame: number;
};

type Pulse = {
  age: number;
  life: number;
};

// Hero-accent canvas: draws a stylized house silhouette with pulsing shield
// rings emanating outward, plus small bug silhouettes that streak in from
// offscreen and get "zapped" (flash + deflect) when they hit the barrier.
// Sits over the radar in the hero, or alone in a protection-story section.
export function BarrierShieldCanvas({
  color = "rgba(134, 239, 172, 0.9)",
  glowColor = "rgba(52, 211, 153, 0.35)",
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

    const pulses: Pulse[] = [];
    const intruders: Intruder[] = [];
    let spawnCooldown = 0.9;
    let pulseCooldown = 2.1;

    function sizeCanvas() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnIntruder(cx: number, cy: number, shieldR: number) {
      // Spawn offscreen moving toward the shield center with a glancing angle.
      const rect = canvas!.getBoundingClientRect();
      const edge = Math.random();
      let x = 0;
      let y = 0;
      if (edge < 0.25) {
        x = -20;
        y = Math.random() * rect.height;
      } else if (edge < 0.5) {
        x = rect.width + 20;
        y = Math.random() * rect.height;
      } else if (edge < 0.75) {
        x = Math.random() * rect.width;
        y = -20;
      } else {
        x = Math.random() * rect.width;
        y = rect.height + 20;
      }
      const dx = cx - x;
      const dy = cy - y;
      const mag = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = 60 + Math.random() * 50;
      intruders.push({
        x,
        y,
        vx: (dx / mag) * speed,
        vy: (dy / mag) * speed,
        size: 2 + Math.random() * 2,
        repelled: false,
        repelFrame: 0,
      });
      // Keep the swarm size bounded.
      if (intruders.length > 18) intruders.shift();
    }

    function step(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const rect = canvas!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);

      const cx = rect.width / 2;
      const cy = rect.height * 0.62;
      const shieldR = Math.min(rect.width, rect.height) * 0.36;

      // Background glow behind the shield.
      const glow = ctx!.createRadialGradient(cx, cy, shieldR * 0.1, cx, cy, shieldR * 1.3);
      glow.addColorStop(0, glowColor);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, rect.width, rect.height);

      // House silhouette (stylized) centered under the shield.
      drawHouse(ctx!, cx, cy + shieldR * 0.18, shieldR * 0.7, color);

      // Concentric idle shield rings (static).
      ctx!.strokeStyle = rgbaWithAlpha(color, 0.28);
      ctx!.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx!.beginPath();
        ctx!.arc(cx, cy, shieldR * (0.75 + i * 0.12), 0, Math.PI * 2);
        ctx!.stroke();
      }

      // Pulse rings expanding outward.
      pulseCooldown -= reduced ? 0 : dt;
      if (pulseCooldown <= 0 && !reduced) {
        pulses.push({ age: 0, life: 2.8 });
        pulseCooldown = 1.6 + Math.random() * 1.2;
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.age += dt;
        const t = p.age / p.life;
        if (t >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const r = shieldR * (0.9 + t * 1.4);
        const alpha = (1 - t) * 0.55;
        ctx!.strokeStyle = rgbaWithAlpha(color, alpha);
        ctx!.lineWidth = 2 - t * 1.2;
        ctx!.beginPath();
        ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.stroke();
      }

      // Spawn intruders on a timer.
      spawnCooldown -= reduced ? 0 : dt;
      if (spawnCooldown <= 0 && !reduced) {
        spawnIntruder(cx, cy, shieldR);
        spawnCooldown = 0.4 + Math.random() * 0.9;
      }

      // Intruder physics + repel.
      for (let i = intruders.length - 1; i >= 0; i--) {
        const b = intruders[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const dxc = b.x - cx;
        const dyc = b.y - cy;
        const dist = Math.sqrt(dxc * dxc + dyc * dyc);

        // First contact with shield: flash + reverse velocity outward.
        if (!b.repelled && dist < shieldR) {
          b.repelled = true;
          b.repelFrame = 1;
          const mag = dist || 1;
          const out = { x: dxc / mag, y: dyc / mag };
          const outSpeed = 120 + Math.random() * 60;
          b.vx = out.x * outSpeed;
          b.vy = out.y * outSpeed;
          // Spawn a small local flash ring.
          const fx = cx + (dxc / mag) * shieldR;
          const fy = cy + (dyc / mag) * shieldR;
          ctx!.save();
          ctx!.strokeStyle = rgbaWithAlpha(color, 0.9);
          ctx!.lineWidth = 2;
          ctx!.beginPath();
          ctx!.arc(fx, fy, 12, 0, Math.PI * 2);
          ctx!.stroke();
          ctx!.restore();
        }

        // Draw the intruder as a tiny bug silhouette.
        ctx!.fillStyle = b.repelled
          ? rgbaWithAlpha("rgba(248, 250, 252, 1)", Math.max(0, 1 - b.repelFrame * 0.08))
          : rgbaWithAlpha(color, 0.85);
        ctx!.beginPath();
        ctx!.ellipse(b.x, b.y, b.size, b.size * 0.65, Math.atan2(b.vy, b.vx), 0, Math.PI * 2);
        ctx!.fill();

        if (b.repelled) b.repelFrame += 1;

        // Remove offscreen.
        const m = 40;
        if (
          b.x < -m ||
          b.x > rect.width + m ||
          b.y < -m ||
          b.y > rect.height + m
        ) {
          intruders.splice(i, 1);
        }
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
  }, [color, glowColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

function drawHouse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  color: string,
) {
  const h = w * 0.85;
  const roofH = h * 0.45;
  const wallH = h * 0.55;

  ctx.strokeStyle = rgbaWithAlpha(color, 0.95);
  ctx.fillStyle = rgbaWithAlpha(color, 0.06);
  ctx.lineWidth = 1.6;

  ctx.beginPath();
  // Roof
  ctx.moveTo(cx - w / 2, cy - wallH / 2);
  ctx.lineTo(cx, cy - wallH / 2 - roofH);
  ctx.lineTo(cx + w / 2, cy - wallH / 2);
  // Walls
  ctx.lineTo(cx + w / 2, cy + wallH / 2);
  ctx.lineTo(cx - w / 2, cy + wallH / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Door (centered)
  const dW = w * 0.18;
  const dH = wallH * 0.55;
  ctx.beginPath();
  ctx.rect(cx - dW / 2, cy + wallH / 2 - dH, dW, dH);
  ctx.stroke();

  // Two windows flanking the door
  const winW = w * 0.18;
  const winH = winW * 0.8;
  const winY = cy - wallH * 0.05;
  ctx.beginPath();
  ctx.rect(cx - w * 0.33, winY - winH / 2, winW, winH);
  ctx.rect(cx + w * 0.33 - winW, winY - winH / 2, winW, winH);
  ctx.stroke();
  // Window crosses
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.33 + winW / 2, winY - winH / 2);
  ctx.lineTo(cx - w * 0.33 + winW / 2, winY + winH / 2);
  ctx.moveTo(cx - w * 0.33, winY);
  ctx.lineTo(cx - w * 0.33 + winW, winY);
  ctx.moveTo(cx + w * 0.33 - winW / 2, winY - winH / 2);
  ctx.lineTo(cx + w * 0.33 - winW / 2, winY + winH / 2);
  ctx.moveTo(cx + w * 0.33 - winW, winY);
  ctx.lineTo(cx + w * 0.33, winY);
  ctx.stroke();
}

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
