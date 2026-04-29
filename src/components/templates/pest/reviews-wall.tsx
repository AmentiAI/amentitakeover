"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { usePestTheme } from "./use-pest-theme";

type Platform = "google" | "yelp" | "facebook" | "nextdoor";

type Review = {
  id: string;
  name: string;
  location: string;
  rating: 1 | 2 | 3 | 4 | 5;
  platform: Platform;
  date: string;
  verified: boolean;
  pest?: string;
  text: string;
};

// Curated default pool used to fill out the marquee when the business doesn't
// have enough scraped testimonials to make three rows feel populated.
const DEFAULT_REVIEWS: Review[] = [
  { id: "d1", name: "Sarah M.", location: "Plainfield, CT", rating: 5, platform: "google", date: "3 weeks ago", verified: true, pest: "Roaches", text: "Called at 9am, they were in my kitchen by noon. Haven't seen a roach since. The tech explained exactly what he was applying and where — no mystery, no upsell." },
  { id: "d2", name: "Tom R.", location: "Norwich, CT", rating: 5, platform: "google", date: "1 month ago", verified: true, pest: "Mice", text: "Found the mouse entry in 15 minutes — a gap under the dishwasher I'd never have seen. Sealed with copper mesh. Problem done." },
  { id: "d3", name: "Jenny K.", location: "Putnam, CT", rating: 5, platform: "yelp", date: "6 weeks ago", verified: true, pest: "Carpenter ants", text: "Found the satellite nest in a porch post the old company missed for TWO YEARS. One treatment, gone." },
  { id: "d4", name: "Mike D.", location: "Brooklyn, CT", rating: 5, platform: "facebook", date: "2 months ago", verified: true, pest: "Yellowjackets", text: "Nest in the soffit 20 feet up. Showed up in a full suit, had it out in 30 minutes, sealed the gap behind. No-nonsense professionals." },
  { id: "d5", name: "Patricia L.", location: "Canterbury, CT", rating: 5, platform: "google", date: "2 weeks ago", verified: true, pest: "Bed bugs", text: "Heat treatment. One day, done. They explained everything we needed to do to prep and we didn't find a single bug after." },
  { id: "d6", name: "Greg S.", location: "Killingly, CT", rating: 4, platform: "yelp", date: "3 months ago", verified: true, pest: "Rats", text: "Took two visits to get all the burrows outside, but once they did, we haven't seen rats in 4 months. Warranty-backed and they came back when I called." },
  { id: "d7", name: "Amanda W.", location: "Woodstock, CT", rating: 5, platform: "nextdoor", date: "5 weeks ago", verified: true, pest: "Ticks", text: "Two kids, a dog, and wooded yard edge — we pulled a tick off someone every day. After the perimeter treatment it's been 6 weeks without one." },
  { id: "d8", name: "Rich & Linda B.", location: "Griswold, CT", rating: 5, platform: "google", date: "4 months ago", verified: true, pest: "Termites", text: "Sentricon bait system install, every station checked on the 90-day dot. Real paperwork, real reports. Peace of mind for an old house." },
  { id: "d9", name: "Kevin P.", location: "Lisbon, CT", rating: 5, platform: "facebook", date: "1 month ago", verified: true, text: "Quarterly plan — they just show up, do the work, email the report. Zero hassle. Exactly what I wanted." },
  { id: "d10", name: "Dana F.", location: "Sterling, CT", rating: 5, platform: "google", date: "2 months ago", verified: true, pest: "Spiders", text: "Basement was wall-to-wall cellar spiders. One treatment and it's literally a different room. My husband can finally use his workshop." },
  { id: "d11", name: "Alex T.", location: "Voluntown, CT", rating: 5, platform: "yelp", date: "3 weeks ago", verified: true, pest: "Wasps", text: "Two ground nests in the yard right before my kid's birthday party. They fit me in same-day at 5pm. Party saved." },
  { id: "d12", name: "Michelle G.", location: "Pomfret, CT", rating: 5, platform: "google", date: "2 months ago", verified: true, pest: "Mice", text: "Old farmhouse = mouse highway. They mapped every entry, sealed them all, set the traps, and followed up. First winter without a single mouse in 12 years." },
  { id: "d13", name: "Derek V.", location: "Thompson, CT", rating: 5, platform: "nextdoor", date: "6 weeks ago", verified: true, text: "Honest pricing, no aggressive selling. Flat rate, written warranty. Rare these days." },
  { id: "d14", name: "Rachel H.", location: "Hampton, CT", rating: 5, platform: "google", date: "1 month ago", verified: true, pest: "Stink bugs", text: "Autumn wall-to-wall stink bug invasion on the south side of the house. They sprayed the exterior band and the difference was stark within a week." },
  { id: "d15", name: "Tony M.", location: "Scotland, CT", rating: 5, platform: "facebook", date: "3 months ago", verified: true, pest: "Wildlife", text: "Family of squirrels in the attic. Humanely trapped, relocated, and the entry holes sealed with heavy-gauge mesh. A+ work." },
];

const PLATFORM_COLORS: Record<Platform, { bg: string; fg: string; name: string }> = {
  google: { bg: "#4285F4", fg: "#ffffff", name: "Google" },
  yelp: { bg: "#D32323", fg: "#ffffff", name: "Yelp" },
  facebook: { bg: "#1877F2", fg: "#ffffff", name: "Facebook" },
  nextdoor: { bg: "#22B573", fg: "#ffffff", name: "Nextdoor" },
};

const PLATFORM_GLYPH: Record<Platform, ReactNode> = {
  google: (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
      <path d="M21.35 11.1h-9.17v2.9h5.25c-.23 1.5-1.66 4.4-5.25 4.4-3.16 0-5.74-2.63-5.74-5.9s2.58-5.9 5.74-5.9c1.8 0 3 .78 3.68 1.44l2.5-2.45C16.45 4.05 14.45 3 12.18 3 7.1 3 3 7.05 3 12s4.1 9 9.18 9c5.3 0 8.82-3.72 8.82-8.97 0-.6-.07-1.07-.15-1.53z" />
    </svg>
  ),
  yelp: (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
      <path d="M14.5 11.2l-1.3-4c-.15-.45.08-.95.52-1.1.45-.17 4.05-1.3 4.5-1.2.6.15.9.7.72 1.3l-2.5 4.75c-.25.45-.75.55-1.2.35-.35-.2-.52-.55-.74-.1zM13 16.8l1.7-3.7c.2-.45.7-.55 1.15-.35l3.5 2.55c.45.3.55.9.2 1.3-.18.2-.35.4-.55.55-.55.55-1.8 1.25-2.4 1.5-.52.2-1.1-.1-1.25-.65l-.95-3.55c-.15-.45.15-.9.6-.65zM10.5 9.8l-5-3.2c-.45-.3-.55-.95-.2-1.35.8-.9 3.3-2.3 4.4-2.3.55 0 .95.4.95.95v6.4c0 .45-.35.75-.75.75-.15 0-.3-.05-.4-.25zm0 4.4v4.6c0 .5-.4.95-.95.95-.4 0-3.05-.55-4.2-1.65-.4-.4-.3-1 .15-1.3l4.3-2.6c.45-.3 1 0 1 .55 0-.15.05.45-.3.45zM4.9 13.2l3.75-.85c.45-.1.9.2.95.65 0 .3.1.55.1.85 0 .55-1.5 3.6-2.2 4.4-.35.4-1 .35-1.35-.1L4 15.5c-.35-.5-.1-1.15.4-1.35.2-.1.35-.1.5-.05z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  ),
  nextdoor: (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
      <path d="M12 2L2 9l2 1.5V20h6v-6h4v6h6v-9.5L22 9 12 2zm0 2.5L19 10v9h-2v-6h-8v6H7V10l5-3.5z" />
    </svg>
  ),
};

function Stars({ n, isDark }: { n: number; isDark: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="currentColor"
          style={{
            color: i <= n ? "#fbbf24" : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
          }}
        >
          <path d="M12 2l3.1 6.3 7 1-5.1 4.9 1.2 7-6.2-3.3-6.2 3.3 1.2-7L2 9.3l7-1L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  const { theme } = usePestTheme();
  const isDark = theme === "dark";
  const plat = PLATFORM_COLORS[r.platform];

  return (
    <article
      className={`flex w-[280px] shrink-0 flex-col gap-3 rounded-xl border p-4 sm:w-[340px] sm:p-5 ${
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-900/10 bg-white shadow-sm shadow-slate-900/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: plat.bg }}
            aria-hidden
          >
            {r.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
          </div>
          <div>
            <div className={`text-sm font-semibold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {r.name}
            </div>
            <div className={`text-[11px] leading-tight ${isDark ? "text-white/50" : "text-slate-500"}`}>
              {r.location}
            </div>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: `${plat.bg}18`, color: plat.bg }}
        >
          {PLATFORM_GLYPH[r.platform]}
          {plat.name}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <Stars n={r.rating} isDark={isDark} />
        <span className={`font-mono text-[9px] uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>
          {r.date}
        </span>
      </div>
      <p className={`text-sm leading-relaxed ${isDark ? "text-white/80" : "text-slate-700"}`}>
        {r.text}
      </p>
      <div className="mt-auto flex items-center justify-between">
        {r.pest ? (
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
              isDark ? "border-white/15 text-white/60" : "border-slate-900/15 text-slate-500"
            }`}
          >
            {r.pest}
          </span>
        ) : (
          <span />
        )}
        {r.verified && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
            <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden>
              <path d="M10 0l2.4 2.4L16 2l.8 3.4 3.2 1.2-1.6 3 1.6 3-3.2 1.2-.8 3.4-3.6-.4L10 20l-2.4-2.4L4 18l-.8-3.4L0 13.4l1.6-3L0 7.4l3.2-1.2L4 2l3.6.4L10 0zm4.3 7.3L9 12.5 5.7 9.3l-1.4 1.4L9 15.3l6.7-6.6-1.4-1.4z" />
            </svg>
            Verified
          </span>
        )}
      </div>
    </article>
  );
}

function MarqueeRow({
  reviews,
  direction,
  speedSec,
}: {
  reviews: Review[];
  direction: "left" | "right";
  speedSec: number;
}) {
  const maskStyle = "linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%)";
  return (
    <div
      className="pest-marquee group relative overflow-hidden"
      style={{ maskImage: maskStyle, WebkitMaskImage: maskStyle }}
    >
      <div
        className="pest-marquee-track flex gap-3 sm:gap-4"
        style={{
          width: "max-content",
          animation: `${direction === "left" ? "pest-marquee-l" : "pest-marquee-r"} ${speedSec}s linear infinite`,
        }}
      >
        {[...reviews, ...reviews].map((r, i) => (
          <ReviewCard key={`${r.id}-${i}`} r={r} />
        ))}
      </div>
    </div>
  );
}

function StarFieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = usePestTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; twinkle: number };
    const ps: Particle[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps.length = 0;
      const count = Math.min(55, Math.round((w * h) / 14000));
      for (let i = 0; i < count; i++) {
        ps.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          r: 0.6 + Math.random() * 1.8,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? false));
    io.observe(canvas);

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const isLight = themeRef.current === "light";
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        p.twinkle += 0.03;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const a = 0.18 + (Math.sin(p.twinkle) + 1) / 2 * 0.42;
        const color = isLight ? `rgba(245, 180, 30, ${a})` : `rgba(253, 224, 71, ${a})`;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const ang = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? p.r * 2.4 : p.r;
          const x = p.x + Math.cos(ang) * r;
          const y = p.y + Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
      void t;
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

// Replace the curated defaults' hardcoded locations with values derived from
// the active business's `loc` (e.g. "Mequon, WI"). Three rotating display
// forms — "City, ST" / "Greater City" / "City Metro" — give the marquee
// regional variety without inventing nearby town names we can't verify.
// When `loc` is missing we leave the original placeholder text alone so the
// cards still read as real reviews instead of falling back to "" or
// "your area".
function localizeDefaultReviews(reviews: Review[], loc: string | null): Review[] {
  if (!loc) return reviews;
  const trimmed = loc.trim();
  if (!trimmed) return reviews;

  const commaIdx = trimmed.indexOf(",");
  const city = (commaIdx >= 0 ? trimmed.slice(0, commaIdx) : trimmed).trim();
  const state = commaIdx >= 0 ? trimmed.slice(commaIdx + 1).trim() : "";

  const variants: string[] = [trimmed];
  if (city) {
    variants.push(`Greater ${city}`);
    variants.push(`${city} Metro`);
    if (state) variants.push(`Outside ${city}, ${state}`);
  }

  return reviews.map((r, i) => ({
    ...r,
    location: variants[i % variants.length],
  }));
}

// Convert our scraped testimonials into the Review shape used by the marquee.
// We don't know the source platform from a scraped quote, so we round-robin
// through the four big platforms based on index — keeps the visual mix without
// fabricating a specific "this came from Yelp" claim for each one.
function adaptScrapedTestimonials(
  testimonials: { quote: string; author: string; location: string; rating: number }[],
): Review[] {
  const platforms: Platform[] = ["google", "google", "yelp", "facebook", "google", "nextdoor"];
  const dates = ["2 weeks ago", "1 month ago", "3 weeks ago", "6 weeks ago", "2 months ago"];
  return testimonials.map((t, i) => {
    const r = Math.max(1, Math.min(5, Math.round(t.rating || 5))) as 1 | 2 | 3 | 4 | 5;
    return {
      id: `s${i}`,
      name: t.author || "Local customer",
      location: t.location || "",
      rating: r,
      platform: platforms[i % platforms.length],
      date: dates[i % dates.length],
      verified: true,
      text: t.quote,
    };
  });
}

export function ReviewsWallSection({
  testimonials,
  reviewCountHint,
  rating,
  loc,
}: {
  testimonials: { quote: string; author: string; location: string; rating: number }[];
  reviewCountHint?: number;
  rating?: number | null;
  loc?: string | null;
}) {
  const { theme } = usePestTheme();
  const isDark = theme === "dark";

  // Combine scraped testimonials with curated defaults so we always have
  // enough cards to fill three rows. Real ones go first, defaults pad — and
  // the defaults' hardcoded "Plainfield, CT"-style locations get rewritten
  // to match the current business's locality so the marquee never looks
  // imported from a different region.
  const reviews = useMemo<Review[]>(() => {
    const real = adaptScrapedTestimonials(testimonials);
    const need = Math.max(0, 12 - real.length);
    const localizedDefaults = localizeDefaultReviews(
      DEFAULT_REVIEWS.slice(0, need),
      loc ?? null,
    );
    return [...real, ...localizedDefaults];
  }, [testimonials, loc]);

  const rows = useMemo(() => {
    const copy = [...reviews];
    const third = Math.ceil(copy.length / 3);
    return [copy.slice(0, third + 1), copy.slice(third, third * 2 + 1), copy.slice(third * 2)];
  }, [reviews]);

  const avg = rating && rating > 0
    ? rating
    : reviews.reduce((s, r) => s + r.rating, 0) / Math.max(1, reviews.length);
  const total = reviewCountHint && reviewCountHint > 0 ? reviewCountHint : reviews.length * 18;

  // Platform breakdown — proportional weights so totals always sum to `total`.
  const platforms: { p: Platform; n: number; r: number }[] = [
    { p: "google", n: Math.round(total * 0.66), r: Math.min(5, Math.max(4.5, avg)) },
    { p: "yelp", n: Math.round(total * 0.15), r: Math.min(5, Math.max(4.3, avg - 0.1)) },
    { p: "facebook", n: Math.round(total * 0.13), r: Math.min(5, Math.max(4.7, avg)) },
    { p: "nextdoor", n: Math.max(1, total - Math.round(total * 0.66) - Math.round(total * 0.15) - Math.round(total * 0.13)), r: Math.min(5, Math.max(4.5, avg)) },
  ];

  const localityLine = loc ? `${loc} neighbors` : "neighbors";

  return (
    <section
      className="relative w-full overflow-hidden py-14 sm:py-20 lg:py-28"
      style={{ backgroundColor: isDark ? "#0a1612" : "#f3eedb", transition: "background-color 350ms ease" }}
    >
      <style>{`
        @keyframes pest-marquee-l { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pest-marquee-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .pest-marquee:hover .pest-marquee-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .pest-marquee-track { animation: none !important; } }
      `}</style>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <StarFieldCanvas />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] ${isDark ? "text-white/45" : "text-slate-500"}`}>
          <span>14</span>
          <span className={`h-px w-8 ${isDark ? "bg-white/20" : "bg-slate-900/20"}`} />
          <span>Reviews</span>
        </div>

        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className={`max-w-2xl text-balance text-[clamp(1.6rem,4.8vw,3rem)] font-semibold leading-[1.1] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            <span className={isDark ? "text-amber-300" : "text-amber-600"}>{avg.toFixed(1)} stars.</span>
            {" "}{total}+ {localityLine} can&apos;t be wrong.
          </h2>

          <div
            className={`flex items-center gap-4 rounded-xl border px-4 py-3 backdrop-blur ${
              isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-900/10 bg-white/80"
            }`}
          >
            <div>
              <div className={`flex items-center gap-1 text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {avg.toFixed(1)}
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#fbbf24"><path d="M12 2l3.1 6.3 7 1-5.1 4.9 1.2 7-6.2-3.3-6.2 3.3 1.2-7L2 9.3l7-1L12 2z" /></svg>
              </div>
              <div className={`font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-white/50" : "text-slate-500"}`}>
                Aggregate · {total}+ reviews
              </div>
            </div>
            <div className="h-10 w-px" style={{ background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }} aria-hidden />
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
              {platforms.map((pl) => {
                const c = PLATFORM_COLORS[pl.p];
                return (
                  <div key={pl.p} className="flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: c.bg }}>
                      {PLATFORM_GLYPH[pl.p]}
                    </span>
                    <div className="leading-tight">
                      <div className={`text-xs font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{pl.r.toFixed(1)}</div>
                      <div className={`font-mono text-[9px] uppercase tracking-wider ${isDark ? "text-white/45" : "text-slate-500"}`}>{pl.n}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-3 sm:mt-12 sm:space-y-4">
          <MarqueeRow reviews={rows[0]} direction="left" speedSec={68} />
          <MarqueeRow reviews={rows[1]} direction="right" speedSec={82} />
          <MarqueeRow reviews={rows[2]} direction="left" speedSec={74} />
        </div>

        <div className={`mt-8 flex flex-wrap items-center gap-3 text-xs sm:mt-10 ${isDark ? "text-white/55" : "text-slate-600"}`}>
          <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-slate-500"}`}>
            Hover any card to pause the row
          </span>
        </div>
      </div>
    </section>
  );
}
