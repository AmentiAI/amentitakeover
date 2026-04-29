"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Stats + credentials + cert seals strip. Ported from v0 with the blue-toned
// stat tile (Jobs completed) and the blue-toned QualityPro cert recolored to
// mint so the row reads as one cohesive emerald palette.

type Cert = {
  id: string;
  label: string;
  sub: string;
  color: string;
  glyph: (c: string) => ReactNode;
};

const CERTS: Cert[] = [
  {
    id: "qualitypro",
    label: "QualityPro",
    sub: "NPMA · consumer protection",
    color: "#34d399",
    glyph: (c) => (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <path d="M20 4L6 9v10c0 9 6 15 14 17 8-2 14-8 14-17V9L20 4z" stroke={c} strokeWidth="1.8" fill="none" />
        <path d="M13 20l5 5 9-10" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "greenpro",
    label: "GreenPro",
    sub: "Low-impact certified",
    color: "#16a34a",
    glyph: (c) => (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <path d="M8 22c0-10 10-15 24-15 0 14-6 24-16 24-6 0-8-4-8-9z" stroke={c} strokeWidth="1.8" fill="none" />
        <path d="M10 32c6-6 12-12 22-18" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "npma",
    label: "NPMA member",
    sub: "Since 2012",
    color: "#0891b2",
    glyph: (c) => (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <circle cx="20" cy="20" r="15" stroke={c} strokeWidth="1.8" fill="none" />
        <text x="20" y="25" textAnchor="middle" fontSize="13" fontWeight="bold" fill={c} fontFamily="ui-sans-serif,system-ui">NPMA</text>
      </svg>
    ),
  },
  {
    id: "epa",
    label: "EPA registered",
    sub: "All products approved",
    color: "#4f46e5",
    glyph: (c) => (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <rect x="6" y="8" width="28" height="24" rx="3" stroke={c} strokeWidth="1.8" fill="none" />
        <text x="20" y="25" textAnchor="middle" fontSize="11" fontWeight="bold" fill={c} fontFamily="ui-sans-serif,system-ui">EPA</text>
        <path d="M10 11l4-3M30 11l-4-3" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "sentricon",
    label: "Sentricon authorized",
    sub: "Termite bait specialist",
    color: "#d97706",
    glyph: (c) => (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <circle cx="20" cy="20" r="14" stroke={c} strokeWidth="1.8" fill="none" />
        <circle cx="20" cy="20" r="4" fill={c} />
        <path d="M20 6v6M20 28v6M6 20h6M28 20h6" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "petsafe",
    label: "Pet-safe certified",
    sub: "Kids · dogs · cats",
    color: "#db2777",
    glyph: (c) => (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <circle cx="14" cy="14" r="3" fill={c} />
        <circle cx="26" cy="14" r="3" fill={c} />
        <circle cx="10" cy="22" r="2.4" fill={c} />
        <circle cx="30" cy="22" r="2.4" fill={c} />
        <path d="M13 28c0-4 3-6 7-6s7 2 7 6-3 6-7 6-7-2-7-6z" stroke={c} strokeWidth="1.8" fill="none" />
      </svg>
    ),
  },
  {
    id: "bbb",
    label: "BBB Accredited A+",
    sub: "0 unresolved complaints",
    color: "#0f766e",
    glyph: (c) => (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <rect x="7" y="10" width="26" height="20" rx="2" stroke={c} strokeWidth="1.8" fill="none" />
        <text x="20" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill={c} fontFamily="ui-sans-serif,system-ui">BBB</text>
        <text x="32" y="15" textAnchor="middle" fontSize="10" fontWeight="bold" fill={c} fontFamily="ui-sans-serif,system-ui">A+</text>
      </svg>
    ),
  },
];

function useCountUp(target: number, durationMs = 1400, startOn = true) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!startOn) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, startOn]);
  return v;
}

function SealCanvas({ color }: { color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    const io = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? false)); io.observe(canvas);

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const rot = t * 0.0003;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = `${color}40`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = `${color}22`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const r0 = Math.min(w, h) * 0.3;
        const r1 = Math.min(w, h) * 0.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
        ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.stroke();
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [color]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

export function PestTrustStripSection({
  yearsInBusiness,
  jobsCompleted,
  reviewsCount,
  rating,
  loc,
  licenseNumber,
}: {
  yearsInBusiness?: number;
  jobsCompleted?: number;
  reviewsCount?: number;
  rating?: number | null;
  // Locality string e.g. "Eastern CT" or "Across Texas". Falls back to a
  // neutral phrase when unknown.
  loc?: string | null;
  // Free-form license string e.g. "CT # B-2684". Falls back to "Locally
  // licensed" when not on file.
  licenseNumber?: string | null;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => setInView(e[0]?.isIntersecting ?? false), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const yearsTarget = Math.max(2, yearsInBusiness ?? 16);
  const jobsTarget = Math.max(120, jobsCompleted ?? 2847);
  const reviewsTarget = Math.max(1, reviewsCount ?? 288);
  // Round rating to 1 decimal but animate as integer * 10 then divide to keep
  // the count-up integer math working.
  const ratingTarget10 = Math.round(((rating ?? 4.9)) * 10);

  const years = useCountUp(yearsTarget, 1400, inView);
  const projects = useCountUp(jobsTarget, 1600, inView);
  const reviews = useCountUp(reviewsTarget, 1200, inView);
  const ratingV = useCountUp(ratingTarget10, 1000, inView);

  const localityLine = loc?.trim() ? `Across ${loc}` : "In your area";
  const licenseLine = licenseNumber?.trim() || "Locally licensed";

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden bg-[var(--pest-bg-accent)] py-10 sm:py-14 lg:py-16"
    >
      <style>{`
        @keyframes pest-trust-shine {
          0% { transform: translateX(-30%); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(130%); opacity: 0; }
        }
      `}</style>
      {/* Twin radial pools + a slow horizontal sheen sweep so the credentials
          panel has a subtle "polished" feel — eye picks it up without it
          becoming a distraction. */}
      <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(52, 211, 153, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(52, 211, 153, 0.1) 0%, transparent 50%)",
          }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[40%] mix-blend-screen"
        aria-hidden
        style={{
          background:
            "linear-gradient(110deg, transparent 30%, rgba(52, 211, 153, 0.10) 50%, transparent 70%)",
          animation: "pest-trust-shine 9s ease-in-out infinite",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
          {[
            { k: "years", v: years, suffix: "", label: "Years in business", sub: "Family-owned operation", color: "#34d399" },
            { k: "projects", v: projects, suffix: "", label: "Jobs completed", sub: localityLine, color: "#34d399" },
            { k: "rating", v: (ratingV / 10).toFixed(1), suffix: "★", label: "Aggregate rating", sub: `${reviews}+ verified reviews`, color: "#fbbf24" },
            { k: "warranty", v: 90, suffix: "-day", label: "Retreat warranty", sub: "Longer on annual plans", color: "#c084fc" },
          ].map((s) => (
            <div
              key={s.k}
              className="relative overflow-hidden rounded-xl border border-[var(--pest-border)] bg-white/[0.03] p-4 backdrop-blur sm:p-5"
            >
              <div
                className="absolute inset-0"
                aria-hidden
                style={{
                  opacity: 0.2,
                  background: `radial-gradient(circle at 80% 20%, ${s.color}66, transparent 60%)`,
                }}
              />
              <div className="relative">
                <div
                  className="flex items-baseline gap-1 font-bold tracking-tight text-[var(--pest-text-strong)]"
                  style={{ fontSize: "clamp(1.6rem, 5vw, 2.75rem)" }}
                >
                  <span>{s.v}</span>
                  <span className="text-base sm:text-lg" style={{ color: s.color }}>{s.suffix}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--pest-text-soft)]">{s.label}</div>
                <div className="mt-0.5 text-[11px] text-[var(--pest-text-faint)]">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--pest-border)] bg-white/[0.02] p-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--pest-text-faint)]">License</div>
              <div className="mt-0.5 font-mono text-sm font-bold text-[var(--pest-text-strong)]">{licenseLine}</div>
            </div>
            <div className="hidden h-10 w-px bg-white/10 sm:block" aria-hidden />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--pest-text-faint)]">Insurance</div>
              <div className="mt-0.5 text-sm font-bold text-[var(--pest-text-strong)]">$2M general liability · $1M auto</div>
            </div>
            <div className="hidden h-10 w-px bg-white/10 sm:block" aria-hidden />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--pest-text-faint)]">Coverage</div>
              <div className="mt-0.5 text-sm font-bold text-[var(--pest-text-strong)]">Bonded · Workers&apos; Comp</div>
            </div>
          </div>

          <a
            href="#quote"
            className="group inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full border border-[color-mix(in_srgb,var(--pest-emerald)_55%,transparent)] bg-[color-mix(in_srgb,var(--pest-emerald)_15%,transparent)] px-4 py-2 text-xs font-semibold text-[var(--pest-emerald)] transition hover:bg-[color-mix(in_srgb,var(--pest-emerald)_25%,transparent)] sm:self-auto"
          >
            Verify license #
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="currentColor">
              <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </a>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-4 sm:gap-3 lg:grid-cols-7">
          {CERTS.map((c) => (
            <div
              key={c.id}
              className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-[var(--pest-border)] bg-white/[0.03] p-3 text-center transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06] sm:p-4"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <SealCanvas color={c.color} />
              </div>
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: `${c.color}18`, color: c.color }}
              >
                {c.glyph(c.color)}
              </div>
              <div className="relative min-h-[40px]">
                <div className="text-xs font-semibold leading-tight text-[var(--pest-text-strong)] sm:text-sm">
                  {c.label}
                </div>
                <div className="mt-0.5 text-[10px] leading-tight text-[var(--pest-text-faint)]">
                  {c.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
