"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  target: number;
  label: string;
  // Animation duration in ms. Counter eases out so the last digits "arrive"
  // more slowly, giving the number a more deliberate landing.
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

// Count-up stat. Starts at 0, runs once when the element scrolls into view.
// If prefers-reduced-motion is set, the final value appears immediately.
export function PestCounter({
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
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.floor(target * eased));
        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setValue(target);
        }
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
      <div className="text-[48px] font-extrabold leading-none tracking-tight tabular-nums sm:text-[64px]">
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300/75">
        {label}
      </div>
    </div>
  );
}
