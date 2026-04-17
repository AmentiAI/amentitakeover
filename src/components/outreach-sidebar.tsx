"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OUTREACH_NAV } from "@/lib/outreach-nav";
import { cn } from "@/lib/cn";
import { ArrowLeftRight, Moon } from "lucide-react";

export function OutreachSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="text-[11px] uppercase tracking-wider text-slate-500">
          Outreach
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <div className="text-sm font-semibold text-white">
            AI Outreach Platform
          </div>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
            Pro
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {OUTREACH_NAV.map((group, gi) => (
          <div key={gi} className="mb-3">
            {group.label && (
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/outreach" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] hover:bg-slate-800/70 hover:text-white",
                    active && "bg-slate-800 text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-800 p-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-slate-400 hover:bg-slate-800/70 hover:text-white"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Switch to CRM
        </Link>
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-slate-400 hover:bg-slate-800/70 hover:text-white">
          <Moon className="h-4 w-4" />
          Zen Mode
        </button>
      </div>
    </aside>
  );
}
