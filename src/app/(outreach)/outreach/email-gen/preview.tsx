"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { SendDraftButton } from "./send-button";

export function DraftPreview({
  draft,
  siteUrl,
}: {
  draft: {
    id: string;
    subject: string;
    body: string;
    status: string;
    tone: string | null;
    model: string | null;
    sentAt: string | null;
    scrapedBusiness: {
      id: string;
      name: string;
      email: string | null;
    } | null;
  };
  siteUrl: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSent = draft.status === "sent";

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/email-gen/${draft.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Save failed");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setSubject(draft.subject);
    setBody(draft.body);
    setEditing(false);
    setError(null);
  }

  return (
    <article className="mx-auto max-w-2xl rounded-lg border border-slate-800 bg-slate-950 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider text-slate-500">
            Preview · {draft.status}
          </div>
          {editing ? (
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-lg font-semibold text-white outline-none focus:border-indigo-500"
            />
          ) : (
            <h2 className="mt-1 text-lg font-semibold text-white">{draft.subject}</h2>
          )}
          <div className="mt-1 text-[11px] text-slate-500">
            To:{" "}
            {draft.scrapedBusiness?.email ?? (
              <span className="text-amber-400">no email on file</span>
            )}
            {draft.scrapedBusiness?.name ? (
              <span className="text-slate-600"> · {draft.scrapedBusiness.name}</span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isSent && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          {editing && (
            <>
              <button
                onClick={cancel}
                className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {saving ? "Saving" : "Save"}
              </button>
            </>
          )}
          {!editing && (
            <SendDraftButton
              draftId={draft.id}
              to={draft.scrapedBusiness?.email ?? null}
              initialStatus={draft.status}
            />
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          className="mt-5 w-full rounded-md border border-slate-700 bg-slate-900 p-4 text-sm leading-relaxed text-slate-100 outline-none focus:border-indigo-500"
        />
      ) : (
        <div className="mt-5 whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-900/40 p-4 text-sm leading-relaxed text-slate-300">
          {draft.body}
        </div>
      )}

      {siteUrl && (
        <div className="mt-4 rounded-md border border-emerald-900/60 bg-emerald-950/30 p-3 text-[12px] leading-snug text-emerald-200">
          <div className="flex items-center gap-1.5 font-semibold">
            <Globe className="h-3.5 w-3.5" />
            Auto-appends on send
          </div>
          <p className="mt-1 text-emerald-300/80">
            The mockup we built for {draft.scrapedBusiness?.name ?? "this business"} will be
            attached as a P.S. with a live preview link.
          </p>
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-emerald-300 underline-offset-2 hover:underline"
          >
            {siteUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-rose-800 bg-rose-950/40 px-3 py-2 text-[12px] text-rose-300">
          {error}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Tone: {draft.tone ?? "default"} · Model: {draft.model ?? "—"}
        </span>
        {draft.sentAt && (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Sent {new Date(draft.sentAt).toLocaleString()}
          </span>
        )}
      </div>
    </article>
  );
}
