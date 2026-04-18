"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  target: number;
  label: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

// Slate/amber-styled count-up stat for the roofing hero stat band. Same
// IntersectionObserver + ease-out-cubic mechanics as the pest counter, but
// typographic treatment fits the roofing visual system (serif number, uppercase
// slate label with a thin top divider).
export function RoofCounter({
  target,
  label,
  duration = 2000,
  prefix = "",
  suffix = "",
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const startTs = performance.now();
      let rafId = 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - startTs) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.floor(target * eased));
        if (t < 1) rafId = requestAnimationFrame(tick);
        else setValue(target);
      };
      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            run();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <div ref={ref} className={className}>
      <div className="h-px w-10 bg-amber-400/80" />
      <div className="mt-4 font-serif text-[48px] font-semibold leading-none tracking-tight tabular-nums text-slate-50 sm:text-[60px]">
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
        {label}
      </div>
    </div>
  );
}
