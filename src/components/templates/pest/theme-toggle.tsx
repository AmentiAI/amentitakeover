"use client";

import { usePestTheme } from "./use-pest-theme";

export function PestThemeToggle() {
  const { theme, toggle } = usePestTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`fixed right-3 top-3 z-50 inline-flex h-10 items-center gap-2 rounded-full border px-3 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur transition sm:right-5 sm:top-5 sm:h-11 sm:px-4 ${
        isDark
          ? "border-white/25 bg-black/50 text-white hover:bg-black/70"
          : "border-stone-700/30 bg-[#fbf6e7]/85 text-stone-800 hover:bg-[#fbf6e7]"
      }`}
    >
      <span className="relative flex h-5 w-10 items-center rounded-full bg-current/10">
        <span
          className={`absolute flex h-4 w-4 items-center justify-center rounded-full transition-all ${
            isDark ? "left-[2px] bg-amber-300 text-amber-900" : "left-[22px] bg-stone-800 text-amber-300"
          }`}
          aria-hidden
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </span>
      </span>
      {isDark ? "Dark" : "Light"}
    </button>
  );
}
