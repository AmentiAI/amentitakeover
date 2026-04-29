"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type PestTheme = "dark" | "light";

type Ctx = {
  theme: PestTheme;
  setTheme: (t: PestTheme) => void;
  toggle: () => void;
};

const PestThemeCtx = createContext<Ctx>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

const STORAGE_KEY = "pest-theme";

export function PestThemeProvider({
  children,
  initial = "dark",
}: {
  children: ReactNode;
  initial?: PestTheme;
}) {
  const [theme, setThemeState] = useState<PestTheme>(initial);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light") setThemeState(saved);
    } catch {
      // ignore
    }
  }, []);

  const setTheme = useCallback((t: PestTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <PestThemeCtx.Provider value={{ theme, setTheme, toggle }}>
      <div data-pest-theme={theme} className={theme === "dark" ? "pest-dark" : "pest-light"}>
        {children}
      </div>
    </PestThemeCtx.Provider>
  );
}

export function usePestTheme() {
  return useContext(PestThemeCtx);
}
