"use client";

import type { ReactNode } from "react";
import { PestThemeProvider, usePestTheme } from "./use-pest-theme";
import { PestThemeToggle } from "./theme-toggle";

// CSS-variable plumbing for the pest theme. Sections use
// `bg-[var(--pest-bg-base)]` etc. so a single attribute swap on the wrapper
// flips every section between modes.
//
// Light mode is intentionally NOT pure white — it's a warm "kitchen counter"
// cream/sandstone (think quartz countertop), with low-contrast warm taupe
// text. The pest content sits on it like a printed brochure, not a glaring
// white screen.
const THEME_STYLES = `
[data-pest-theme="dark"] {
  --pest-bg-base: #06080a;
  --pest-bg-accent: #0a1612;
  --pest-bg-card: #0a1612;
  --pest-text-strong: #ffffff;
  --pest-text-soft: rgba(255, 255, 255, 0.85);
  --pest-text-mid: rgba(255, 255, 255, 0.65);
  --pest-text-faint: rgba(255, 255, 255, 0.50);
  --pest-text-veryfaint: rgba(255, 255, 255, 0.40);
  --pest-border: rgba(255, 255, 255, 0.10);
  --pest-border-strong: rgba(255, 255, 255, 0.20);
  --pest-emerald: #6ee7b7;
  --pest-emerald-strong: #34d399;
  --pest-shadow: rgba(0, 0, 0, 0.40);
}
[data-pest-theme="light"] {
  --pest-bg-base: #f6efde;
  --pest-bg-accent: #ede2c8;
  --pest-bg-card: #fbf6e7;
  --pest-text-strong: #1f1a10;
  --pest-text-soft: #2e271a;
  --pest-text-mid: #4d4329;
  --pest-text-faint: #6b5f44;
  --pest-text-veryfaint: #8a7d5f;
  --pest-border: rgba(60, 40, 15, 0.18);
  --pest-border-strong: rgba(60, 40, 15, 0.32);
  --pest-emerald: #047857;
  --pest-emerald-strong: #059669;
  --pest-shadow: rgba(60, 40, 15, 0.16);
}
`;

function ThemedShell({ children }: { children: ReactNode }) {
  const { theme } = usePestTheme();
  const isDark = theme === "dark";
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: isDark ? "#06080a" : "#f6efde",
        color: isDark ? "#fff" : "#1f1a10",
        transition: "background-color 350ms ease, color 350ms ease",
      }}
    >
      <PestThemeToggle />
      {children}
    </div>
  );
}

export function PestThemeFrame({ children }: { children: ReactNode }) {
  return (
    <PestThemeProvider initial="dark">
      <style>{THEME_STYLES}</style>
      <ThemedShell>{children}</ThemedShell>
    </PestThemeProvider>
  );
}
