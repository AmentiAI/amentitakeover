"use client";

import { useEffect, useRef } from "react";
import { PestFeature } from "./feature-section";
import { usePestTheme } from "./use-pest-theme";

type Pest = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hitT: number;
};

function SafeHomeCanvas({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const { theme } = usePestTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const pests: Pest[] = [];
    let pulse = 0;

    const spawnPest = () => {
      const side = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      if (side === 0) { x = Math.random() * w; y = -10; }
      if (side === 1) { x = w + 10; y = Math.random() * h; }
      if (side === 2) { x = Math.random() * w; y = h + 10; }
      if (side === 3) { x = -10; y = Math.random() * h; }
      const tx = w / 2 + (Math.random() - 0.5) * 80;
      const ty = h / 2 + (Math.random() - 0.5) * 40;
      const dx = tx - x;
      const dy = ty - y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const speed = 40 + Math.random() * 60;
      pests.push({
        x,
        y,
        vx: (dx / d) * speed,
        vy: (dy / d) * speed,
        size: 3 + Math.random() * 3,
        hitT: -1,
      });
    };

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

    const drawHouse = (cx: number, cy: number, scale: number) => {
      const isLight = themeRef.current === "light";
      ctx.save();
      ctx.translate(cx, cy);
      const s = scale;
      ctx.strokeStyle = isLight ? "rgba(4, 78, 56, 0.85)" : "rgba(167, 243, 208, 0.85)";
      ctx.fillStyle = isLight ? "rgba(46, 32, 12, 0.92)" : "rgba(10, 32, 24, 0.95)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-55 * s, -5 * s, 110 * s, 55 * s);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-65 * s, -5 * s);
      ctx.lineTo(0, -50 * s);
      ctx.lineTo(65 * s, -5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(22 * s, -40 * s, 10 * s, 18 * s);
      ctx.strokeRect(22 * s, -40 * s, 10 * s, 18 * s);
      ctx.fillStyle = isLight ? "rgba(5, 150, 105, 0.55)" : "rgba(52, 211, 153, 0.35)";
      ctx.fillRect(-10 * s, 20 * s, 20 * s, 30 * s);
      ctx.strokeRect(-10 * s, 20 * s, 20 * s, 30 * s);
      ctx.fillStyle = isLight ? "rgba(110, 231, 183, 0.55)" : "rgba(167, 243, 208, 0.35)";
      const win = (x: number, y: number) => {
        ctx.fillRect(x * s, y * s, 16 * s, 14 * s);
        ctx.strokeRect(x * s, y * s, 16 * s, 14 * s);
        ctx.beginPath();
        ctx.moveTo(x * s + 8 * s, y * s);
        ctx.lineTo(x * s + 8 * s, y * s + 14 * s);
        ctx.moveTo(x * s, y * s + 7 * s);
        ctx.lineTo(x * s + 16 * s, y * s + 7 * s);
        ctx.stroke();
      };
      win(-42, 10);
      win(24, 10);
      win(-42, -25);
      win(24, -25);
      ctx.restore();
    };

    let raf = 0;
    let last = performance.now();
    let spawnT = 0;

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visibleRef.current) {
        last = t;
        return;
      }
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;

      const isLight = themeRef.current === "light";
      ctx.fillStyle = isLight ? "#fbf6e7" : "#040f0a";
      ctx.fillRect(0, 0, w, h);

      const now = t * 0.001;
      ctx.fillStyle = isLight ? "rgba(4, 78, 56, 0.28)" : "rgba(134, 239, 172, 0.12)";
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137.5 + now * 8) % w);
        const sy = ((i * 53.1 + Math.sin(now + i) * 20) % h + h) % h;
        ctx.fillRect(sx, sy, 1, 1);
      }

      const cx = w / 2;
      const cy = h / 2 + 10;
      const shieldR = Math.min(w, h) * 0.35;

      pulse += dt * 1.4;

      for (let i = 0; i < 3; i++) {
        const phase = (pulse + i * 0.6) % 1.6;
        const r = shieldR + phase * 30;
        const a = Math.max(0, 0.5 - phase * 0.32);
        ctx.strokeStyle = isLight
          ? `rgba(4, 120, 87, ${a})`
          : `rgba(134, 239, 172, ${a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, shieldR, 0, Math.PI * 2);
      ctx.clip();
      const hexSize = 18;
      ctx.strokeStyle = isLight ? "rgba(4, 78, 56, 0.18)" : "rgba(134, 239, 172, 0.12)";
      ctx.lineWidth = 1;
      for (let row = -10; row < 10; row++) {
        for (let col = -10; col < 10; col++) {
          const hx = cx + col * hexSize * 1.5;
          const hy = cy + row * hexSize * Math.sqrt(3) + (col % 2 ? (hexSize * Math.sqrt(3)) / 2 : 0);
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 3) * k;
            const px = hx + Math.cos(a) * hexSize * 0.9;
            const py = hy + Math.sin(a) * hexSize * 0.9;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();

      const sg = ctx.createRadialGradient(cx, cy, shieldR * 0.8, cx, cy, shieldR * 1.15);
      const glowRgb = isLight ? "4, 120, 87" : "134, 239, 172";
      sg.addColorStop(0, `rgba(${glowRgb}, 0)`);
      sg.addColorStop(0.7, `rgba(${glowRgb}, ${isLight ? 0.18 : 0.15})`);
      sg.addColorStop(1, `rgba(${glowRgb}, 0)`);
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(cx, cy, shieldR * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isLight ? "rgba(4, 120, 87, 0.85)" : "rgba(110, 231, 183, 0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, shieldR, 0, Math.PI * 2);
      ctx.stroke();

      drawHouse(cx, cy, Math.min(w, h) / 520 + 0.5);

      spawnT -= dt;
      if (spawnT <= 0) {
        spawnPest();
        spawnT = 0.18 + Math.random() * 0.3;
      }

      for (let i = pests.length - 1; i >= 0; i--) {
        const p = pests[i];
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (p.hitT < 0 && d < shieldR + 2) {
          p.hitT = t / 1000;
          const nx = dx / d;
          const ny = dy / d;
          const dot = p.vx * nx + p.vy * ny;
          p.vx = (p.vx - 2 * dot * nx) * 0.85;
          p.vy = (p.vy - 2 * dot * ny) * 0.85;
          p.x = cx + nx * (shieldR + 3);
          p.y = cy + ny * (shieldR + 3);
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.hitT > 0) {
          p.vx *= 0.98;
          p.vy *= 0.98;
        }

        const age = p.hitT > 0 ? t / 1000 - p.hitT : 0;
        const alpha = p.hitT > 0 ? Math.max(0, 1 - age / 2) : 0.85;

        ctx.fillStyle = isLight ? `rgba(60, 30, 20, ${alpha})` : `rgba(235, 160, 120, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.55, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
        ctx.fill();

        if (p.hitT > 0 && age < 0.4) {
          ctx.strokeStyle = isLight
            ? `rgba(4, 120, 87, ${1 - age / 0.4})`
            : `rgba(167, 243, 208, ${1 - age / 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8 + age * 30, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) pests.splice(i, 1);
      }

      const vg = ctx.createRadialGradient(cx, cy, shieldR * 0.6, cx, cy, Math.max(w, h));
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, isLight ? "rgba(20,40,30,0.15)" : "rgba(0,0,0,0.75)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.fillStyle = isLight ? "rgba(20, 70, 50, 0.75)" : "rgba(110, 231, 183, 0.55)";
      ctx.textAlign = "left";
      ctx.fillText("SHIELD · IGR BARRIER ACTIVE", 14, 20);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

export function SafeHomeShieldSection() {
  const { theme } = usePestTheme();
  const isDark = theme === "dark";
  const accentSpan = isDark ? "text-emerald-300" : "text-emerald-700";
  return (
    <PestFeature
      index="04"
      tag="Exclusion"
      accentDark="#06080a"
      accentLight="#f6efde"
      reverse
      accentText="text-emerald-300"
      accentTextLight="text-emerald-700"
      title={
        <>
          Keep them out in the <span className={accentSpan}>first place.</span>
        </>
      }
      lede="A real pest program isn't just chemistry — it's sealing the gaps, denying the food, and breaking the trail. Here's how we make your home boring to pests."
      bullets={[
        { label: "Full exclusion audit", detail: "Every exterior penetration, weep, sill, and utility gap is documented and sealed." },
        { label: "IGR (insect growth regulator)", detail: "Breaks the reproduction cycle — the colony collapses, not just the adults you see." },
        { label: "90-day retreat warranty", detail: "Something slips through? One call, we come back. No charge, no paperwork." },
      ]}
      canvas={(v) => <SafeHomeCanvas visible={v} />}
    />
  );
}
