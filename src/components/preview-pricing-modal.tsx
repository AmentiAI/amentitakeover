"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Shield, Sparkles, Star, X } from "lucide-react";
import {
  PRICING_TIERS,
  formatMonthly,
  formatSetup,
  type PricingTier,
} from "@/lib/pricing";

const CHECKOUT_BASE = "https://amentiai.com/checkout";
const DELAY_MS = 20_000;
const SESSION_KEY = "amenti-preview-pricing-shown";

export function PreviewPricingModal() {
  const [open, setOpen] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      // sessionStorage blocked — still fire once per mount
    }

    const timer = window.setTimeout(() => {
      if (firedRef.current) return;
      firedRef.current = true;
      setOpen(true);
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
    }, DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function selectPlan(tier: PricingTier) {
    const url = `${CHECKOUT_BASE}?plan=${encodeURIComponent(tier.key)}`;
    window.location.href = url;
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center overflow-y-auto bg-slate-950/85 px-0 py-0 backdrop-blur-md sm:items-center sm:p-6"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a plan"
    >
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-t-3xl bg-white shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)] ring-1 ring-slate-200 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close pricing"
          className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 backdrop-blur transition hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="relative overflow-hidden bg-[#050816] px-6 pb-10 pt-9 text-white sm:px-10 sm:pb-12 sm:pt-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.18),transparent_55%),linear-gradient(180deg,#050816_0%,#0a1030_55%,#050816_100%)]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(ellipse at top, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at top, black 30%, transparent 75%)",
            }}
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5 backdrop-blur">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/amenti-logo.png"
                  alt="Amenti AI"
                  className="h-full w-full object-contain"
                />
              </span>
              <div className="leading-tight">
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">
                  Amenti AI
                </div>
                <div className="text-sm font-semibold text-white/90">
                  Websites & Local Growth
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-2 text-xs text-white/70 sm:flex">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span>Trusted by local businesses nationwide</span>
            </div>
          </div>

          <div className="relative mt-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              This preview is yours — let&apos;s make it real
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-[2.4rem]">
              Launch your new website in{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-400 bg-clip-text text-transparent">
                7–10 days
              </span>{" "}
              — on your domain.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-[15px]">
              Pick the plan that fits where your business is today. No
              long-term contracts, 30-day out any time, and we build on the
              preview you&apos;re already looking at.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid gap-4 bg-slate-50 p-5 sm:p-8 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => {
            const popular = tier.badge === "Most Popular";
            return (
              <div
                key={tier.key}
                className={`relative flex flex-col rounded-2xl border p-5 transition sm:p-6 ${
                  popular
                    ? "border-indigo-500 bg-white shadow-[0_24px_60px_-30px_rgba(79,70,229,0.45)] ring-1 ring-indigo-500/40"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-indigo-500/40">
                    {tier.badge}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span aria-hidden>{tier.emoji}</span>
                  <span>{tier.name}</span>
                </div>
                <p className="mt-2 text-[13px] leading-snug text-slate-600">
                  {tier.tagline}
                </p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    {formatMonthly(tier)}
                  </span>
                  {tier.monthly != null && (
                    <span className="text-sm font-semibold text-slate-500">
                      /mo
                    </span>
                  )}
                </div>
                {formatSetup(tier) ? (
                  <div className="mt-1 text-xs text-slate-500">
                    {formatSetup(tier)} one-time setup
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-slate-500">
                    Scoped to your business
                  </div>
                )}

                <ul className="mt-5 space-y-2.5 text-[13px] leading-snug text-slate-700">
                  {tier.inheritsFrom && (
                    <li className="flex items-start gap-2 font-semibold text-slate-900">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      Everything in {tier.inheritsFrom}
                    </li>
                  )}
                  {tier.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {tier.features.length > 5 && (
                    <li className="pl-6 text-[11px] text-slate-500">
                      + {tier.features.length - 5} more included
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => selectPlan(tier)}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    popular
                      ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/30 hover:brightness-110"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  {tier.ctaLabel}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust bar */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              30-day out any time
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              No long-term contract
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              You own your domain & content
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            Keep exploring the preview →
          </button>
        </div>
      </div>
    </div>
  );
}
