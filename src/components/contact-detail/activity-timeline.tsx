"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckSquare,
  ClipboardList,
  MessageSquare,
  Plus,
  Send,
  StickyNote,
  Loader2,
} from "lucide-react";

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  details: any;
  createdAt: string;
  actor: { id: string; name: string | null; email: string } | null;
};

type Note = { id: string; body: string; createdAt: string; author: { name: string | null; email: string } | null };
type Task = { id: string; title: string; done: boolean; dueAt: string | null };

export function ActivityTimeline({
  contactId,
  activities,
  notes,
  tasks,
}: {
  contactId: string;
  activities: ActivityItem[];
  notes: Note[];
  tasks: Task[];
}) {
  const router = useRouter();
  const [composer, setComposer] = useState<"note" | "task">("note");
  const [noteBody, setNoteBody] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "notes" | "tasks" | "emails">("all");

  async function submitNote() {
    if (!noteBody.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/contacts/${contactId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: noteBody }),
      });
      setNoteBody("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function submitTask() {
    if (!taskTitle.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/contacts/${contactId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, dueAt: taskDue || undefined }),
      });
      setTaskTitle("");
      setTaskDue("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(id: string, done: boolean) {
    await fetch(`/api/contacts/${contactId}/tasks?taskId=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    router.refresh();
  }

  const filtered = activities.filter((a) => {
    if (filter === "all") return true;
    if (filter === "notes") return a.type.startsWith("note");
    if (filter === "tasks") return a.type.startsWith("task");
    if (filter === "emails") return a.type.includes("email") || a.type.includes("message");
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[12px]">
          <ComposerTab active={composer === "note"} onClick={() => setComposer("note")} icon={<StickyNote className="h-3.5 w-3.5" />}>
            Note
          </ComposerTab>
          <ComposerTab active={composer === "task"} onClick={() => setComposer("task")} icon={<CheckSquare className="h-3.5 w-3.5" />}>
            Task
          </ComposerTab>
        </div>
        {composer === "note" ? (
          <div>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={3}
              placeholder="Jot down context, call recap, next step…"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-end">
              <button
                onClick={submitNote}
                disabled={saving || !noteBody.trim()}
                className="flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                Save note
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 focus:border-brand-400 focus:outline-none"
              />
              <button
                onClick={submitTask}
                disabled={saving || !taskTitle.trim()}
                className="ml-auto flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                Add task
              </button>
            </div>
          </div>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="border-b border-slate-200 bg-slate-50 p-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Open tasks
          </div>
          <div className="space-y-1">
            {tasks.filter((t) => !t.done).slice(0, 5).map((t) => (
              <label key={t.id} className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 text-[13px] text-slate-700 shadow-sm">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => toggleTask(t.id, e.target.checked)}
                  className="h-3.5 w-3.5 accent-brand-600"
                />
                <span className="flex-1">{t.title}</span>
                {t.dueAt && (
                  <span className="text-[11px] text-slate-500">
                    {new Date(t.dueAt).toLocaleDateString()}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-3 py-1.5">
        {(["all", "notes", "tasks", "emails"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded px-2 py-1 text-[11px] capitalize ${
              filter === f ? "bg-slate-100 font-medium text-slate-800" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-4">
        {filtered.length === 0 && notes.length === 0 ? (
          <div className="grid h-full place-items-center text-center text-slate-400">
            <div>
              <Activity className="mx-auto mb-2 h-8 w-8" />
              <div className="text-sm">No activity yet</div>
              <div className="text-[11px]">Add a note or task above to get started.</div>
            </div>
          </div>
        ) : (
          <div className="relative space-y-3">
            <div className="absolute bottom-0 left-4 top-0 w-px bg-slate-200" />
            {mergeFeed(filtered, notes).map((item) => (
              <TimelineItem key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ComposerTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] ${
        active ? "bg-white font-medium text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

type FeedItem =
  | { kind: "activity"; id: string; type: string; title: string; details: any; createdAt: string; actor: ActivityItem["actor"] }
  | { kind: "note"; id: string; body: string; createdAt: string; author: Note["author"] };

function mergeFeed(activities: ActivityItem[], notes: Note[]): FeedItem[] {
  const all: FeedItem[] = [
    ...activities.map((a) => ({ kind: "activity" as const, ...a })),
    ...notes.map((n) => ({ kind: "note" as const, ...n })),
  ];
  all.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return all;
}

function TimelineItem({ item }: { item: FeedItem }) {
  if (item.kind === "note") {
    return (
      <div className="relative ml-9 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
        <div className="absolute -left-[26px] top-3 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-amber-100 text-amber-700">
          <StickyNote className="h-3 w-3" />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {item.author?.name ?? item.author?.email ?? "Unknown"} · {timeAgo(item.createdAt)}
          </div>
        </div>
        <div className="mt-1 whitespace-pre-wrap text-[13px] text-slate-800">{item.body}</div>
      </div>
    );
  }

  const icon = iconForActivity(item.type);
  return (
    <div className="relative ml-9 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="absolute -left-[26px] top-3 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium text-slate-800">{item.title}</div>
        <div className="text-[11px] text-slate-500">{timeAgo(item.createdAt)}</div>
      </div>
      {item.details && typeof item.details === "object" && item.details.preview && (
        <div className="mt-1 line-clamp-2 text-[12px] text-slate-600">{item.details.preview}</div>
      )}
      {item.actor && (
        <div className="mt-1 text-[11px] text-slate-500">by {item.actor.name ?? item.actor.email}</div>
      )}
    </div>
  );
}

function iconForActivity(type: string) {
  if (type.startsWith("note")) return <StickyNote className="h-3 w-3" />;
  if (type.startsWith("task")) return <CheckSquare className="h-3 w-3" />;
  if (type.includes("email") || type.includes("message")) return <MessageSquare className="h-3 w-3" />;
  if (type.startsWith("opportunity")) return <ClipboardList className="h-3 w-3" />;
  return <Activity className="h-3 w-3" />;
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString();
}
