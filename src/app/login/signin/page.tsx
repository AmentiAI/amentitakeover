import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginTabs } from "../login-tabs";

export const metadata = {
  title: "Amenti AI · Sign in",
};

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07031a] px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-fuchsia-600/25 blur-[150px]" />
        <div className="absolute right-[-10%] top-[10%] h-[520px] w-[520px] rounded-full bg-indigo-600/25 blur-[150px]" />
        <div className="absolute left-[20%] bottom-[-15%] h-[460px] w-[720px] rounded-full bg-purple-600/15 blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #a78bfa 1px, transparent 1px), linear-gradient(to bottom, #a78bfa 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/login"
          className="mb-5 inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="relative">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-fuchsia-500/40 via-purple-500/30 to-indigo-500/40 opacity-70 blur-[2px]" />
          <div className="relative rounded-2xl border border-white/10 bg-[#120c28]/85 p-6 shadow-[0_40px_100px_-40px_rgba(139,92,246,0.6)] backdrop-blur-xl sm:p-7">
            <div className="mb-5 flex items-center gap-2.5">
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
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-fuchsia-300">
                  Amenti AI
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Sign in or apply
                </h2>
              </div>
            </div>
            <Suspense fallback={null}>
              <LoginTabs />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
