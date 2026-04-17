"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wand2 } from "lucide-react";

export function NewSiteForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sites/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.toString() ?? "Scrape failed");
      router.push(`/sites/${j.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        type="url"
        required
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example-hvac.com"
        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        {loading ? "Scraping…" : "Scrape site"}
      </button>
      {error && <div className="text-xs text-rose-600">{error}</div>}
    </form>
  );
}
