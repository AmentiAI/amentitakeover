"use client";

import { useEffect, useRef } from "react";

type Props = {
  // Overall bug color (body). Defaults to a warm dark on emerald hero bg.
  color?: string;
  // Accent color used for targeting reticles, zap flashes, and scanline.
  accent?: string;
  // How many bugs to draw at once. Scaled down on mobile.
  count?: number;
  // Scatter cursor-reactive? Bugs within scatterRadius of cursor flee.
  reactToCursor?: boolean;
  scatterRadius?: number;
  className?: string;
};

type BugKind = "ant" | "beetle" | "mosquito" | "spider";

type Bug = {
  kind: BugKind;
  x: number;
  y: number;
  angle: number;
  speed: number;
  baseSpeed: number;
  size: number;
  legPhase: number;
  turnTimer: number;
  pauseTimer: number;
  fleeBoost: number;
  // For beetles/mosquitoes: how "floaty" the motion is (0 = grounded, 1 = airborne).
  float: number;
  // When > 0, this bug is being targeted by the zap reticle and will flash out.
  targetingT: number;
  // Set to true once this bug has been zapped this cycle; it's removed afterward.
  zapped: boolean;
};

// Hero banner canvas. Dominant visual: a swarm of ~30 bugs (mixed: ants,
// beetles, mosquitoes, spiders) crawling/flying across the frame. Cursor
// scatter is enabled, and every few seconds the scanner locks onto a random
// bug with a targeting reticle → zap flash → removal, reinforcing the
// pest-control "we find + eliminate" theme. A subtle sweep line traverses
// the banner horizontally on a slow cadence.
export function HeroBugBanner({
  color = "rgba(18, 10, 6, 0.94)",
  accent = "rgba(134, 239, 172, 0.95)",
  count = 30,
  reactToCursor = true,
  scatterRadius = 160,
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

    let pointer: { x: number; y: number } | null = null;

    const bugs: Bug[] = [];
    // Horizontal scanner line position (0..rect.width). Wraps around.
    let scanX = -80;
    // Time until the next zap event.
    let nextZapIn = 2.4 + Math.random() * 2.2;
    // Active zap state: target bug index + stage progress.
    let zapTarget = -1;
    let zapStage = 0; // 0: idle, 1: targeting (reticle closing), 2: flash, 3: fading out

    function sizeCanvas() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnBugs() {
      bugs.length = 0;
      const rect = canvas!.getBoundingClientRect();
      const scaled = rect.width < 640 ? Math.max(12, Math.floor(count * 0.55)) : count;
      for (let i = 0; i < scaled; i++) bugs.push(makeBug(rect.width, rect.height));
    }

    function makeBug(w: number, h: number): Bug {
      const roll = Math.random();
      let kind: BugKind;
      if (roll < 0.5) kind = "ant";
      else if (roll < 0.75) kind = "beetle";
      else if (roll < 0.9) kind = "mosquito";
      else kind = "spider";
      // Flying bugs (mosquitoes) are faster and float; beetles are slow; ants
      // are a baseline middle; spiders are slower but larger.
      const baseSpeed =
        kind === "mosquito"
          ? 48 + Math.random() * 24
          : kind === "beetle"
            ? 14 + Math.random() * 10
            : kind === "spider"
              ? 12 + Math.random() * 8
              : 22 + Math.random() * 18;
      const size =
        kind === "mosquito"
          ? 6 + Math.random() * 2
          : kind === "beetle"
            ? 10 + Math.random() * 4
            : kind === "spider"
              ? 9 + Math.random() * 3
              : 7 + Math.random() * 3;
      return {
        kind,
        x: Math.random() * w,
        y: Math.random() * h,
        angle: Math.random() * Math.PI * 2,
        speed: baseSpeed,
        baseSpeed,
        size,
        legPhase: Math.random() * Math.PI * 2,
        turnTimer: 0.4 + Math.random() * 2.2,
        pauseTimer: Math.random() * 4,
        fleeBoost: 0,
        float: kind === "mosquito" ? 1 : kind === "beetle" ? 0.35 : 0,
        targetingT: 0,
        zapped: false,
      };
    }

    function step(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const rect = canvas!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);

      // Scanner line: a soft vertical band sweeping left→right on a ~6s cycle.
      // Skipped for reduced-motion so the banner stays static in that mode.
      if (!reduced) {
        scanX += rect.width * 0.18 * dt;
        if (scanX > rect.width + 80) scanX = -80;
        const g = ctx!.createLinearGradient(scanX - 60, 0, scanX + 60, 0);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.5, withAlpha(accent, 0.15));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(scanX - 60, 0, 120, rect.height);
      }

      // Zap cadence: when idle, count down. When triggered, pick a random
      // live bug far enough from viewport edges.
      if (!reduced) {
        if (zapStage === 0) {
          nextZapIn -= dt;
          if (nextZapIn <= 0 && bugs.length > 0) {
            const candidates: number[] = [];
            for (let i = 0; i < bugs.length; i++) {
              const b = bugs[i];
              if (b.zapped) continue;
              if (b.x < 40 || b.x > rect.width - 40) continue;
              if (b.y < 40 || b.y > rect.height - 40) continue;
              candidates.push(i);
            }
            if (candidates.length > 0) {
              zapTarget = candidates[Math.floor(Math.random() * candidates.length)];
              bugs[zapTarget].targetingT = 0.0001;
              zapStage = 1;
            }
            nextZapIn = 3.2 + Math.random() * 3.5;
          }
        } else if (zapStage === 1) {
          // Targeting: reticle closes over ~0.9s.
          const b = bugs[zapTarget];
          if (b) {
            b.targetingT = Math.min(1, b.targetingT + dt / 0.9);
            if (b.targetingT >= 1) zapStage = 2;
          } else {
            zapStage = 0;
          }
        } else if (zapStage === 2) {
          // Flash + remove the bug, advance to fade-out.
          const b = bugs[zapTarget];
          if (b) {
            drawZapFlash(ctx!, b.x, b.y, accent);
            b.zapped = true;
          }
          zapStage = 3;
        } else if (zapStage === 3) {
          // Brief cooldown before bugs can be targeted again; also clean up
          // the zapped bug and respawn a replacement to keep swarm density.
          if (zapTarget >= 0 && bugs[zapTarget]?.zapped) {
            bugs.splice(zapTarget, 1);
            bugs.push(makeBug(rect.width, rect.height));
          }
          zapTarget = -1;
          zapStage = 0;
        }
      }

      for (let i = 0; i < bugs.length; i++) {
        const b = bugs[i];

        // Pause/resume (ants + beetles take occasional breaks; mosquitoes don't).
        if (b.kind !== "mosquito") {
          b.pauseTimer -= dt;
          if (b.pauseTimer < -0.6) b.pauseTimer = 3 + Math.random() * 5;
        }
        const paused =
          b.kind !== "mosquito" && b.pauseTimer < 0 && b.pauseTimer > -0.6;

        // Cursor scatter.
        let fleeing = false;
        if (pointer && reactToCursor) {
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const dist2 = dx * dx + dy * dy;
          const r2 = scatterRadius * scatterRadius;
          if (dist2 < r2 && dist2 > 0.0001) {
            const dist = Math.sqrt(dist2);
            const away = Math.atan2(dy, dx);
            const urgency = 1 - dist / scatterRadius;
            b.angle = lerpAngle(b.angle, away, Math.min(1, 0.15 + urgency * 0.75));
            b.fleeBoost = Math.max(b.fleeBoost, 0.7 + urgency * 0.9);
            b.turnTimer = 0.8 + Math.random() * 1.6;
            fleeing = true;
          }
        }
        b.fleeBoost = Math.max(0, b.fleeBoost - dt * 0.9);
        b.speed = b.baseSpeed * (1 + b.fleeBoost * 3);

        // Wander heading (skip while fleeing for a coherent escape vector).
        if (!fleeing && !reduced) {
          b.angle += (Math.random() - 0.5) * 0.6 * dt;
          b.turnTimer -= dt;
          if (b.turnTimer <= 0) {
            b.angle += (Math.random() - 0.5) * 1.4;
            b.turnTimer = 0.6 + Math.random() * 2.4;
          }
        }

        if (!paused && !reduced) {
          b.x += Math.cos(b.angle) * b.speed * dt;
          b.y += Math.sin(b.angle) * b.speed * dt;
          b.legPhase += dt * (14 + b.fleeBoost * 36);
        }

        // Wrap across edges.
        const m = 28;
        if (b.x < -m) b.x = rect.width + m;
        if (b.x > rect.width + m) b.x = -m;
        if (b.y < -m) b.y = rect.height + m;
        if (b.y > rect.height + m) b.y = -m;

        drawBug(ctx!, b, color);

        // Draw targeting reticle over bugs being locked on.
        if (b.targetingT > 0 && !b.zapped) {
          drawReticle(ctx!, b.x, b.y, b.size, b.targetingT, accent);
        }
      }

      frameId = requestAnimationFrame(step);
    }

    const onResize = () => {
      sizeCanvas();
      spawnBugs();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!reactToCursor || e.pointerType === "touch") return;
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
      canvas.addEventListener("pointermove", onPointerMove, { passive: true });
      canvas.addEventListener("pointerleave", onPointerLeave);
    }
    frameId = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      if (reactToCursor) {
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
      }
    };
  }, [color, accent, count, reactToCursor, scatterRadius]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // pointer-events-auto so the canvas captures pointermove for scatter,
      // but the content overlay above uses its own higher z-index to stay
      // clickable. The parent is responsible for allowing pointer access to
      // text/CTAs (they should sit on a z layer above this canvas).
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}

function lerpAngle(current: number, target: number, t: number): number {
  const twoPi = Math.PI * 2;
  let diff = ((target - current + Math.PI) % twoPi) - Math.PI;
  if (diff < -Math.PI) diff += twoPi;
  return current + diff * t;
}

function drawBug(ctx: CanvasRenderingContext2D, b: Bug, color: string) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);

  // Airborne bugs (mosquitoes, beetles in flight) cast a soft drop shadow.
  if (b.float > 0) {
    ctx.save();
    ctx.translate(0, 4 + b.float * 6);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(0, 0, b.size * 0.7, b.size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.95;

  if (b.kind === "ant") {
    drawAnt(ctx, b);
  } else if (b.kind === "beetle") {
    drawBeetle(ctx, b);
  } else if (b.kind === "mosquito") {
    drawMosquito(ctx, b);
  } else {
    drawSpider(ctx, b);
  }

  ctx.restore();
}

function drawAnt(ctx: CanvasRenderingContext2D, b: Bug) {
  const bodyLen = b.size;
  const bodyW = b.size * 0.55;

  // Head + thorax + abdomen chain.
  ctx.beginPath();
  ctx.arc(bodyLen * 0.55, 0, bodyW * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyW * 0.55, bodyW * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-bodyLen * 0.5, 0, bodyLen * 0.45, bodyW * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Antennae.
  ctx.beginPath();
  ctx.moveTo(bodyLen * 0.6, 0);
  ctx.quadraticCurveTo(bodyLen * 0.9, -bodyW * 0.8, bodyLen * 1.1, -bodyW * 1.1);
  ctx.moveTo(bodyLen * 0.6, 0);
  ctx.quadraticCurveTo(bodyLen * 0.9, bodyW * 0.8, bodyLen * 1.1, bodyW * 1.1);
  ctx.stroke();

  // Six legs in two tripod groups.
  const legLen = b.size * 0.95;
  const stride = Math.sin(b.legPhase) * 0.45;
  const anti = Math.sin(b.legPhase + Math.PI) * 0.45;

  drawLeg(ctx, -bodyW * 0.3, 0, legLen, -Math.PI / 2 - 0.3 + stride);
  drawLeg(ctx, 0, 0, legLen, -Math.PI / 2 + anti);
  drawLeg(ctx, bodyW * 0.3, 0, legLen, -Math.PI / 2 + 0.3 + stride);
  drawLeg(ctx, -bodyW * 0.3, 0, legLen, Math.PI / 2 + 0.3 + anti);
  drawLeg(ctx, 0, 0, legLen, Math.PI / 2 + stride);
  drawLeg(ctx, bodyW * 0.3, 0, legLen, Math.PI / 2 - 0.3 + anti);
}

function drawBeetle(ctx: CanvasRenderingContext2D, b: Bug) {
  const bodyLen = b.size;
  const bodyW = b.size * 0.75;

  // Rounded oval shell.
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyLen * 0.7, bodyW * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head (small).
  ctx.beginPath();
  ctx.arc(bodyLen * 0.7, 0, bodyW * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Shell center seam.
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-bodyLen * 0.55, 0);
  ctx.lineTo(bodyLen * 0.55, 0);
  ctx.stroke();

  // Six stubby legs.
  const legLen = b.size * 0.55;
  const stride = Math.sin(b.legPhase) * 0.35;
  const anti = Math.sin(b.legPhase + Math.PI) * 0.35;
  ctx.strokeStyle = ctx.fillStyle as string;
  ctx.lineWidth = 1;
  drawLeg(ctx, -bodyLen * 0.35, bodyW * 0.45, legLen, Math.PI / 2 + stride);
  drawLeg(ctx, 0, bodyW * 0.48, legLen, Math.PI / 2 + anti);
  drawLeg(ctx, bodyLen * 0.35, bodyW * 0.45, legLen, Math.PI / 2 + stride);
  drawLeg(ctx, -bodyLen * 0.35, -bodyW * 0.45, legLen, -Math.PI / 2 + anti);
  drawLeg(ctx, 0, -bodyW * 0.48, legLen, -Math.PI / 2 + stride);
  drawLeg(ctx, bodyLen * 0.35, -bodyW * 0.45, legLen, -Math.PI / 2 + anti);
}

function drawMosquito(ctx: CanvasRenderingContext2D, b: Bug) {
  const bodyLen = b.size * 1.1;
  const bodyW = b.size * 0.35;

  // Thin elongated body.
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyLen * 0.6, bodyW, 0, 0, Math.PI * 2);
  ctx.fill();

  // Small head + proboscis.
  ctx.beginPath();
  ctx.arc(bodyLen * 0.55, 0, bodyW * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ctx.fillStyle as string;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(bodyLen * 0.65, 0);
  ctx.lineTo(bodyLen * 1.0, 0);
  ctx.stroke();

  // Long dangling legs (trailing behind the direction of travel).
  const legLen = b.size * 1.3;
  ctx.beginPath();
  for (let i = -1; i <= 1; i++) {
    const ox = bodyLen * 0.2 * i;
    ctx.moveTo(ox, 0);
    ctx.quadraticCurveTo(ox - legLen * 0.4, legLen * 0.6, ox - legLen * 0.6, legLen * 1.1);
    ctx.moveTo(ox, 0);
    ctx.quadraticCurveTo(ox - legLen * 0.4, -legLen * 0.6, ox - legLen * 0.6, -legLen * 1.1);
  }
  ctx.stroke();

  // Wings: blurred ovals that "flicker" with legPhase (simulate beat).
  const wingA = Math.abs(Math.sin(b.legPhase * 0.8)) * 0.5 + 0.4;
  ctx.save();
  ctx.globalAlpha = wingA;
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.ellipse(-bodyLen * 0.1, -bodyW * 1.6, bodyLen * 0.55, bodyW * 1.2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-bodyLen * 0.1, bodyW * 1.6, bodyLen * 0.55, bodyW * 1.2, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSpider(ctx: CanvasRenderingContext2D, b: Bug) {
  const bodyR = b.size * 0.45;
  const headR = b.size * 0.3;

  // Abdomen + cephalothorax.
  ctx.beginPath();
  ctx.arc(-b.size * 0.2, 0, bodyR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(b.size * 0.35, 0, headR, 0, Math.PI * 2);
  ctx.fill();

  // Eight legs in four pairs, alternating stride.
  const legLen = b.size * 1.3;
  ctx.strokeStyle = ctx.fillStyle as string;
  ctx.lineWidth = 0.9;
  const legs = [
    { ox: 0, oy: 0, base: -Math.PI * 0.7 },
    { ox: 0, oy: 0, base: -Math.PI * 0.45 },
    { ox: 0, oy: 0, base: -Math.PI * 0.2 },
    { ox: 0, oy: 0, base: Math.PI * 0.2 },
    { ox: 0, oy: 0, base: Math.PI * 0.45 },
    { ox: 0, oy: 0, base: Math.PI * 0.7 },
    { ox: 0, oy: 0, base: Math.PI * 0.85 },
    { ox: 0, oy: 0, base: -Math.PI * 0.85 },
  ];
  for (let i = 0; i < legs.length; i++) {
    const l = legs[i];
    const sway = Math.sin(b.legPhase + i * 0.7) * 0.18;
    drawLeg(ctx, l.ox, l.oy, legLen, l.base + sway);
  }
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

function drawReticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bugSize: number,
  t: number,
  color: string,
) {
  // Reticle radius contracts from r0 to r1 as t goes 0→1, with rotating corner
  // brackets. A thin aiming line also closes in on center.
  const r0 = bugSize * 4.5;
  const r1 = bugSize * 1.8;
  const r = r0 + (r1 - r0) * t;

  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = withAlpha(color, 0.9);
  ctx.lineWidth = 1.4;

  // Dashed outer ring.
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Corner brackets.
  const bracketLen = r * 0.45;
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i + Math.PI / 4;
    const bx = Math.cos(a) * r;
    const by = Math.sin(a) * r;
    ctx.beginPath();
    ctx.moveTo(bx - Math.cos(a + 0.4) * bracketLen, by - Math.sin(a + 0.4) * bracketLen);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx - Math.cos(a - 0.4) * bracketLen, by - Math.sin(a - 0.4) * bracketLen);
    ctx.stroke();
  }

  // Crosshair.
  ctx.beginPath();
  ctx.moveTo(-r1 * 1.3, 0);
  ctx.lineTo(-r1 * 0.4, 0);
  ctx.moveTo(r1 * 0.4, 0);
  ctx.lineTo(r1 * 1.3, 0);
  ctx.moveTo(0, -r1 * 1.3);
  ctx.lineTo(0, -r1 * 0.4);
  ctx.moveTo(0, r1 * 0.4);
  ctx.lineTo(0, r1 * 1.3);
  ctx.stroke();

  ctx.restore();
}

function drawZapFlash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) {
  // Bright instantaneous flash — ring + radial gradient + small spark lines.
  ctx.save();
  ctx.translate(x, y);

  const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 40);
  grad.addColorStop(0, withAlpha(color, 0.95));
  grad.addColorStop(0.5, withAlpha(color, 0.35));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = withAlpha(color, 0.95);
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
    const r0 = 6 + Math.random() * 4;
    const r1 = 22 + Math.random() * 10;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
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
