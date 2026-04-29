"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

export function NewCampaignButton() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function create() {
    setCreating(true);
    try {
      const res = await fetch("/api/outreach/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled campaign", useDefaultCopy: true }),
      });
      if (!res.ok) {
        setCreating(false);
        return;
      }
      const c = (await res.json()) as { id: string };
      router.push(`/outreach/email-campaigns/${c.id}`);
    } catch {
      setCreating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={create}
      disabled={creating}
      className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
    >
      {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
      New campaign
    </button>
  );
}
