import { ProgramInfo } from "./program-info";

export const metadata = {
  title: "Amenti AI · Affiliate Program",
  description: "Earn commissions by sharing the future of AI.",
  openGraph: {
    title: "Join the Amenti AI Affiliate Program",
    description: "Earn commissions by sharing the future of AI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the Amenti AI Affiliate Program",
    description: "Earn commissions by sharing the future of AI.",
  },
};

export default function LoginPage() {
  const features = [
    { title: "Commissions", subtitle: "Earn on referrals", icon: "$" },
    { title: "AI Tools", subtitle: "Cutting-edge tech", icon: "🚀" },
    { title: "Real-Time Tracking", subtitle: "Track your stats", icon: "📊" },
    { title: "Support", subtitle: "Get dedicated help", icon: "🎧" },
  ];

  const footerItems = ["Global Reach", "Passive Income", "Fast Payouts", "Secure"];

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="relative isolate min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,32,90,0.7),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,60,172,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(0,245,255,0.18),transparent_25%),linear-gradient(180deg,#040716_0%,#070b25_45%,#050816_100%)]" />

        <div className="absolute inset-0 opacity-80">
          <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute inset-0 h-full w-full opacity-40"
            viewBox="0 0 1440 1024"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0 840C160 690 320 690 480 840C640 990 800 990 960 840C1120 690 1280 690 1440 840"
              stroke="url(#line1)"
              strokeWidth="2"
            />
            <path
              d="M0 900C200 760 400 760 600 900C800 1040 1000 1040 1200 900C1320 820 1380 800 1440 820"
              stroke="url(#line2)"
              strokeWidth="2"
            />
            <path
              d="M0 150C180 90 360 110 540 150C720 190 900 180 1080 110C1260 40 1360 30 1440 80"
              stroke="url(#line3)"
              strokeWidth="1.5"
            />
            <defs>
              <linearGradient id="line1" x1="0" y1="0" x2="1440" y2="0">
                <stop stopColor="#FF3CAC" stopOpacity="0.9" />
                <stop offset="0.5" stopColor="#8B5CF6" stopOpacity="0.8" />
                <stop offset="1" stopColor="#00F5FF" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="line2" x1="0" y1="0" x2="1440" y2="0">
                <stop stopColor="#00F5FF" stopOpacity="0.9" />
                <stop offset="0.5" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="1" stopColor="#FF3CAC" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="line3" x1="0" y1="0" x2="1440" y2="0">
                <stop stopColor="#0EA5E9" stopOpacity="0.2" />
                <stop offset="0.5" stopColor="#8B5CF6" stopOpacity="0.5" />
                <stop offset="1" stopColor="#FF3CAC" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-end px-6 pt-6 sm:px-8 lg:px-12">
          <a
            href="https://amentiai.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
          >
            Visit Amentiai.com
            <span aria-hidden>→</span>
          </a>
        </div>

        <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12 text-center sm:px-8 lg:px-12">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-[0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-pink-500/20 p-2 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/amenti-logo.png"
                alt="Amenti AI logo"
                className="h-full w-full rounded-md object-contain"
              />
            </div>
            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                Amenti AI
              </p>
              <p className="bg-gradient-to-r from-cyan-300 to-pink-400 bg-clip-text text-lg font-semibold text-transparent">
                Affiliate Program
              </p>
            </div>
          </div>

          <div className="max-w-4xl">
            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Join the{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
                Amenti AI
              </span>
              <br />
              Affiliate Program
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80 sm:text-xl">
              Earn commissions by sharing the future of AI with creators, founders,
              and businesses ready for cutting-edge tools.
            </p>
          </div>

          <div className="mt-10 hidden w-full max-w-5xl gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/10 hover:shadow-[0_0_35px_rgba(34,211,238,0.18)]"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/15 to-pink-500/15 text-2xl shadow-[0_0_25px_rgba(236,72,153,0.18)]">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-white/70">{feature.subtitle}</p>
              </div>
            ))}
          </div>

          <ProgramInfo />

          <div className="mt-12 flex flex-col items-center gap-5">
            <a
              href="/login/signin"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 px-8 py-4 text-lg font-bold text-slate-950 shadow-[0_0_35px_rgba(255,60,172,0.35)] transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(34,211,238,0.35)] sm:px-12 sm:text-2xl"
            >
              Become an Affiliate
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/75 shadow-[0_0_25px_rgba(255,255,255,0.04)] backdrop-blur-xl sm:text-base">
              {footerItems.map((item) => (
                <span key={item} className="whitespace-nowrap">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
