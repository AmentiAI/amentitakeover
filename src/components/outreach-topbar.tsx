import Link from "next/link";
import { Bell, Settings } from "lucide-react";

const TABS = [
  { label: "Dashboard", href: "/outreach" },
  { label: "Data Scraping", href: "/outreach/scrape/google" },
  { label: "Industry Progress", href: "/outreach/industry" },
  { label: "Audited Websites", href: "/outreach/audited" },
  { label: "Generation Queue", href: "/outreach/queue" },
  { label: "Batch Jobs", href: "/outreach/batch" },
  { label: "Email Generation", href: "/outreach/email-gen" },
  { label: "Email Campaigns", href: "/outreach/email-campaigns" },
];

export function OutreachTopbar({ activeHref }: { activeHref: string }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
      <nav className="flex">
        {TABS.map((t) => {
          const active =
            activeHref === t.href ||
            (t.href !== "/outreach" && activeHref.startsWith(t.href));
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative px-3 py-3 text-[13px] transition ${
                active
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
              {active && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-1 text-slate-400">
        <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-800 hover:text-white">
          <Bell className="h-4 w-4" />
        </button>
        <Link
          href="/settings"
          className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-800 hover:text-white"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <div className="ml-2 grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          W
        </div>
      </div>
    </header>
  );
}
