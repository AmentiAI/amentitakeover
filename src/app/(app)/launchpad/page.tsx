import { Topbar } from "@/components/topbar";
import Link from "next/link";
import {
  Bot,
  Globe,
  MessagesSquare,
  Rocket,
  Target,
  Users,
} from "lucide-react";

const TILES = [
  { href: "/opportunities", icon: Target, title: "Open Opportunities", body: "Work your pipeline." },
  { href: "/sites", icon: Globe, title: "Scrape a prospect site", body: "Generate an AI rebuild as a cold-email hook." },
  { href: "/ai-agents", icon: Bot, title: "Ask an AI Agent", body: "Draft outreach or critique a site." },
  { href: "/contacts", icon: Users, title: "Import contacts", body: "Bulk-upload leads." },
  { href: "/conversations", icon: MessagesSquare, title: "Check inbox", body: "Reply to prospects." },
];

export default function LaunchpadPage() {
  return (
    <>
      <Topbar title="Launchpad" />
      <div className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-700 text-white">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">
              Welcome to Amenti
            </div>
            <div className="text-sm text-slate-500">
              AI-native CRM with site scraping and one-click site rebuilds.
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {TILES.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow"
              >
                <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-slate-800">{t.title}</div>
                <div className="mt-1 text-xs text-slate-500">{t.body}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
