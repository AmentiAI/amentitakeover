"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronUp, Shield, Sparkles, Star, X } from "lucide-react";
import {
  PRICING_TIERS,
  formatMonthly,
  formatSetup,
  type PricingTier,
} from "@/lib/pricing";

const CHECKOUT_BASE = "https://amentiai.com/checkout";
const AUTO_OPEN_MS = 20_000;
const OPENED_KEY = "amenti-preview-pricing-opened";
const DISMISSED_KEY = "amenti-preview-pricing-dismissed";

export function PreviewPricingModal() {
  // launcher is the compact pill that sits in the bottom-right corner
  // expanded is the full pricing card overlay
  const [launcherVisible, setLauncherVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const autoFiredRef = useRef(false);

  // Mount: decide whether to show launcher, and schedule first auto-open
  useEffect(() => {
    if (typeof window === "undefined") return;
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // ignore
    }

    setLauncherVisible(!dismissed);

    let alreadyOpened = false;
    try {
      alreadyOpened = window.sessionStorage.getItem(OPENED_KEY) === "1";
    } catch {
      // ignore
    }

    if (dismissed || alreadyOpened) return;

    const timer = window.setTimeout(() => {
      if (autoFiredRef.current) return;
      autoFiredRef.current = true;
      setExpanded(true);
      try {
        window.sessionStorage.setItem(OPENED_KEY, "1");
      } catch {
        // ignore
      }
    }, AUTO_OPEN_MS);

    return () => window.clearTimeout(timer);
  }, []);

  // Lock page scroll only while expanded; escape closes expanded view
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  function dismissLauncher() {
    setLauncherVisible(false);
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  }

  function openExpanded() {
    setExpanded(true);
    try {
      window.sessionStorage.setItem(OPENED_KEY, "1");
    } catch {
      // ignore
    }
  }

  function selectPlan(tier: PricingTier) {
    const url = `${CHECKOUT_BASE}?plan=${encodeURIComponent(tier.key)}`;
    window.location.href = url;
  }

  return (
    <>
      {/* Launcher pill — lives in bottom-right */}
      {launcherVisible && !expanded && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[9998] sm:bottom-5 sm:right-5">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/95 p-1 pl-4 text-sm text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur">
            <button
              onClick={openExpanded}
              className="flex items-center gap-2 rounded-full pr-3 text-sm font-semibold"
              aria-label="Open pricing"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              <span>See pricing</span>
              <ChevronUp className="h-3.5 w-3.5 opacity-70" />
            </button>
            <button
              onClick={dismissLauncher}
              aria-label="Hide pricing launcher"
              className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded popover — anchored bottom-right, not full-screen */}
      {expanded && (
        <>
          {/* Soft page scrim — click to minimize */}
          <div
            className="fixed inset-0 z-[9998] bg-slate-950/35 backdrop-blur-[2px]"
            onClick={() => setExpanded(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose a plan"
            className="fixed bottom-3 right-3 z-[9999] flex max-h-[calc(100vh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)] ring-1 ring-slate-900/10 sm:bottom-5 sm:right-5 sm:max-h-[min(88vh,780px)]"
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-[#050816] px-5 pb-5 pt-5 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.24),transparent_60%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.18),transparent_60%),linear-gradient(180deg,#050816_0%,#0a1030_60%,#050816_100%)]" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/amenti-logo.png"
                      alt="Amenti AI"
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <div className="leading-tight">
                    <div className="text-[9.5px] font-semibold uppercase tracking-[0.28em] text-white/60">
                      Amenti AI
                    </div>
                    <div className="text-[13px] font-semibold text-white/90">
                      Websites & Local Growth
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  aria-label="Minimize pricing"
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="relative mt-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
                  <Sparkles className="h-3 w-3 text-cyan-300" />
                  This preview is yours
                </div>
                <h2 className="mt-2.5 text-[19px] font-semibold leading-snug tracking-tight">
                  Launch your new website in{" "}
                  <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-400 bg-clip-text text-transparent">
                    7–10 days
                  </span>
                </h2>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/70">
                  30-day out any time. No long-term contract. We build on the
                  preview you&apos;re already looking at.
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-white/70">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="ml-1">Trusted by local businesses nationwide</span>
                </div>
              </div>
            </div>

            {/* Plans — stacked to fit narrow popover */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-4">
              <div className="flex flex-col gap-3">
                {PRICING_TIERS.map((tier) => {
                  const popular = tier.badge === "Most Popular";
                  return (
                    <div
                      key={tier.key}
                      className={`relative flex flex-col rounded-xl border p-4 transition ${
                        popular
                          ? "border-indigo-500 bg-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.5)] ring-1 ring-indigo-500/40"
                          : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      {popular && (
                        <div className="absolute -top-2.5 left-4 whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-md shadow-indigo-500/40">
                          {tier.badge}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        <span aria-hidden>{tier.emoji}</span>
                        <span>{tier.name}</span>
                      </div>

                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black tracking-tight text-slate-950">
                          {formatMonthly(tier)}
                        </span>
                        {tier.monthly != null && (
                          <span className="text-xs font-semibold text-slate-500">
                            /mo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatSetup(tier)
                          ? `${formatSetup(tier)} one-time setup`
                          : "Scoped to your business"}
                      </div>

                      <p className="mt-2 text-[12px] leading-snug text-slate-600">
                        {tier.tagline}
                      </p>

                      <ul className="mt-3 space-y-1.5 text-[12px] leading-snug text-slate-700">
                        {tier.inheritsFrom && (
                          <li className="flex items-start gap-1.5 font-semibold text-slate-900">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            Everything in {tier.inheritsFrom}
                          </li>
                        )}
                        {tier.features.slice(0, 4).map((f) => (
                          <li key={f} className="flex items-start gap-1.5">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            <span>{f}</span>
                          </li>
                        ))}
                        {tier.features.length > 4 && (
                          <li className="pl-5 text-[10.5px] text-slate-500">
                            + {tier.features.length - 4} more included
                          </li>
                        )}
                      </ul>

                      <button
                        onClick={() => selectPlan(tier)}
                        className={`mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[12.5px] font-bold transition ${
                          popular
                            ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md shadow-indigo-500/30 hover:brightness-110"
                            : "bg-slate-950 text-white hover:bg-slate-800"
                        }`}
                      >
                        {tier.ctaLabel}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust bar */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <Shield className="h-3 w-3 text-emerald-500" />
                30-day out any time
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="text-[11px] font-semibold text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
              >
                Keep exploring →
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
