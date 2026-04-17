import { Suspense } from "react";
import {
  Brain,
  DollarSign,
  Sparkles,
  Activity,
  LifeBuoy,
  Globe2,
  TrendingUp,
  Zap,
  Lock,
} from "lucide-react";
import { LoginTabs } from "./login-tabs";

export const metadata = {
  title: "Amenti AI · Affiliate Program",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07031a] text-slate-100">
      <Backdrop />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <BrandMark />

        <section className="mt-8 flex flex-col items-center text-center sm:mt-10">
          <h1 className="text-[clamp(2rem,6vw,4rem)] font-bold leading-[1.02] tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              Join the Amenti AI
            </span>
            <br />
            <span className="text-white">Affiliate Program</span>
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-slate-300 sm:text-[15px]">
            Earn commissions by sharing the future of AI
          </p>

          <FeaturePills />

          <CenterVisual />

          <div className="mt-8">
            <a
              href="#apply"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_25px_70px_-15px_rgba(217,70,239,0.75)] transition hover:brightness-110"
            >
              <Brain className="h-4 w-4" />
              Become an Affiliate
              <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/25" />
            </a>
          </div>

          <TrustStrip />
        </section>

        <section id="apply" className="mt-20 flex justify-center">
          <SignInCard />
        </section>
      </div>
    </div>
  );
}

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-15%] top-[-15%] h-[620px] w-[620px] rounded-full bg-fuchsia-600/30 blur-[150px]" />
      <div className="absolute right-[-15%] top-[5%] h-[560px] w-[560px] rounded-full bg-indigo-600/30 blur-[150px]" />
      <div className="absolute left-1/2 top-[35%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[160px]" />
      <div className="absolute left-[-5%] bottom-[-10%] h-[480px] w-[720px] rounded-full bg-fuchsia-500/15 blur-[150px]" />
      <div className="absolute right-[-5%] bottom-[-5%] h-[420px] w-[620px] rounded-full bg-cyan-500/10 blur-[140px]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #a78bfa 1px, transparent 1px), linear-gradient(to bottom, #a78bfa 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 35%, transparent 78%)",
        }}
      />
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-[0_0_35px_-4px_rgba(217,70,239,0.65)]">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 L21 20 L3 20 Z" />
          <path d="M12 9 L16 17 L8 17 Z" opacity="0.7" />
        </svg>
      </span>
      <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-white/90 sm:text-[13px]">
        Amenti AI
      </span>
    </div>
  );
}

function FeaturePills() {
  const items = [
    {
      icon: <DollarSign className="h-3.5 w-3.5" />,
      title: "Commissions",
      body: "Earn on referrals",
      tint: "from-amber-400/40 to-fuchsia-500/40",
      ring: "ring-fuchsia-400/30",
    },
    {
      icon: <Sparkles className="h-3.5 w-3.5" />,
      title: "AI Tools",
      body: "Cutting-edge tech",
      tint: "from-fuchsia-400/40 to-purple-500/40",
      ring: "ring-purple-400/30",
    },
    {
      icon: <Activity className="h-3.5 w-3.5" />,
      title: "Real-Time Tracking",
      body: "Track your stats",
      tint: "from-purple-400/40 to-indigo-500/40",
      ring: "ring-indigo-400/30",
    },
    {
      icon: <LifeBuoy className="h-3.5 w-3.5" />,
      title: "Support",
      body: "Get dedicated help",
      tint: "from-indigo-400/40 to-cyan-500/40",
      ring: "ring-cyan-400/30",
    },
  ];
  return (
    <div className="mt-7 grid w-full max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {items.map((it) => (
        <div
          key={it.title}
          className={`group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-left ring-1 ${it.ring} ring-inset backdrop-blur-sm transition hover:bg-white/[0.07]`}
        >
          <div
            className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${it.tint} blur-2xl`}
          />
          <div className="relative flex items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/10 text-white">
              {it.icon}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[11.5px] font-semibold text-white">
                {it.title}
              </div>
              <div className="truncate text-[10px] text-slate-400">{it.body}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CenterVisual() {
  return (
    <div className="relative mt-10 flex h-[260px] w-full items-end justify-center sm:h-[320px] md:h-[380px]">
      {/* radiant halo */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-fuchsia-500/50 via-purple-500/35 to-indigo-600/40 blur-[90px] sm:h-[460px] sm:w-[460px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-400/25 blur-[60px] sm:h-[280px] sm:w-[280px]" />

      {/* light rays */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "conic-gradient(from 210deg at 50% 65%, transparent 0deg, rgba(217,70,239,0.12) 40deg, transparent 80deg, rgba(139,92,246,0.12) 140deg, transparent 180deg, rgba(34,211,238,0.1) 240deg, transparent 280deg, rgba(217,70,239,0.12) 340deg, transparent 360deg)",
          maskImage:
            "radial-gradient(ellipse 75% 55% at 50% 70%, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 55% at 50% 70%, black 0%, transparent 75%)",
        }}
      />

      {/* floor reflection */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-fuchsia-500/20 via-purple-500/10 to-transparent blur-2xl" />

      {/* orbit rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:h-[340px] sm:w-[340px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:h-[230px] sm:w-[230px]" />

      {/* sparkle dots */}
      <Sparkle className="left-[18%] top-[30%]" />
      <Sparkle className="right-[22%] top-[22%]" size="lg" />
      <Sparkle className="right-[14%] top-[48%]" />
      <Sparkle className="left-[12%] top-[55%]" size="lg" />
      <Sparkle className="left-[30%] top-[72%]" />
      <Sparkle className="right-[28%] top-[68%]" />

      {/* central logo */}
      <div className="relative z-10 grid h-[150px] w-[150px] place-items-center rounded-3xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 shadow-[0_0_120px_-10px_rgba(217,70,239,0.9),0_0_60px_-10px_rgba(139,92,246,0.7)] ring-1 ring-white/25 sm:h-[190px] sm:w-[190px]">
        <div className="absolute inset-1 rounded-2xl bg-[#0b0720]/40 backdrop-blur-sm" />
        <svg
          viewBox="0 0 48 48"
          className="relative h-20 w-20 text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.6)] sm:h-28 sm:w-28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M24 6 C16 6 12 12 12 18 C12 22 13 24 13 26 C13 28 12 30 12 32 C12 36 15 40 20 40 C22 40 23 39 24 38 C25 39 26 40 28 40 C33 40 36 36 36 32 C36 30 35 28 35 26 C35 24 36 22 36 18 C36 12 32 6 24 6 Z"
            fill="rgba(255,255,255,0.08)"
          />
          <path d="M24 10 L24 40" opacity="0.55" />
          <path d="M17 15 C19 17 19 21 17 23" opacity="0.55" />
          <path d="M31 15 C29 17 29 21 31 23" opacity="0.55" />
          <path d="M18 28 C20 30 22 30 24 29" opacity="0.55" />
          <path d="M30 28 C28 30 26 30 24 29" opacity="0.55" />
          <circle cx="17" cy="18" r="1.3" fill="currentColor" opacity="0.9" />
          <circle cx="31" cy="18" r="1.3" fill="currentColor" opacity="0.9" />
          <circle cx="24" cy="24" r="1.4" fill="currentColor" />
          <circle cx="19" cy="33" r="1.1" fill="currentColor" opacity="0.8" />
          <circle cx="29" cy="33" r="1.1" fill="currentColor" opacity="0.8" />
        </svg>
      </div>

      {/* platform bar */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[14px] w-[70%] max-w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent blur-[2px]" />
      <div className="pointer-events-none absolute bottom-[6px] left-1/2 h-[3px] w-[60%] max-w-[460px] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

function Sparkle({
  className,
  size = "md",
}: {
  className?: string;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "h-1.5 w-1.5" : "h-1 w-1";
  return (
    <span
      className={`pointer-events-none absolute ${dim} rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.9)] ${className ?? ""}`}
    />
  );
}

function TrustStrip() {
  const items = [
    { icon: <Globe2 className="h-3.5 w-3.5" />, label: "Global Reach" },
    { icon: <TrendingUp className="h-3.5 w-3.5" />, label: "Passive Income" },
    { icon: <Zap className="h-3.5 w-3.5" />, label: "Fast Payouts" },
    { icon: <Lock className="h-3.5 w-3.5" />, label: "Secure" },
  ];
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[11.5px] text-slate-300 backdrop-blur-sm">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="text-fuchsia-300">{i.icon}</span>
          {i.label}
        </span>
      ))}
    </div>
  );
}

function SignInCard() {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-fuchsia-500/40 via-purple-500/30 to-indigo-500/40 opacity-70 blur-[2px]" />
      <div className="relative rounded-2xl border border-white/10 bg-[#120c28]/80 p-6 shadow-[0_40px_100px_-40px_rgba(139,92,246,0.6)] backdrop-blur-xl sm:p-7">
        <div className="mb-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-fuchsia-300">
            Account access
          </div>
          <h2 className="mt-1.5 text-xl font-semibold text-white">
            Sign in or apply
          </h2>
        </div>
        <Suspense fallback={null}>
          <LoginTabs />
        </Suspense>
      </div>
    </div>
  );
}
