"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PenLine, Sparkles, LayoutTemplate } from "lucide-react";
import { TEMPLATE_CHOICES, type TemplateChoice } from "@/lib/site-url";

type Candidate = {
  id: string;
  name: string;
  email: string | null;
  templateChoice: TemplateChoice;
};

export function EmailGenForm({ candidates }: { candidates: Candidate[] }) {
  const [mode, setMode] = useState<"write" | "ai">("write");

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-md bg-slate-900 p-1">
        <button
          onClick={() => setMode("write")}
          className={`flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-semibold transition ${
            mode === "write"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <PenLine className="h-3.5 w-3.5" />
          Write yourself
        </button>
        <button
          onClick={() => setMode("ai")}
          className={`flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-semibold transition ${
            mode === "ai"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Draft with AI
        </button>
      </div>

      {mode === "write" ? (
        <ComposeForm candidates={candidates} />
      ) : (
        <AIForm candidates={candidates} />
      )}
    </div>
  );
}

function ComposeForm({ candidates }: { candidates: Candidate[] }) {
  const router = useRouter();
  const [businessId, setBusinessId] = useState(candidates[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [template, setTemplate] = useState<TemplateChoice>(
    candidates[0]?.templateChoice ?? "roofing",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = candidates.find((c) => c.id === businessId);

  function pickBusiness(id: string) {
    setBusinessId(id);
    const c = candidates.find((x) => x.id === id);
    if (c) setTemplate(c.templateChoice);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId || !subject.trim() || !body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/outreach/email-gen/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, subject, body, template }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to save draft");
        return;
      }
      setSubject("");
      setBody("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <select
        value={businessId}
        onChange={(e) => pickBusiness(e.target.value)}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
      >
        {candidates.length === 0 && <option value="">No candidates with email</option>}
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.email ? ` — ${c.email}` : ""}
          </option>
        ))}
      </select>
      <TemplatePicker value={template} onChange={setTemplate} />
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={"Write your email…\n\nA link to the mockup we built will auto-append when you send."}
        rows={10}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm leading-relaxed text-slate-200 placeholder:text-slate-500"
      />
      {selected && (
        <div className="rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-2 text-[11px] leading-snug text-slate-400">
          We'll append the mockup link at the bottom when sending — the recipient will see the site you built for them.
        </div>
      )}
      {error && (
        <div className="rounded-md border border-rose-800 bg-rose-950/40 px-2 py-1.5 text-[11px] text-rose-300">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !businessId || !subject.trim() || !body.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
        {loading ? "Saving…" : "Save draft"}
      </button>
    </form>
  );
}

function AIForm({ candidates }: { candidates: Candidate[] }) {
  const router = useRouter();
  const [businessId, setBusinessId] = useState(candidates[0]?.id ?? "");
  const [tone, setTone] = useState("friendly-professional");
  const [hook, setHook] = useState("Rebuilt your homepage for free");
  const [template, setTemplate] = useState<TemplateChoice>(
    candidates[0]?.templateChoice ?? "roofing",
  );
  const [loading, setLoading] = useState(false);

  function pickBusiness(id: string) {
    setBusinessId(id);
    const c = candidates.find((x) => x.id === id);
    if (c) setTemplate(c.templateChoice);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;
    setLoading(true);
    try {
      await fetch("/api/outreach/email-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, tone, hook, template }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <select
        value={businessId}
        onChange={(e) => pickBusiness(e.target.value)}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
      >
        {candidates.length === 0 && <option value="">No candidates</option>}
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <TemplatePicker value={template} onChange={setTemplate} />
      <select
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
      >
        <option value="friendly-professional">Friendly / professional</option>
        <option value="blunt">Blunt</option>
        <option value="playful">Playful</option>
        <option value="founder">Founder-to-founder</option>
      </select>
      <input
        value={hook}
        onChange={(e) => setHook(e.target.value)}
        placeholder="Hook / angle"
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
      />
      <button
        type="submit"
        disabled={loading || !businessId}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Drafting…" : "Draft with AI"}
      </button>
    </form>
  );
}

function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplateChoice;
  onChange: (v: TemplateChoice) => void;
}) {
  const active = TEMPLATE_CHOICES.find((t) => t.value === value);
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/50 p-2">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <LayoutTemplate className="h-3 w-3" />
        Mockup template
      </div>
      <div className="grid grid-cols-4 gap-1">
        {TEMPLATE_CHOICES.map((t) => {
          const on = t.value === value;
          return (
            <button
              type="button"
              key={t.value}
              onClick={() => onChange(t.value)}
              className={`rounded px-2 py-1.5 text-[11px] font-semibold transition ${
                on
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div className="mt-1.5 text-[10px] leading-snug text-slate-500">{active.hint}</div>
      )}
    </div>
  );
}
