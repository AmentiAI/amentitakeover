"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Facebook, Instagram, Linkedin, Menu, Phone, Twitter, X, Youtube } from "lucide-react";

type Active = "home" | "about" | "services" | "gallery" | "contact";

type Socials = {
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  tiktok: string | null;
  youtube: string | null;
};

export function NavMenu({
  slug,
  active,
  phone,
  socials,
}: {
  slug: string;
  active: Active;
  phone: string | null;
  socials?: Socials;
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

  const socialItems: { href: string; label: string; icon: React.ReactNode }[] = [];
  if (socials) {
    if (socials.instagram) socialItems.push({ href: socials.instagram, label: "Instagram", icon: <Instagram className="h-4 w-4" /> });
    if (socials.facebook) socialItems.push({ href: socials.facebook, label: "Facebook", icon: <Facebook className="h-4 w-4" /> });
    if (socials.twitter) socialItems.push({ href: socials.twitter, label: "Twitter", icon: <Twitter className="h-4 w-4" /> });
    if (socials.linkedin) socialItems.push({ href: socials.linkedin, label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> });
    if (socials.youtube) socialItems.push({ href: socials.youtube, label: "YouTube", icon: <Youtube className="h-4 w-4" /> });
    if (socials.tiktok) socialItems.push({ href: socials.tiktok, label: "TikTok", icon: <TikTokGlyph /> });
  }

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
            {(phone || socialItems.length > 0) && (
              <div className="border-t border-slate-200 p-4 space-y-3">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg btn-accent px-4 py-3 text-sm font-bold"
                    onClick={() => setOpen(false)}
                  >
                    <Phone className="h-4 w-4" />
                    {phone}
                  </a>
                )}
                {socialItems.length > 0 && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {socialItems.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.label}
                        onClick={() => setOpen(false)}
                        className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                )}
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

function TikTokGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M19.321 5.562a5.124 5.124 0 0 1-1.423-4.168 5.242 5.242 0 0 1-3.4 0l.006 13.71a3.235 3.235 0 1 1-3.235-3.235 3.184 3.184 0 0 1 .993.16V8.538a7.07 7.07 0 1 0 6.24 7.025V9.127a8.48 8.48 0 0 0 4.946 1.582V7.318a5.084 5.084 0 0 1-4.127-1.756Z" />
    </svg>
  );
}
