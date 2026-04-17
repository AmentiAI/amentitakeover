import { Brain } from "lucide-react";

export const metadata = {
  title: "Amenti AI · Affiliate Program",
  description: "Earn commissions by sharing the future of AI.",
  openGraph: {
    title: "Join the Amenti AI Affiliate Program",
    description: "Earn commissions by sharing the future of AI.",
    images: [
      {
        url: "/splash-bg.png",
        width: 1536,
        height: 1024,
        alt: "Amenti AI Affiliate Program",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the Amenti AI Affiliate Program",
    description: "Earn commissions by sharing the future of AI.",
    images: ["/splash-bg.png"],
  },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#07031a] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-15%] top-[-15%] h-[560px] w-[560px] rounded-full bg-fuchsia-600/25 blur-[160px]" />
        <div className="absolute right-[-15%] top-[10%] h-[520px] w-[520px] rounded-full bg-indigo-600/25 blur-[160px]" />
        <div className="absolute left-[20%] bottom-[-20%] h-[480px] w-[720px] rounded-full bg-purple-600/15 blur-[160px]" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-4 py-6 sm:gap-6 sm:py-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/splash-bg.png"
          alt="Amenti AI Affiliate Program"
          className="max-h-[calc(100vh-140px)] w-auto max-w-full object-contain drop-shadow-[0_30px_80px_rgba(139,92,246,0.35)]"
        />

        <a
          href="/login/signin"
          className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_25px_70px_-15px_rgba(217,70,239,0.85)] transition hover:brightness-110 active:scale-[0.98] sm:px-10 sm:py-4 sm:text-base"
        >
          <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
          Become an Affiliate
          <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/25" />
        </a>
      </div>
    </div>
  );
}
