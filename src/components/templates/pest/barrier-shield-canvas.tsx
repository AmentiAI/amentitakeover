"use client";

import { useEffect, useRef } from "react";

type Props = {
  color?: string;
  glowColor?: string;
  className?: string;
};

type BugKind = "ant" | "beetle" | "mosquito" | "spider";

type Intruder = {
  kind: BugKind;
  x: number;
  y: number;
  // Target point on the house perimeter the bug is marching toward.
  tx: number;
  ty: number;
  // Current movement angle (the bug's body faces this).
  angle: number;
  speed: number;
  baseSpeed: number;
  size: number;
  legPhase: number;
  // Lifecycle: "approach" → "repelled" (bouncing outward, fading) → removed.
  state: "approach" | "repelled";
  repelT: number;
  // Sparks the zap flash exactly once when the shield is hit.
  flashed: boolean;
};

// Hero-accent canvas for the about page: a house silhouette under siege.
// Swarms of stylized bugs (ants, beetles, mosquitoes, spiders) converge on
// random points along the house perimeter, hit the shield boundary, flash,
// and get knocked back. Emphasis is on the ATTACK — shield rings are kept
// subtle so the bugs read as the primary story.
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

    const intruders: Intruder[] = [];
    let spawnCooldown = 0.25;

    function sizeCanvas() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function pickKind(): BugKind {
      const r = Math.random();
      if (r < 0.5) return "ant";
      if (r < 0.75) return "beetle";
      if (r < 0.9) return "mosquito";
      return "spider";
    }

    function samplePerimeter(
      cx: number,
      cy: number,
      w: number,
    ): { x: number; y: number } {
      // Walk the house outline (roof-left, roof-peak, roof-right, wall-right,
      // bottom, wall-left) and sample a point proportional to segment length.
      const h = w * 0.85;
      const roofH = h * 0.45;
      const wallH = h * 0.55;
      const tlX = cx - w / 2;
      const tlY = cy - wallH / 2;
      const peakX = cx;
      const peakY = cy - wallH / 2 - roofH;
      const trX = cx + w / 2;
      const trY = cy - wallH / 2;
      const brX = cx + w / 2;
      const brY = cy + wallH / 2;
      const blX = cx - w / 2;
      const blY = cy + wallH / 2;
      const segs: Array<[number, number, number, number]> = [
        [tlX, tlY, peakX, peakY],
        [peakX, peakY, trX, trY],
        [trX, trY, brX, brY],
        [brX, brY, blX, blY],
        [blX, blY, tlX, tlY],
      ];
      const lens = segs.map(([x1, y1, x2, y2]) => Math.hypot(x2 - x1, y2 - y1));
      const total = lens.reduce((a, b) => a + b, 0);
      let pick = Math.random() * total;
      for (let i = 0; i < segs.length; i++) {
        if (pick <= lens[i]) {
          const t = pick / lens[i];
          const [x1, y1, x2, y2] = segs[i];
          return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
        }
        pick -= lens[i];
      }
      return { x: cx, y: cy };
    }

    function spawnIntruder(cx: number, cy: number, w: number) {
      const rect = canvas!.getBoundingClientRect();
      const edge = Math.random();
      let x = 0;
      let y = 0;
      if (edge < 0.25) {
        x = -24;
        y = Math.random() * rect.height;
      } else if (edge < 0.5) {
        x = rect.width + 24;
        y = Math.random() * rect.height;
      } else if (edge < 0.75) {
        x = Math.random() * rect.width;
        y = -24;
      } else {
        x = Math.random() * rect.width;
        y = rect.height + 24;
      }

      const target = samplePerimeter(cx, cy, w);
      const kind = pickKind();
      const baseSpeed =
        kind === "mosquito"
          ? 70 + Math.random() * 40
          : kind === "beetle"
            ? 32 + Math.random() * 18
            : kind === "spider"
              ? 30 + Math.random() * 16
              : 44 + Math.random() * 26;
      const size =
        kind === "mosquito"
          ? 6 + Math.random() * 2
          : kind === "beetle"
            ? 9 + Math.random() * 3
            : kind === "spider"
              ? 9 + Math.random() * 3
              : 7 + Math.random() * 3;
      intruders.push({
        kind,
        x,
        y,
        tx: target.x,
        ty: target.y,
        angle: Math.atan2(target.y - y, target.x - x),
        speed: baseSpeed,
        baseSpeed,
        size,
        legPhase: Math.random() * Math.PI * 2,
        state: "approach",
        repelT: 0,
        flashed: false,
      });
      if (intruders.length > 34) intruders.shift();
    }

    function step(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const rect = canvas!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);

      const cx = rect.width / 2;
      const cy = rect.height * 0.6;
      const houseW = Math.min(rect.width, rect.height) * 0.5;
      const shieldR = Math.min(rect.width, rect.height) * 0.34;

      // Soft glow behind house.
      const glow = ctx!.createRadialGradient(
        cx,
        cy,
        shieldR * 0.1,
        cx,
        cy,
        shieldR * 1.4,
      );
      glow.addColorStop(0, glowColor);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, rect.width, rect.height);

      // Single subtle shield ring (the bugs are the story, not the rings).
      ctx!.strokeStyle = rgbaWithAlpha(color, 0.22);
      ctx!.lineWidth = 1;
      ctx!.setLineDash([4, 6]);
      ctx!.beginPath();
      ctx!.arc(cx, cy, shieldR, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.setLineDash([]);

      // House silhouette.
      drawHouse(ctx!, cx, cy, houseW, color);

      // Spawn intruders on a fast cadence so the assault feels continuous.
      spawnCooldown -= reduced ? 0 : dt;
      if (spawnCooldown <= 0 && !reduced && intruders.length < 28) {
        spawnIntruder(cx, cy, houseW);
        spawnCooldown = 0.12 + Math.random() * 0.35;
      }

      for (let i = intruders.length - 1; i >= 0; i--) {
        const b = intruders[i];

        if (b.state === "approach") {
          // Steer gently toward target point.
          const desired = Math.atan2(b.ty - b.y, b.tx - b.x);
          b.angle = lerpAngle(b.angle, desired, Math.min(1, 4 * dt));
          b.x += Math.cos(b.angle) * b.speed * dt;
          b.y += Math.sin(b.angle) * b.speed * dt;
          b.legPhase += dt * 16;

          // Hit the shield boundary? Flash + deflect outward.
          const dx = b.x - cx;
          const dy = b.y - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < shieldR && !b.flashed) {
            b.flashed = true;
            b.state = "repelled";
            const mag = dist || 1;
            const outA = Math.atan2(dy / mag, dx / mag);
            b.angle = outA;
            b.speed = 150 + Math.random() * 80;
            // Emit a flash ring right at the impact point.
            drawZapFlash(ctx!, b.x, b.y, color);
          }
        } else {
          // Repelled: fly outward, fading.
          b.repelT += dt;
          b.x += Math.cos(b.angle) * b.speed * dt;
          b.y += Math.sin(b.angle) * b.speed * dt;
          b.legPhase += dt * 26;
          b.speed *= 0.985;
        }

        // Remove offscreen or fully faded repelled bugs.
        const m = 40;
        if (
          b.x < -m ||
          b.x > rect.width + m ||
          b.y < -m ||
          b.y > rect.height + m ||
          (b.state === "repelled" && b.repelT > 1.4)
        ) {
          intruders.splice(i, 1);
          continue;
        }

        const alpha =
          b.state === "repelled" ? Math.max(0, 1 - b.repelT / 1.4) : 1;
        drawIntruder(ctx!, b, color, alpha);
      }

      frameId = requestAnimationFrame(step);
    }

    const onResize = () => sizeCanvas();

    sizeCanvas();
    // Pre-spawn a starting cohort so the scene isn't empty on mount.
    {
      const rect = canvas!.getBoundingClientRect();
      const cx0 = rect.width / 2;
      const cy0 = rect.height * 0.6;
      const w0 = Math.min(rect.width, rect.height) * 0.5;
      const seed = reduced ? 8 : 14;
      for (let i = 0; i < seed; i++) spawnIntruder(cx0, cy0, w0);
    }
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
  ctx.fillStyle = rgbaWithAlpha(color, 0.08);
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - wallH / 2);
  ctx.lineTo(cx, cy - wallH / 2 - roofH);
  ctx.lineTo(cx + w / 2, cy - wallH / 2);
  ctx.lineTo(cx + w / 2, cy + wallH / 2);
  ctx.lineTo(cx - w / 2, cy + wallH / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Door
  const dW = w * 0.18;
  const dH = wallH * 0.55;
  ctx.beginPath();
  ctx.rect(cx - dW / 2, cy + wallH / 2 - dH, dW, dH);
  ctx.stroke();

  // Windows
  const winW = w * 0.18;
  const winH = winW * 0.8;
  const winY = cy - wallH * 0.05;
  ctx.beginPath();
  ctx.rect(cx - w * 0.33, winY - winH / 2, winW, winH);
  ctx.rect(cx + w * 0.33 - winW, winY - winH / 2, winW, winH);
  ctx.stroke();
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

function lerpAngle(current: number, target: number, t: number): number {
  const twoPi = Math.PI * 2;
  let diff = ((target - current + Math.PI) % twoPi) - Math.PI;
  if (diff < -Math.PI) diff += twoPi;
  return current + diff * t;
}

function drawIntruder(
  ctx: CanvasRenderingContext2D,
  b: Intruder,
  color: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);

  const bodyFill = rgbaWithAlpha(color, 0.9);
  ctx.fillStyle = bodyFill;
  ctx.strokeStyle = bodyFill;
  ctx.lineWidth = 0.9;

  if (b.kind === "ant") drawAnt(ctx, b);
  else if (b.kind === "beetle") drawBeetle(ctx, b);
  else if (b.kind === "mosquito") drawMosquito(ctx, b);
  else drawSpider(ctx, b);

  ctx.restore();
}

function drawAnt(ctx: CanvasRenderingContext2D, b: Intruder) {
  const bodyLen = b.size;
  const bodyW = b.size * 0.55;
  ctx.beginPath();
  ctx.arc(bodyLen * 0.55, 0, bodyW * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyW * 0.55, bodyW * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-bodyLen * 0.5, 0, bodyLen * 0.45, bodyW * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bodyLen * 0.6, 0);
  ctx.quadraticCurveTo(bodyLen * 0.9, -bodyW * 0.8, bodyLen * 1.1, -bodyW * 1.1);
  ctx.moveTo(bodyLen * 0.6, 0);
  ctx.quadraticCurveTo(bodyLen * 0.9, bodyW * 0.8, bodyLen * 1.1, bodyW * 1.1);
  ctx.stroke();
  const legLen = b.size * 0.9;
  const stride = Math.sin(b.legPhase) * 0.45;
  const anti = Math.sin(b.legPhase + Math.PI) * 0.45;
  drawLeg(ctx, -bodyW * 0.3, 0, legLen, -Math.PI / 2 - 0.3 + stride);
  drawLeg(ctx, 0, 0, legLen, -Math.PI / 2 + anti);
  drawLeg(ctx, bodyW * 0.3, 0, legLen, -Math.PI / 2 + 0.3 + stride);
  drawLeg(ctx, -bodyW * 0.3, 0, legLen, Math.PI / 2 + 0.3 + anti);
  drawLeg(ctx, 0, 0, legLen, Math.PI / 2 + stride);
  drawLeg(ctx, bodyW * 0.3, 0, legLen, Math.PI / 2 - 0.3 + anti);
}

function drawBeetle(ctx: CanvasRenderingContext2D, b: Intruder) {
  const bodyLen = b.size;
  const bodyW = b.size * 0.75;
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyLen * 0.7, bodyW * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(bodyLen * 0.7, 0, bodyW * 0.3, 0, Math.PI * 2);
  ctx.fill();
  const legLen = b.size * 0.55;
  const stride = Math.sin(b.legPhase) * 0.35;
  const anti = Math.sin(b.legPhase + Math.PI) * 0.35;
  drawLeg(ctx, -bodyLen * 0.35, bodyW * 0.45, legLen, Math.PI / 2 + stride);
  drawLeg(ctx, 0, bodyW * 0.48, legLen, Math.PI / 2 + anti);
  drawLeg(ctx, bodyLen * 0.35, bodyW * 0.45, legLen, Math.PI / 2 + stride);
  drawLeg(ctx, -bodyLen * 0.35, -bodyW * 0.45, legLen, -Math.PI / 2 + anti);
  drawLeg(ctx, 0, -bodyW * 0.48, legLen, -Math.PI / 2 + stride);
  drawLeg(ctx, bodyLen * 0.35, -bodyW * 0.45, legLen, -Math.PI / 2 + anti);
}

function drawMosquito(ctx: CanvasRenderingContext2D, b: Intruder) {
  const bodyLen = b.size * 1.1;
  const bodyW = b.size * 0.35;
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyLen * 0.6, bodyW, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(bodyLen * 0.55, 0, bodyW * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bodyLen * 0.65, 0);
  ctx.lineTo(bodyLen * 1.0, 0);
  ctx.stroke();
  // Legs trailing.
  const legLen = b.size * 1.1;
  ctx.beginPath();
  for (let i = -1; i <= 1; i++) {
    const ox = bodyLen * 0.2 * i;
    ctx.moveTo(ox, 0);
    ctx.quadraticCurveTo(ox - legLen * 0.4, legLen * 0.6, ox - legLen * 0.6, legLen * 1.0);
    ctx.moveTo(ox, 0);
    ctx.quadraticCurveTo(ox - legLen * 0.4, -legLen * 0.6, ox - legLen * 0.6, -legLen * 1.0);
  }
  ctx.stroke();
  const wingA = Math.abs(Math.sin(b.legPhase * 0.8)) * 0.5 + 0.35;
  ctx.save();
  ctx.globalAlpha = wingA;
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath();
  ctx.ellipse(-bodyLen * 0.1, -bodyW * 1.6, bodyLen * 0.55, bodyW * 1.2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-bodyLen * 0.1, bodyW * 1.6, bodyLen * 0.55, bodyW * 1.2, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSpider(ctx: CanvasRenderingContext2D, b: Intruder) {
  const bodyR = b.size * 0.45;
  const headR = b.size * 0.3;
  ctx.beginPath();
  ctx.arc(-b.size * 0.2, 0, bodyR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(b.size * 0.35, 0, headR, 0, Math.PI * 2);
  ctx.fill();
  const legLen = b.size * 1.2;
  const legs = [
    -Math.PI * 0.7,
    -Math.PI * 0.45,
    -Math.PI * 0.2,
    Math.PI * 0.2,
    Math.PI * 0.45,
    Math.PI * 0.7,
    Math.PI * 0.85,
    -Math.PI * 0.85,
  ];
  for (let i = 0; i < legs.length; i++) {
    const sway = Math.sin(b.legPhase + i * 0.7) * 0.18;
    drawLeg(ctx, 0, 0, legLen, legs[i] + sway);
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

function drawZapFlash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 28);
  grad.addColorStop(0, rgbaWithAlpha(color, 0.95));
  grad.addColorStop(0.5, rgbaWithAlpha(color, 0.3));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgbaWithAlpha(color, 0.9);
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6 + Math.random() * 0.25;
    const r0 = 4 + Math.random() * 3;
    const r1 = 14 + Math.random() * 8;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
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
