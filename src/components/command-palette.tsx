"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User as UserIcon,
  Building2,
  Star,
  Radio,
  ArrowRight,
  Home,
  Kanban,
  MessageSquare,
  Calendar,
  Zap,
  Database,
} from "lucide-react";

type Result = { id: string; label: string; sub: string; href: string };
type Group = { key: string; label: string; icon: React.ReactNode; items: Result[] };

const QUICK_ACTIONS: Result[] = [
  { id: "home", label: "Dashboard", sub: "CRM home", href: "/" },
  { id: "pipe", label: "Opportunities", sub: "Kanban pipeline", href: "/opportunities" },
  { id: "contacts", label: "Contacts", sub: "All contacts", href: "/contacts" },
  { id: "tasks", label: "Tasks", sub: "Due today / upcoming", href: "/contacts/tasks" },
  { id: "companies", label: "Companies", sub: "Business index", href: "/contacts/companies" },
  { id: "inbox", label: "Inbox", sub: "Conversations", href: "/conversations" },
  { id: "calendar", label: "Calendar", sub: "Appointments", href: "/calendar" },
  { id: "scrape", label: "Scrape Google", sub: "Find businesses", href: "/outreach/scrape/google" },
  { id: "outreach", label: "Outreach", sub: "Batch + campaigns", href: "/outreach" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Group[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults([
        { key: "go", label: "Go to", icon: <ArrowRight className="h-3.5 w-3.5" />, items: QUICK_ACTIONS },
      ]);
      return;
    }
    const r = await fetch(`/api/search?q=${encodeURIComponent(text)}`);
    const data = await r.json();
    const groups: Group[] = [
      { key: "contacts", label: "Contacts", icon: <UserIcon className="h-3.5 w-3.5" />, items: data.contacts ?? [] },
      { key: "businesses", label: "Companies", icon: <Building2 className="h-3.5 w-3.5" />, items: data.businesses ?? [] },
      { key: "opps", label: "Opportunities", icon: <Star className="h-3.5 w-3.5" />, items: data.opportunities ?? [] },
      { key: "scraped", label: "Scraped leads", icon: <Radio className="h-3.5 w-3.5" />, items: data.scraped ?? [] },
    ];
    // Fuzzy-match quick actions too
    const qLower = text.toLowerCase();
    const quickHits = QUICK_ACTIONS.filter(
      (a) => a.label.toLowerCase().includes(qLower) || a.sub.toLowerCase().includes(qLower),
    );
    if (quickHits.length) {
      groups.unshift({ key: "go", label: "Go to", icon: <ArrowRight className="h-3.5 w-3.5" />, items: quickHits });
    }
    setResults(groups.filter((g) => g.items.length > 0));
    setActiveIdx(0);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      runSearch("");
    } else {
      setQ("");
    }
  }, [open, runSearch]);

  useEffect(() => {
    const t = setTimeout(() => runSearch(q), 150);
    return () => clearTimeout(t);
  }, [q, runSearch]);

  const flat = results.flatMap((g) => g.items);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = flat[activeIdx];
      if (hit) go(hit.href);
    }
  }

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="mt-[12vh] w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search contacts, companies, opportunities…"
            className="w-full bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500">Esc</kbd>
        </div>

        <div className="max-h-[50vh] overflow-auto py-1">
          {results.length === 0 && (
            <div className="px-4 py-6 text-center text-[13px] text-slate-400">No matches</div>
          )}
          {results.map((g) => {
            let runningIdx = 0;
            results.slice(0, results.indexOf(g)).forEach((pg) => (runningIdx += pg.items.length));
            return (
              <div key={g.key} className="pb-1">
                <div className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {g.icon}
                  {g.label}
                </div>
                {g.items.map((item, i) => {
                  const absIdx = runningIdx + i;
                  const active = absIdx === activeIdx;
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setActiveIdx(absIdx)}
                      onClick={() => go(item.href)}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] ${
                        active ? "bg-brand-50 text-brand-800" : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{item.label}</div>
                        {item.sub && <div className="truncate text-[11px] text-slate-500">{item.sub}</div>}
                      </div>
                      {active && <ArrowRight className="h-3.5 w-3.5 text-brand-600" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
          </div>
          <span>Cmd/Ctrl + K anywhere</span>
        </div>
      </div>
    </div>
  );
}
