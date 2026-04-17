"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

export function AffiliateLoginForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliate/login-by-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.slug) {
        setError(data.error || "Invalid passcode");
        return;
      }
      router.replace(`/a/${data.slug}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Passcode
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-mono uppercase tracking-wider text-white outline-none transition focus:border-indigo-500"
          placeholder="XXXXXXXX"
        />
      </div>
      {error && (
        <div className="rounded-md border border-rose-800 bg-rose-950/40 px-3 py-2 text-[12px] text-rose-300">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {loading ? "Signing in" : "Continue"}
      </button>
    </form>
  );
}
