import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

const TABS = [
  { label: "Dashboard", href: "/outreach" },
  { label: "Data Scraping", href: "/outreach/scrape/google" },
  { label: "Industry Progress", href: "/outreach/industry" },
  { label: "Audited Websites", href: "/outreach/audited" },
  { label: "Generation Queue", href: "/outreach/queue" },
  { label: "Batch Jobs", href: "/outreach/batch" },
  { label: "Email Generation", href: "/outreach/email-gen" },
  { label: "Email Campaigns", href: "/outreach/email-campaigns" },
  { label: "Form Submissions", href: "/outreach/form-submissions" },
];

export function OutreachTopbar({ activeHref }: { activeHref: string }) {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-slate-800 bg-slate-950 pl-2 pr-2 sm:pl-4 sm:pr-4">
      <nav className="-mx-1 flex flex-1 overflow-x-auto scrollbar-none">
        {TABS.map((t) => {
          const active =
            activeHref === t.href ||
            (t.href !== "/outreach" && activeHref.startsWith(t.href));
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative whitespace-nowrap px-3 py-3 text-[12.5px] transition sm:text-[13px] ${
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
      <div className="flex shrink-0 items-center gap-1 text-slate-400">
        <button className="hidden h-8 w-8 place-items-center rounded-md hover:bg-slate-800 hover:text-white sm:grid">
          <Bell className="h-4 w-4" />
        </button>
        <Link
          href="/settings"
          className="hidden h-8 w-8 place-items-center rounded-md hover:bg-slate-800 hover:text-white sm:grid"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <SignOutButton variant="dark" />
        <div className="ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          W
        </div>
      </div>
    </header>
  );
}
