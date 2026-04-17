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
    <div className="relative min-h-screen overflow-hidden bg-[#0b0720] text-slate-100">
      {/* Glow backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[560px] w-[560px] rounded-full bg-fuchsia-600/25 blur-[140px]" />
        <div className="absolute right-[-10%] top-[20%] h-[520px] w-[520px] rounded-full bg-indigo-600/25 blur-[140px]" />
        <div className="absolute left-[20%] bottom-[-20%] h-[520px] w-[520px] rounded-full bg-cyan-500/15 blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #a78bfa 1px, transparent 1px), linear-gradient(to bottom, #a78bfa 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pb-16 sm:pt-12">
        <BrandMark />

        <div className="mt-10 grid gap-10 lg:mt-16 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <Hero />
          <SignInCard />
        </div>

        <TrustStrip />
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-[0_0_30px_-5px_rgba(217,70,239,0.55)]">
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
      <span className="text-[13px] font-semibold uppercase tracking-[0.32em] text-white/90">
        Amenti AI
      </span>
    </div>
  );
}

function Hero() {
  return (
    <div className="text-center lg:text-left">
      <h1 className="text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-tight">
        <span className="bg-gradient-to-r from-fuchsia-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
          Join the Amenti AI
        </span>
        <br />
        <span className="text-white">Affiliate Program</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300 lg:mx-0">
        Earn commissions by sharing the future of AI. Get paid for every business
        you refer — real-time tracking, fast payouts, dedicated support.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <FeatureCard
          icon={<DollarSign className="h-4 w-4" />}
          title="Commissions"
          body="Earn on referrals"
          from="from-amber-400/30"
          to="to-fuchsia-500/30"
        />
        <FeatureCard
          icon={<Sparkles className="h-4 w-4" />}
          title="AI Tools"
          body="Cutting-edge tech"
          from="from-fuchsia-400/30"
          to="to-purple-500/30"
        />
        <FeatureCard
          icon={<Activity className="h-4 w-4" />}
          title="Real-Time Tracking"
          body="Track your stats"
          from="from-purple-400/30"
          to="to-indigo-500/30"
        />
        <FeatureCard
          icon={<LifeBuoy className="h-4 w-4" />}
          title="Support"
          body="Get dedicated help"
          from="from-indigo-400/30"
          to="to-cyan-500/30"
        />
      </div>

      <div className="mt-8 flex justify-center lg:justify-start">
        <a
          href="#apply"
          className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_20px_60px_-15px_rgba(217,70,239,0.7)] transition hover:brightness-110"
        >
          <Brain className="h-4 w-4" />
          Become an Affiliate
          <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
        </a>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  from,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  from: string;
  to: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition hover:border-white/20`}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${from} ${to} blur-2xl`}
      />
      <div className="relative">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-white/10 text-white">
          {icon}
        </span>
        <div className="mt-2 text-[13px] font-semibold text-white">{title}</div>
        <div className="text-[11px] text-slate-400">{body}</div>
      </div>
    </div>
  );
}

function SignInCard() {
  return (
    <div id="apply" className="relative mx-auto w-full max-w-md">
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

function TrustStrip() {
  const items = [
    { icon: <Globe2 className="h-3.5 w-3.5" />, label: "Global Reach" },
    { icon: <TrendingUp className="h-3.5 w-3.5" />, label: "Passive Income" },
    { icon: <Zap className="h-3.5 w-3.5" />, label: "Fast Payouts" },
    { icon: <Lock className="h-3.5 w-3.5" />, label: "Secure" },
  ];
  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs text-slate-300 backdrop-blur-sm sm:mx-auto sm:w-fit">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="text-fuchsia-300">{i.icon}</span>
          {i.label}
        </span>
      ))}
    </div>
  );
}
