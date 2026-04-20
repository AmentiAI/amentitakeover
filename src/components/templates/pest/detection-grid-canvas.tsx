"use client";

import { useEffect, useRef } from "react";

// A monitored detection grid: hex-like cells tile a dark strip; bugs
// occasionally spawn on a random cell, wiggle for a moment, then get
// "detected" (cell flashes emerald, bug fades). Visual reinforcement of the
// "we're always watching" story. Lower visual weight than HeroBugBanner —
// meant as a decorative band between content sections.
export function DetectionGridCanvas({ className = "" }: { className?: string }) {
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
    let last = performance.now();

    type Cell = { gx: number; gy: number; flash: number };
    type Spawn = { cx: number; cy: number; t: number; life: number };

    const cells: Cell[] = [];
    const spawns: Spawn[] = [];
    let spawnCooldown = 0.35;

    const CELL = 46;

    function sizeCanvas() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells.length = 0;
      const cols = Math.ceil(rect.width / CELL) + 1;
      const rows = Math.ceil(rect.height / CELL) + 1;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          cells.push({ gx: x, gy: y, flash: 0 });
        }
      }
    }

    function cellAt(i: number): Cell | null {
      return cells[i] ?? null;
    }

    function spawnBug(W: number, H: number) {
      const cx = Math.random() * W;
      const cy = Math.random() * H;
      spawns.push({ cx, cy, t: 0, life: 1.6 });
      // Flash the cell the bug appeared in.
      const gx = Math.floor(cx / CELL);
      const gy = Math.floor(cy / CELL);
      for (const c of cells) {
        if (c.gx === gx && c.gy === gy) {
          c.flash = 1;
          break;
        }
      }
    }

    function step(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const rect = canvas!.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      ctx!.clearRect(0, 0, W, H);

      // Draw cells.
      for (const c of cellAllIter()) {
        if (!c) continue;
        const x = c.gx * CELL;
        const y = c.gy * CELL;
        const flash = c.flash;
        ctx!.strokeStyle = `rgba(134, 239, 172, ${(0.08 + flash * 0.5).toFixed(3)})`;
        ctx!.lineWidth = 1;
        ctx!.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
        if (flash > 0.02) {
          ctx!.fillStyle = `rgba(52, 211, 153, ${(flash * 0.15).toFixed(3)})`;
          ctx!.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
          c.flash = Math.max(0, flash - dt * 1.4);
        }
      }

      if (!reduced) {
        spawnCooldown -= dt;
        if (spawnCooldown <= 0) {
          spawnBug(W, H);
          spawnCooldown = 0.25 + Math.random() * 0.6;
        }
      }

      for (let i = spawns.length - 1; i >= 0; i--) {
        const s = spawns[i];
        s.t += dt;
        if (s.t >= s.life) {
          spawns.splice(i, 1);
          continue;
        }
        const prog = s.t / s.life;
        // Bug wiggles a few px while visible.
        const wx = s.cx + Math.sin(s.t * 10) * 3;
        const wy = s.cy + Math.cos(s.t * 10) * 2;
        const alpha = prog < 0.7 ? 1 : 1 - (prog - 0.7) / 0.3;

        // Bug body (tan).
        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = "rgba(248, 242, 224, 0.96)";
        ctx!.beginPath();
        ctx!.ellipse(wx, wy, 4.5, 3.2, s.t * 2, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(wx + 3, wy, 1.8, 0, Math.PI * 2);
        ctx!.fill();

        // Detection crosshair that contracts over the bug.
        const hairR = 16 * (1 - prog * 0.6);
        ctx!.strokeStyle = `rgba(134, 239, 172, ${(0.9 * (1 - prog)).toFixed(3)})`;
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        ctx!.arc(wx, wy, hairR, 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.moveTo(wx - hairR - 3, wy);
        ctx!.lineTo(wx - hairR + 3, wy);
        ctx!.moveTo(wx + hairR - 3, wy);
        ctx!.lineTo(wx + hairR + 3, wy);
        ctx!.moveTo(wx, wy - hairR - 3);
        ctx!.lineTo(wx, wy - hairR + 3);
        ctx!.moveTo(wx, wy + hairR - 3);
        ctx!.lineTo(wx, wy + hairR + 3);
        ctx!.stroke();
        ctx!.restore();
      }

      frameId = requestAnimationFrame(step);
    }

    function* cellAllIter(): Generator<Cell> {
      for (let i = 0; i < cells.length; i++) {
        const c = cellAt(i);
        if (c) yield c;
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
