"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import { SendDraftButton } from "./send-button";

export function DraftPreview({
  draft,
  siteUrl,
  views,
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
  views: { count: number; lastAt: string } | null;
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

      {siteUrl && (
        <div className="mt-5 overflow-hidden rounded-lg border border-emerald-900/60 bg-gradient-to-br from-emerald-950/50 to-slate-950">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-emerald-600/20 text-emerald-300">
                <Globe className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                  Public mockup URL
                </div>
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate font-mono text-[12px] text-emerald-100 underline-offset-2 hover:underline"
                >
                  {siteUrl}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyUrlButton url={siteUrl} />
              <a
                href={siteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View site
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-emerald-900/60 bg-black/20 px-4 py-2 text-[11px] text-emerald-300/80">
            <span>Auto-appended as a P.S. when you send this email.</span>
            {views && views.count > 0 ? (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-200"
                title={`Last opened ${new Date(views.lastAt).toLocaleString()}`}
              >
                <Eye className="h-3 w-3" />
                {views.count} {views.count === 1 ? "open" : "opens"}
              </span>
            ) : draft.status === "sent" ? (
              <span className="inline-flex items-center gap-1 text-emerald-300/60">
                <Eye className="h-3 w-3" />
                No opens yet
              </span>
            ) : null}
          </div>
        </div>
      )}

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

function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 rounded-md border border-emerald-900/60 bg-emerald-950/30 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-900/40"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
