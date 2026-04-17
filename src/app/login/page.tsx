import { Suspense } from "react";
import { Brain } from "lucide-react";
import { LoginTabs } from "./login-tabs";

export const metadata = {
  title: "Amenti AI · Affiliate Program",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#07031a] text-slate-100">
      <section className="relative flex min-h-screen w-full items-end justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/splash-bg.png')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#07031a]/0 via-[#07031a]/0 to-[#07031a]"
          aria-hidden
        />

        <div className="relative z-10 mb-[10vh] flex flex-col items-center px-4 sm:mb-[14vh]">
          <a
            href="#apply"
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_25px_70px_-15px_rgba(217,70,239,0.85)] transition hover:brightness-110 active:scale-[0.98] sm:px-10 sm:py-4 sm:text-base"
          >
            <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
            Become an Affiliate
            <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/25" />
          </a>
          <p className="mt-4 text-center text-[11px] uppercase tracking-[0.28em] text-white/70 sm:text-xs">
            Scroll to sign in or apply
          </p>
        </div>
      </section>

      <section id="apply" className="relative px-4 py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[-10%] top-[10%] h-[420px] w-[420px] rounded-full bg-fuchsia-600/20 blur-[140px]" />
          <div className="absolute right-[-10%] bottom-[10%] h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[140px]" />
        </div>
        <div className="mx-auto flex max-w-md justify-center">
          <SignInCard />
        </div>
      </section>
    </div>
  );
}

function SignInCard() {
  return (
    <div className="relative w-full">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-fuchsia-500/40 via-purple-500/30 to-indigo-500/40 opacity-70 blur-[2px]" />
      <div className="relative rounded-2xl border border-white/10 bg-[#120c28]/85 p-6 shadow-[0_40px_100px_-40px_rgba(139,92,246,0.6)] backdrop-blur-xl sm:p-7">
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
