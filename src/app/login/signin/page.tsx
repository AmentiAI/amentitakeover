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

      <div className="relative w-full max-w-2xl">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="relative">
          <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-fuchsia-500/50 via-purple-500/40 to-indigo-500/50 opacity-80 blur-[3px]" />
          <div className="relative rounded-3xl border border-white/10 bg-[#120c28]/85 p-7 shadow-[0_50px_120px_-40px_rgba(139,92,246,0.7)] backdrop-blur-xl sm:p-10">
            <div className="mb-7 flex items-center gap-3 sm:mb-8">
              <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 p-1.5 shadow-[0_0_40px_-5px_rgba(217,70,239,0.65)] sm:h-14 sm:w-14">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/amenti-logo.png"
                  alt="Amenti AI logo"
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-fuchsia-300 sm:text-xs">
                  Amenti AI
                </div>
                <h2 className="mt-0.5 text-2xl font-semibold text-white sm:text-3xl">
                  Sign in or apply
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Access your dashboard or join the affiliate program.
                </p>
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
