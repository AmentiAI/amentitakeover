"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePestTheme } from "./use-pest-theme";

type Bullet = { label: string; detail: string };

type Props = {
  index: string;
  tag: string;
  title: ReactNode;
  lede: string;
  bullets: Bullet[];
  canvas: (visible: boolean) => ReactNode;
  accentDark?: string;
  accentLight?: string;
  reverse?: boolean;
  accentText?: string;
  accentTextLight?: string;
};

export function PestFeature({
  index,
  tag,
  title,
  lede,
  bullets,
  canvas,
  accentDark = "#0a0f10",
  accentLight = "#f3efe7",
  reverse = false,
  accentText = "text-emerald-300",
  accentTextLight = "text-emerald-700",
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { theme } = usePestTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const accentBg = isDark ? accentDark : accentLight;
  const headText = isDark ? "text-white" : "text-slate-900";
  const bodyText = isDark ? "text-white/70" : "text-slate-700";
  const muted = isDark ? "text-white/60" : "text-slate-600";
  const faint = isDark ? "text-white/45" : "text-slate-500";
  const divider = isDark ? "bg-white/20" : "bg-slate-900/20";
  const hair = isDark ? "border-white/10" : "border-slate-900/10";
  const hairHover = isDark ? "hover:border-white/30" : "hover:border-slate-900/30";
  const accentClass = isDark ? accentText : accentTextLight;
  const frameBorder = isDark ? "border-white/10" : "border-slate-900/10";
  const frameBg = isDark ? "bg-black/50" : "bg-white/70";
  const frameShadow = isDark ? "shadow-2xl shadow-black/40" : "shadow-xl shadow-slate-900/10";

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden py-16 sm:py-24 lg:py-32"
      style={{ backgroundColor: accentBg, transition: "background-color 350ms ease" }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-10">
        <div
          className={`lg:col-span-5 ${
            reverse ? "lg:order-2 lg:col-start-8" : "lg:order-1"
          } flex flex-col justify-center`}
        >
          <div className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] ${faint}`}>
            <span>{index}</span>
            <span className={`h-px w-8 ${divider}`} />
            <span>{tag}</span>
          </div>
          <h2 className={`mt-5 text-balance text-[clamp(1.6rem,4.8vw,3rem)] font-semibold leading-[1.1] tracking-tight ${headText}`}>
            {title}
          </h2>
          <p className={`mt-4 max-w-lg text-sm leading-relaxed sm:text-base ${bodyText}`}>
            {lede}
          </p>
          <ul className="mt-7 space-y-4 sm:mt-8">
            {bullets.map((b, i) => (
              <li key={i} className={`group flex gap-4 border-l pl-4 transition ${hair} ${hairHover}`}>
                <div className={`mt-1 font-mono text-[11px] uppercase tracking-[0.2em] ${accentClass}`}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${headText}`}>{b.label}</div>
                  <div className={`mt-1 text-sm ${muted}`}>{b.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={`lg:col-span-7 ${reverse ? "lg:order-1 lg:col-start-1" : "lg:order-2"}`}>
          <div
            className={`relative aspect-[4/5] w-full overflow-hidden rounded-2xl border sm:aspect-[5/4] ${frameBorder} ${frameBg} ${frameShadow}`}
          >
            {canvas(visible)}
          </div>
        </div>
      </div>
    </section>
  );
}
