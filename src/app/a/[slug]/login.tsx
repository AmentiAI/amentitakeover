"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AffiliateLogin({
  slug,
  prefilledCode,
}: {
  slug: string;
  prefilledCode: string | null;
}) {
  const router = useRouter();
  const [code, setCode] = useState(prefilledCode ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const res = await fetch("/api/affiliate/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, code: code.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr("Invalid passcode");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6"
      >
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500">
            Affiliate Portal
          </div>
          <h1 className="mt-1 text-xl font-semibold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-400">
            Enter the passcode shared with you to access opportunities.
          </p>
        </div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Passcode"
          autoFocus
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-3 text-base text-white outline-none focus:border-slate-500 sm:py-2 sm:text-sm"
        />
        {err && <div className="text-xs text-red-400">{err}</div>}
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="w-full rounded-md bg-white px-3 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50 sm:py-2"
        >
          {busy ? "Signing in..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
