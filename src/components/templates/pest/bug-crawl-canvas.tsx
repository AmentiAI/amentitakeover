"use client";

import { useEffect, useRef } from "react";

type Props = {
  // Number of bugs to render. Keep low on mobile to protect frame rate.
  count?: number;
  // Color of the bug bodies. Defaults to a dark amber so bugs read on any
  // background. Pass a translucent color to soften on dark backgrounds.
  color?: string;
  // If true, the canvas stays fixed to the viewport (ambient background).
  // If false, the canvas is absolute to the nearest positioned ancestor.
  fixed?: boolean;
  // If true, bugs within `scatterRadius` of the cursor flee away. No-op on
  // touch devices where there's no hover pointer.
  reactToCursor?: boolean;
  scatterRadius?: number;
  className?: string;
};

type Bug = {
  x: number;
  y: number;
  angle: number; // radians, direction of travel
  speed: number; // px/sec
  baseSpeed: number; // resting crawl speed (used to restore after fleeing)
  size: number; // body length in px
  legPhase: number;
  turnTimer: number;
  pauseTimer: number;
  fleeBoost: number; // 0–1, elevated when fleeing cursor
};

// Ambient canvas layer that draws small ant-like bugs meandering across the
// viewport. Each bug has a body + six legs that animate in a crawl rhythm.
// Respects prefers-reduced-motion (renders nothing if user opted out).
export function BugCrawlCanvas({
  count = 14,
  color = "rgba(26, 18, 10, 0.88)",
  fixed = true,
  reactToCursor = true,
  scatterRadius = 110,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let frameId = 0;
    let lastTs = performance.now();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Cursor position in canvas-local coords. null = no active pointer (touch
    // device between taps, or pointer left the document).
    let pointer: { x: number; y: number } | null = null;

    const bugs: Bug[] = [];

    function sizeCanvas() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnBugs() {
      bugs.length = 0;
      const rect = canvas!.getBoundingClientRect();
      // Scale down on small screens to avoid overcrowding.
      const scaled = rect.width < 640 ? Math.max(5, Math.floor(count * 0.55)) : count;
      for (let i = 0; i < scaled; i++) {
        const baseSpeed = 14 + Math.random() * 22;
        bugs.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          angle: Math.random() * Math.PI * 2,
          speed: baseSpeed,
          baseSpeed,
          size: 6 + Math.random() * 5, // 6–11 px
          legPhase: Math.random() * Math.PI * 2,
          turnTimer: 0.4 + Math.random() * 2.2,
          pauseTimer: Math.random() * 4,
          fleeBoost: 0,
        });
      }
    }

    function step(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const rect = canvas!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);

      for (const b of bugs) {
        // Occasionally pause, then resume.
        b.pauseTimer -= dt;
        let paused = b.pauseTimer < 0 && b.pauseTimer > -0.6;
        if (b.pauseTimer < -0.6) b.pauseTimer = 3 + Math.random() * 5;

        // Cursor scatter: if a pointer is within scatterRadius, set the
        // heading to flee directly away and boost speed. The fleeBoost decays
        // over time so bugs return to base speed after the cursor leaves.
        let fleeing = false;
        if (pointer) {
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const dist2 = dx * dx + dy * dy;
          const r2 = scatterRadius * scatterRadius;
          if (dist2 < r2 && dist2 > 0.0001) {
            const dist = Math.sqrt(dist2);
            // Target angle is directly away from the pointer.
            const away = Math.atan2(dy, dx);
            // Smoothly steer toward the away angle (snappier when very close).
            const urgency = 1 - dist / scatterRadius; // 0–1
            b.angle = lerpAngle(b.angle, away, Math.min(1, 0.15 + urgency * 0.7));
            b.fleeBoost = Math.max(b.fleeBoost, 0.7 + urgency * 0.8);
            b.turnTimer = 0.8 + Math.random() * 1.6;
            fleeing = true;
          }
        }
        b.fleeBoost = Math.max(0, b.fleeBoost - dt * 0.9);
        if (fleeing) paused = false;
        b.speed = b.baseSpeed * (1 + b.fleeBoost * 3);

        // Gentle random heading jitter + periodic bigger turns. Skip jitter
        // while actively fleeing so the escape path stays coherent.
        if (!fleeing) {
          b.angle += (Math.random() - 0.5) * 0.6 * dt;
          b.turnTimer -= dt;
          if (b.turnTimer <= 0) {
            b.angle += (Math.random() - 0.5) * 1.4;
            b.turnTimer = 0.6 + Math.random() * 2.4;
          }
        }

        if (!paused) {
          b.x += Math.cos(b.angle) * b.speed * dt;
          b.y += Math.sin(b.angle) * b.speed * dt;
          // Leg stride rate scales with movement speed for natural crawl.
          b.legPhase += dt * (14 + b.fleeBoost * 36);
        }

        // Wrap across edges with a small margin.
        const m = 20;
        if (b.x < -m) b.x = rect.width + m;
        if (b.x > rect.width + m) b.x = -m;
        if (b.y < -m) b.y = rect.height + m;
        if (b.y > rect.height + m) b.y = -m;

        drawBug(ctx!, b, color);
      }

      frameId = requestAnimationFrame(step);
    }

    const onResize = () => {
      sizeCanvas();
      spawnBugs();
    };

    // Track the pointer in canvas-local coords so bugs can flee from it.
    // We only react to mouse/pen — not touch — since scatter-on-tap feels
    // janky when the tap target isn't a bug.
    const onPointerMove = (e: PointerEvent) => {
      if (!reactToCursor) return;
      if (e.pointerType === "touch") return;
      const rect = canvas!.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onPointerLeave = () => {
      pointer = null;
    };

    sizeCanvas();
    spawnBugs();
    window.addEventListener("resize", onResize);
    if (reactToCursor) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("blur", onPointerLeave);
    }
    frameId = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      if (reactToCursor) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("blur", onPointerLeave);
      }
    };
  }, [count, color, reactToCursor, scatterRadius]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`${fixed ? "pointer-events-none fixed inset-0" : "pointer-events-none absolute inset-0"} ${className}`}
    />
  );
}

// Interpolates between two angles along the shortest arc. Used for smooth
// steering when a bug pivots to flee the cursor without flipping direction
// through the long way around.
function lerpAngle(current: number, target: number, t: number): number {
  const twoPi = Math.PI * 2;
  let diff = ((target - current + Math.PI) % twoPi) - Math.PI;
  if (diff < -Math.PI) diff += twoPi;
  return current + diff * t;
}

function drawBug(ctx: CanvasRenderingContext2D, b: Bug, color: string) {
  const bodyLen = b.size;
  const bodyW = b.size * 0.55;

  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.9;

  // Head (small circle at the front)
  ctx.beginPath();
  ctx.arc(bodyLen * 0.55, 0, bodyW * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Thorax (middle oval)
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyW * 0.55, bodyW * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Abdomen (back oval, slightly larger)
  ctx.beginPath();
  ctx.ellipse(-bodyLen * 0.5, 0, bodyLen * 0.45, bodyW * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Antennae
  ctx.beginPath();
  ctx.moveTo(bodyLen * 0.6, 0);
  ctx.quadraticCurveTo(bodyLen * 0.9, -bodyW * 0.8, bodyLen * 1.1, -bodyW * 1.1);
  ctx.moveTo(bodyLen * 0.6, 0);
  ctx.quadraticCurveTo(bodyLen * 0.9, bodyW * 0.8, bodyLen * 1.1, bodyW * 1.1);
  ctx.stroke();

  // Six legs, stride-phased in two tripod groups (ants walk 1-4-5 / 2-3-6).
  const legLen = b.size * 0.95;
  const stride = Math.sin(b.legPhase) * 0.45;
  const antiStride = Math.sin(b.legPhase + Math.PI) * 0.45;

  drawLeg(ctx, -bodyW * 0.3, 0, legLen, -Math.PI / 2 - 0.3 + stride);
  drawLeg(ctx, 0, 0, legLen, -Math.PI / 2 + antiStride);
  drawLeg(ctx, bodyW * 0.3, 0, legLen, -Math.PI / 2 + 0.3 + stride);
  drawLeg(ctx, -bodyW * 0.3, 0, legLen, Math.PI / 2 + 0.3 + antiStride);
  drawLeg(ctx, 0, 0, legLen, Math.PI / 2 + stride);
  drawLeg(ctx, bodyW * 0.3, 0, legLen, Math.PI / 2 - 0.3 + antiStride);

  ctx.restore();
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  len: number,
  angle: number,
) {
  const midLen = len * 0.55;
  const tipLen = len * 0.55;
  const midX = ox + Math.cos(angle) * midLen;
  const midY = oy + Math.sin(angle) * midLen;
  const tipX = midX + Math.cos(angle + 0.45) * tipLen;
  const tipY = midY + Math.sin(angle + 0.45) * tipLen;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(midX, midY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
}
