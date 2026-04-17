"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Phone, Wallet, Tag, Menu, X, Map, BookOpen } from "lucide-react";

const TABS = [
  { label: "Opportunities", href: "", icon: Phone },
  { label: "Map", href: "/map", icon: Map },
  { label: "Scripts", href: "/scripts", icon: BookOpen },
  { label: "Pricing", href: "/pricing", icon: Tag },
  { label: "Earnings", href: "/earnings", icon: Wallet },
];

export function AffiliateShell({
  slug,
  name,
  commissionPct,
  children,
}: {
  slug: string;
  name: string;
  commissionPct: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const base = `/a/${slug}`;

  async function logout() {
    await fetch("/api/affiliate/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 md:flex-row">
      {/* Mobile topbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="min-w-0">
          <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-indigo-400">
            Affiliate
          </div>
          <div className="truncate text-sm font-semibold text-white">
            {name}
          </div>
        </div>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="grid h-9 w-9 place-items-center rounded-md border border-slate-800 text-slate-300 hover:bg-slate-900"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 top-[57px] z-20 bg-slate-950/95 p-4 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div className="text-[11px] text-slate-500">
            {commissionPct}% commission
          </div>
          <nav className="mt-3 space-y-1">
            {TABS.map((t) => {
              const href = `${base}${t.href}`;
              const active =
                pathname === href || (t.href === "" && pathname === base);
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-3 text-sm transition ${
                    active
                      ? "bg-indigo-600/20 text-white"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center gap-2 rounded-md border border-slate-800 px-3 py-3 text-sm text-slate-300 hover:bg-slate-800/60"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900/40 md:flex">
        <div className="border-b border-slate-800 px-4 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-400">
            Affiliate
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-white">
            {name}
          </div>
          <div className="text-[11px] text-slate-500">
            {commissionPct}% commission
          </div>
        </div>

        <nav className="flex-1 px-2 py-3">
          {TABS.map((t) => {
            const href = `${base}${t.href}`;
            const active =
              pathname === href || (t.href === "" && pathname === base);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={href}
                className={`mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-indigo-600/20 text-white"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
