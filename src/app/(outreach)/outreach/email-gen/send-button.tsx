"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";

export function SendDraftButton({
  draftId,
  to,
  initialStatus,
}: {
  draftId: string;
  to: string | null;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!to) {
      setError("No recipient email on file for this business.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/email-gen/${draftId}/send`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Send failed");
        setStatus("failed");
      } else {
        setStatus("sent");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  }

  if (status === "sent") {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-emerald-800 bg-emerald-950/50 px-3 py-2 text-xs font-medium text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Sent
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={send}
        disabled={loading || !to}
        className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        {loading ? "Sending" : status === "failed" ? "Retry send" : "Send via Resend"}
      </button>
      {!to ? (
        <div className="flex items-center gap-1 text-[11px] text-amber-400">
          <AlertCircle className="h-3 w-3" />
          No recipient email
        </div>
      ) : null}
      {error ? (
        <div className="flex max-w-xs items-start gap-1 text-right text-[11px] text-rose-400">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          {error}
        </div>
      ) : null}
    </div>
  );
}
