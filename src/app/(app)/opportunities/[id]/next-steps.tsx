"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
  StickyNote,
} from "lucide-react";

type Stage = { id: string; name: string; color: string; position: number };

type Suggestion = {
  label: string;
  helper: string;
  icon: React.ReactNode;
  href?: string;
};

type NextTask = {
  id: string;
  title: string;
  dueAt: string | null;
  done: boolean;
} | null;

export function NextStepsPanel({
  opportunityId,
  currentStage,
  nextStage,
  nextTask,
  phone,
  email,
}: {
  opportunityId: string;
  currentStage: Stage;
  nextStage: Stage | null;
  nextTask: NextTask;
  phone: string | null;
  email: string | null;
}) {
  const router = useRouter();
  const [advancing, setAdvancing] = useState(false);
  const suggestions = suggestionsFor(currentStage.name, { phone, email });

  async function advance() {
    if (!nextStage) return;
    setAdvancing(true);
    try {
      await fetch("/api/opportunities/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          stageId: nextStage.id,
          position: 0,
        }),
      });
      router.refresh();
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Next Steps
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Stage: {currentStage.name}
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            {nextStage ? "Advance to" : "Pipeline complete"}
          </div>
          <div className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-900">
            {nextStage ? (
              <>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: nextStage.color }}
                />
                {nextStage.name}
              </>
            ) : (
              <span className="text-emerald-800">No further stages</span>
            )}
          </div>
          {nextStage && (
            <button
              onClick={advance}
              disabled={advancing}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {advancing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
              Move to {nextStage.name}
            </button>
          )}

          {nextTask && !nextTask.done && (
            <div className="mt-4 flex items-start gap-2 border-t border-emerald-200 pt-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <div>
                <div className="font-medium text-slate-800">{nextTask.title}</div>
                {nextTask.dueAt && (
                  <div className="text-[11px] text-slate-500">
                    Due {new Date(nextTask.dueAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Suggested actions
          </div>
          <ul className="mt-2 divide-y divide-slate-200">
            {suggestions.map((s, i) => {
              const inner = (
                <>
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-slate-600 ring-1 ring-slate-200">
                    {s.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{s.label}</div>
                    <div className="text-[11px] text-slate-500">{s.helper}</div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </>
              );
              return (
                <li key={i}>
                  {s.href ? (
                    <a
                      href={s.href}
                      className="flex items-center gap-2.5 py-2 transition hover:opacity-80"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="flex items-center gap-2.5 py-2 opacity-60">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function suggestionsFor(
  stageName: string,
  contact: { phone: string | null; email: string | null }
): Suggestion[] {
  const s = stageName.toLowerCase();
  const phoneHref = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : undefined;
  const emailHref = contact.email ? `mailto:${contact.email}` : undefined;

  if (/new|lead|unqualified/.test(s)) {
    return [
      { label: "Call to introduce", helper: "First outreach — keep it short", icon: <Phone className="h-3.5 w-3.5" />, href: phoneHref },
      { label: "Send intro email", helper: "Template: new lead warmup", icon: <Mail className="h-3.5 w-3.5" />, href: emailHref },
      { label: "Log a note", helper: "Capture what you know", icon: <StickyNote className="h-3.5 w-3.5" /> },
    ];
  }
  if (/contact|connected|engaged/.test(s)) {
    return [
      { label: "Book discovery call", helper: "Confirm fit and goals", icon: <CalendarClock className="h-3.5 w-3.5" /> },
      { label: "Follow-up email", helper: "Recap and next steps", icon: <Mail className="h-3.5 w-3.5" />, href: emailHref },
      { label: "Qualify budget", helper: "Value, timeline, authority", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    ];
  }
  if (/qualif/.test(s)) {
    return [
      { label: "Schedule demo", helper: "Walk them through the value", icon: <CalendarClock className="h-3.5 w-3.5" /> },
      { label: "Send proposal", helper: "Tailored pricing + scope", icon: <Mail className="h-3.5 w-3.5" />, href: emailHref },
      { label: "Call decision-maker", helper: "Get the yes or the block", icon: <Phone className="h-3.5 w-3.5" />, href: phoneHref },
    ];
  }
  if (/proposal|quote|estimate/.test(s)) {
    return [
      { label: "Follow up on proposal", helper: "3 business days rule", icon: <Phone className="h-3.5 w-3.5" />, href: phoneHref },
      { label: "Handle objections", helper: "Log questions + respond", icon: <MessageSquare className="h-3.5 w-3.5" /> },
      { label: "Offer to sign", helper: "Make it easy to say yes", icon: <Mail className="h-3.5 w-3.5" />, href: emailHref },
    ];
  }
  if (/negoti|contract/.test(s)) {
    return [
      { label: "Finalize contract", helper: "Send for signature", icon: <Mail className="h-3.5 w-3.5" />, href: emailHref },
      { label: "Align on timeline", helper: "Kickoff date + milestones", icon: <CalendarClock className="h-3.5 w-3.5" /> },
      { label: "Confirm by phone", helper: "Lock in the verbal yes", icon: <Phone className="h-3.5 w-3.5" />, href: phoneHref },
    ];
  }
  if (/won|closed won/.test(s)) {
    return [
      { label: "Kick off onboarding", helper: "Intro call with the team", icon: <CalendarClock className="h-3.5 w-3.5" /> },
      { label: "Send welcome email", helper: "Credentials + next steps", icon: <Mail className="h-3.5 w-3.5" />, href: emailHref },
      { label: "Ask for referral", helper: "Best time is right now", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    ];
  }
  if (/lost|dead/.test(s)) {
    return [
      { label: "Log reason lost", helper: "Price, timing, competitor…", icon: <StickyNote className="h-3.5 w-3.5" /> },
      { label: "Schedule 90-day check-in", helper: "Circumstances change", icon: <CalendarClock className="h-3.5 w-3.5" /> },
      { label: "Send graceful close", helper: "Leave the door open", icon: <Mail className="h-3.5 w-3.5" />, href: emailHref },
    ];
  }
  return [
    { label: "Call the contact", helper: "Move the deal forward", icon: <Phone className="h-3.5 w-3.5" />, href: phoneHref },
    { label: "Send an email", helper: "Check in and update status", icon: <Mail className="h-3.5 w-3.5" />, href: emailHref },
    { label: "Log a note", helper: "Capture what you learned", icon: <StickyNote className="h-3.5 w-3.5" /> },
  ];
}
