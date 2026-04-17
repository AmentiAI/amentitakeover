"use client";

import { useState } from "react";
import { ChevronRight, Rocket, Wallet, HelpCircle } from "lucide-react";

type TabKey = "how" | "earn" | "faq";

const TABS: { key: TabKey; label: string; icon: typeof Rocket }[] = [
  { key: "how", label: "How it works", icon: Rocket },
  { key: "earn", label: "What you earn", icon: Wallet },
  { key: "faq", label: "FAQ", icon: HelpCircle },
];

export function ProgramInfo() {
  const [tab, setTab] = useState<TabKey>("how");

  return (
    <div className="mt-14 w-full max-w-4xl">
      <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl sm:gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition sm:px-5 sm:text-sm ${
                active
                  ? "bg-gradient-to-r from-cyan-400 to-pink-500 text-slate-950 shadow-[0_0_25px_rgba(236,72,153,0.35)]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left shadow-[0_0_45px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:p-8">
        {tab === "how" && <HowItWorks />}
        {tab === "earn" && <WhatYouEarn />}
        {tab === "faq" && <Faq />}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Apply in minutes",
      body: "Tell us a bit about yourself. We review applications within 48 hours and get you set up with a dashboard.",
    },
    {
      n: "02",
      title: "Share your link",
      body: "Send prospects your personal affiliate URL — or drop leads directly into the portal. Every signup is attributed to you.",
    },
    {
      n: "03",
      title: "Get paid monthly",
      body: "Commissions accrue in real time. Payouts go out on the 1st of each month once you hit the minimum threshold.",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {steps.map((s) => (
        <div
          key={s.n}
          className="rounded-2xl border border-white/5 bg-black/20 p-4 sm:p-5"
        >
          <div className="bg-gradient-to-r from-cyan-300 to-pink-400 bg-clip-text text-xs font-black tracking-[0.3em] text-transparent">
            {s.n}
          </div>
          <div className="mt-2 text-base font-semibold text-white sm:text-lg">
            {s.title}
          </div>
          <p className="mt-1.5 text-sm text-white/65">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

function WhatYouEarn() {
  const tiers = [
    {
      name: "Starter",
      rate: "20%",
      desc: "Flat commission on every referred subscription for the first 12 months.",
      highlight: false,
    },
    {
      name: "Pro",
      rate: "30%",
      desc: "Unlocked after your 5th closed deal. Higher rate on every new and renewed referral.",
      highlight: true,
    },
    {
      name: "Partner",
      rate: "40%",
      desc: "For top affiliates: recurring revenue share, co-branded materials, and dedicated support.",
      highlight: false,
    },
  ];
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-2xl border p-4 sm:p-5 ${
              t.highlight
                ? "border-transparent bg-gradient-to-br from-cyan-400/15 to-pink-500/15 shadow-[0_0_30px_rgba(236,72,153,0.18)] ring-1 ring-cyan-300/30"
                : "border-white/5 bg-black/20"
            }`}
          >
            {t.highlight && (
              <span className="absolute -top-2 right-4 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-950">
                Popular
              </span>
            )}
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
              {t.name}
            </div>
            <div className="mt-2 bg-gradient-to-r from-cyan-300 to-pink-400 bg-clip-text text-4xl font-black text-transparent">
              {t.rate}
            </div>
            <p className="mt-2 text-sm text-white/65">{t.desc}</p>
          </div>
        ))}
      </div>
      <ul className="mt-5 space-y-1.5 text-sm text-white/70">
        {[
          "Real-time commission tracking in your dashboard",
          "Monthly payouts via Stripe or PayPal ($50 minimum)",
          "Lifetime cookie — credit follows the referral, not the session",
        ].map((line) => (
          <li key={line} className="flex items-start gap-2">
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Faq() {
  const items = [
    {
      q: "Who can apply?",
      a: "Creators, agencies, consultants, and anyone whose audience overlaps with business owners, founders, or marketers. No follower minimum.",
    },
    {
      q: "How do I track referrals?",
      a: "Your dashboard shows clicks, signups, conversions, and pending payouts in real time. Every lead can also be added manually with attribution.",
    },
    {
      q: "When do I get paid?",
      a: "On the 1st of each month, for the prior month's conversions, once you've reached the $50 minimum. Stripe and PayPal supported.",
    },
    {
      q: "What support is included?",
      a: "Email + chat support, onboarding calls for Partner-tier affiliates, and a private resource library with creative assets and case studies.",
    },
  ];
  return (
    <div className="divide-y divide-white/5">
      {items.map((it) => (
        <details
          key={it.q}
          className="group py-3 first:pt-0 last:pb-0 sm:py-4"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-white transition hover:text-cyan-300 sm:text-base">
            <span>{it.q}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-white/50 transition group-open:rotate-90" />
          </summary>
          <p className="mt-2 text-sm text-white/70">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
