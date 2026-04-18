"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";

type Active = "home" | "about" | "services" | "gallery" | "contact";

export function NavMenu({
  slug,
  active,
  phone,
}: {
  slug: string;
  active: Active;
  phone: string | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-md text-slate-700 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 flex max-h-[100dvh] flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-md text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4 overflow-y-auto">
              <MobileLink href={`/p/site/${slug}`} active={active === "home"} onClick={() => setOpen(false)}>Home</MobileLink>
              <MobileLink href={`/p/site/${slug}/about`} active={active === "about"} onClick={() => setOpen(false)}>About</MobileLink>
              <MobileLink href={`/p/site/${slug}/services`} active={active === "services"} onClick={() => setOpen(false)}>Services</MobileLink>
              <MobileLink href={`/p/site/${slug}/gallery`} active={active === "gallery"} onClick={() => setOpen(false)}>Gallery</MobileLink>
              <MobileLink href={`/p/site/${slug}/contact`} active={active === "contact"} onClick={() => setOpen(false)}>Contact</MobileLink>
            </nav>
            {phone && (
              <div className="border-t border-slate-200 p-4">
                <a
                  href={`tel:${phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg btn-accent px-4 py-3 text-sm font-bold"
                  onClick={() => setOpen(false)}
                >
                  <Phone className="h-4 w-4" />
                  {phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MobileLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-lg px-4 py-3 text-base font-semibold transition ${
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}
