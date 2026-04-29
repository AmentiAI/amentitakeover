"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2, Wand2 } from "lucide-react";
import {
  DEFAULT_CAMPAIGN_BODY,
  DEMO_URL_TOKEN,
  defaultCampaignSubject,
} from "@/lib/default-campaign";

type Campaign = {
  id: string;
  name: string;
  status: string;
  subject: string | null;
  body: string | null;
  sent: number;
  opened: number;
  replied: number;
};

const STATUSES = ["draft", "active", "paused", "archived"] as const;

export function CampaignEditForm({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [name, setName] = useState(campaign.name);
  const [status, setStatus] = useState(campaign.status);
  const [subject, setSubject] = useState(campaign.subject ?? "");
  const [body, setBody] = useState(campaign.body ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasInlineToken = body.includes(DEMO_URL_TOKEN);
  const dirty =
    name !== campaign.name ||
    status !== campaign.status ||
    subject !== (campaign.subject ?? "") ||
    body !== (campaign.body ?? "");

  function applyDefault() {
    setSubject(defaultCampaignSubject(null));
    setBody(DEFAULT_CAMPAIGN_BODY);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Untitled campaign",
          status,
          subject: subject.trim() ? subject : null,
          body: body.trim() ? body : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(typeof d.error === "string" ? d.error : "Failed to save");
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${campaign.name}"? This can't be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/campaigns/${campaign.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(typeof d.error === "string" ? d.error : "Failed to delete");
        return;
      }
      router.replace("/outreach/email-campaigns");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Edit campaign</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {campaign.sent} sent · {campaign.opened} opened · {campaign.replied} replied
          </p>
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          className="inline-flex items-center gap-1 rounded-md border border-rose-900 bg-rose-950/40 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 hover:border-rose-700 hover:text-rose-200 disabled:opacity-60"
        >
          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          Delete
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-100"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Status
        </label>
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                status === s
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Email copy
          </label>
          <button
            type="button"
            onClick={applyDefault}
            className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:border-indigo-600 hover:text-indigo-300"
          >
            <Wand2 className="h-3 w-3" />
            Use default copy
          </button>
        </div>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-100"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Write your email…\n\nDrop ${DEMO_URL_TOKEN} anywhere to inline the tracked mockup link, or leave it out and it'll be appended as a P.S. when sent.`}
          rows={12}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500"
        />
        <div className="rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-2 text-[11px] leading-snug text-slate-400">
          {hasInlineToken ? (
            <>
              <code className="rounded bg-slate-800 px-1 py-px text-[10px] text-indigo-300">{DEMO_URL_TOKEN}</code>{" "}
              gets replaced inline with each recipient's tracked mockup URL when sending.
            </>
          ) : (
            <>No <code className="rounded bg-slate-800 px-1 py-px text-[10px] text-slate-300">{DEMO_URL_TOKEN}</code> in body — the mockup link will be auto-appended as a P.S. block at send time.</>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-800 bg-rose-950/40 px-2.5 py-1.5 text-[11px] text-rose-300">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
        {savedAt && !dirty && (
          <span className="text-[11px] text-slate-500">Saved.</span>
        )}
      </div>
    </form>
  );
}
