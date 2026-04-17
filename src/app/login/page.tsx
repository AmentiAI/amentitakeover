import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in · Signull",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]">
          <div className="mb-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-400">
              Signull · Admin
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-white">Sign in</h1>
            <p className="mt-1 text-sm text-slate-400">
              Enter the admin password to continue.
            </p>
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
