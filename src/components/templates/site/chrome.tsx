/**
 * Shared layout chrome for the multi-page template:
 *   - sticky top nav with logo, links, and a phone CTA
 *   - mobile-responsive drawer (hamburger)
 *   - footer with services, area, hours, and socials
 *
 * The shell is a pure data consumer — it takes `SiteData` plus an active
 * page key for highlighting the current nav item.
 */

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import type { SiteData } from "@/lib/templates/site";
import { NavMenu } from "./nav-menu";

export type SiteChromeProps = {
  data: SiteData;
  active: "home" | "about" | "services" | "gallery" | "contact";
  children: React.ReactNode;
};

export function SiteChrome({ data, active, children }: SiteChromeProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <style>{inlineTheme(data.palette)}</style>
      <TopBar data={data} />
      <SiteHeader data={data} active={active} />
      <main className="flex-1">{children}</main>
      <SiteFooter data={data} />
    </div>
  );
}

function inlineTheme(p: SiteData["palette"]): string {
  return `
:root {
  --site-base: ${p.base};
  --site-accent: ${p.accent};
  --site-trust: ${p.trust};
  --site-base-contrast: #ffffff;
}
.btn-accent {
  background: var(--site-accent);
  color: #fff;
}
.btn-accent:hover { filter: brightness(1.08); }
.btn-base {
  background: var(--site-base);
  color: #fff;
}
.btn-base:hover { filter: brightness(1.2); }
.text-accent { color: var(--site-accent); }
.bg-base { background: var(--site-base); }
.bg-accent { background: var(--site-accent); }
.ring-accent { --tw-ring-color: var(--site-accent); }
  `.trim();
}

function TopBar({ data }: { data: SiteData }) {
  const { phone, email, hoursLine, city, state } = data.business;
  const loc = [city, state].filter(Boolean).join(", ");
  if (!phone && !email && !loc) return null;
  return (
    <div className="hidden border-b border-slate-200 bg-slate-50 text-[11.5px] text-slate-600 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
        <div className="flex items-center gap-4">
          {loc && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {loc}
            </span>
          )}
          <span>{hoursLine}</span>
        </div>
        <div className="flex items-center gap-4">
          {email && (
            <a href={`mailto:${email}`} className="inline-flex items-center gap-1 hover:text-slate-900">
              <Mail className="h-3.5 w-3.5" /> {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-accent">
              <Phone className="h-3.5 w-3.5" /> {phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SiteHeader({ data, active }: { data: SiteData; active: SiteChromeProps["active"] }) {
  const { business, slug } = data;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href={`/p/site/${slug}`} className="flex items-center gap-2.5">
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-9 w-9 rounded object-contain"
            />
          ) : (
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded text-xs font-bold text-white"
              style={{ background: "var(--site-base)" }}
            >
              {initials(business.name)}
            </span>
          )}
          <span className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold tracking-tight text-slate-900">{business.name}</span>
            {business.city && (
              <span className="text-[11px] font-medium text-slate-500">
                {business.city}
                {business.state ? `, ${business.state}` : ""}
              </span>
            )}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink href={`/p/site/${slug}`} active={active === "home"}>Home</NavLink>
          <NavLink href={`/p/site/${slug}/about`} active={active === "about"}>About</NavLink>
          <NavLink href={`/p/site/${slug}/services`} active={active === "services"}>Services</NavLink>
          <NavLink href={`/p/site/${slug}/gallery`} active={active === "gallery"}>Gallery</NavLink>
          <NavLink href={`/p/site/${slug}/contact`} active={active === "contact"}>Contact</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="hidden items-center gap-1.5 rounded-full btn-accent px-4 py-2 text-sm font-bold shadow-sm transition sm:inline-flex"
            >
              <Phone className="h-4 w-4" />
              <span>{business.phone}</span>
            </a>
          )}
          <NavMenu
            slug={slug}
            active={active}
            phone={business.phone}
          />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`relative rounded-md px-3 py-2 text-sm font-semibold transition ${
        active ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {children}
      {active && (
        <span
          className="absolute inset-x-3 bottom-1 h-0.5 rounded-full"
          style={{ background: "var(--site-accent)" }}
          aria-hidden
        />
      )}
    </Link>
  );
}

function SiteFooter({ data }: { data: SiteData }) {
  const { business, socials, services, serviceArea, slug } = data;
  return (
    <footer
      className="relative mt-16 overflow-hidden text-slate-100"
      style={{ background: "var(--site-base)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 0%, var(--site-accent) 0%, transparent 50%), radial-gradient(circle at 90% 100%, var(--site-trust) 0%, transparent 50%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pt-14 pb-8 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoUrl} alt={business.name} className="h-10 w-10 rounded bg-white/10 p-1 object-contain" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded bg-white/10 text-sm font-bold">
                {initials(business.name)}
              </span>
            )}
            <div className="leading-tight">
              <div className="text-base font-bold">{business.name}</div>
              {business.city && (
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                  {business.city}
                  {business.state ? `, ${business.state}` : ""}
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{business.tagline}</p>
          {(socials.instagram || socials.facebook || socials.twitter || socials.linkedin) && (
            <div className="mt-5 flex items-center gap-2">
              {socials.instagram && (
                <SocialIcon href={socials.instagram} label="Instagram"><Instagram className="h-4 w-4" /></SocialIcon>
              )}
              {socials.facebook && (
                <SocialIcon href={socials.facebook} label="Facebook"><Facebook className="h-4 w-4" /></SocialIcon>
              )}
              {socials.twitter && (
                <SocialIcon href={socials.twitter} label="Twitter"><Twitter className="h-4 w-4" /></SocialIcon>
              )}
              {socials.linkedin && (
                <SocialIcon href={socials.linkedin} label="LinkedIn"><Linkedin className="h-4 w-4" /></SocialIcon>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Explore</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href={`/p/site/${slug}`} className="text-white/80 hover:text-white">Home</Link></li>
            <li><Link href={`/p/site/${slug}/about`} className="text-white/80 hover:text-white">About</Link></li>
            <li><Link href={`/p/site/${slug}/services`} className="text-white/80 hover:text-white">Services</Link></li>
            <li><Link href={`/p/site/${slug}/gallery`} className="text-white/80 hover:text-white">Gallery</Link></li>
            <li><Link href={`/p/site/${slug}/contact`} className="text-white/80 hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Services</div>
          <ul className="mt-4 space-y-2 text-sm">
            {services.slice(0, 6).map((s) => (
              <li key={s.title} className="text-white/80">{s.title}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Service Area</div>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {serviceArea.map((a) => <li key={a}>{a}</li>)}
          </ul>
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-bold shadow-sm hover:bg-white/90"
            >
              <Phone className="h-4 w-4" />
              {business.phone}
            </a>
          )}
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-5 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:px-6">
          <div>© {new Date().getFullYear()} {business.name}. All rights reserved.</div>
          <div>Licensed · Bonded · Insured</div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/15 hover:text-white"
    >
      {children}
    </a>
  );
}

function initials(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
