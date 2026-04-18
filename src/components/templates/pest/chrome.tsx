import Link from "next/link";
import { Phone, ShieldCheck } from "lucide-react";
import { HeroBugBanner } from "@/components/templates/pest/hero-bug-banner";
import { RadarSweepCanvas } from "@/components/templates/pest/radar-sweep-canvas";
import { SocialLinks } from "@/components/templates/site/chrome";
import { SafeImg } from "@/components/safe-img";
import type { SiteData } from "@/lib/templates/site";

type NavItem = { label: string; href: string };

// Nav links shown on every pest page. `id` is the route segment used under
// /p/pest/[id] — always the scraped business id (not the slug display string),
// so links remain stable even if the slug ever diverges.
export function pestNav(id: string): NavItem[] {
  return [
    { label: "Home", href: `/p/pest/${id}` },
    { label: "Services", href: `/p/pest/${id}/services` },
    { label: "About", href: `/p/pest/${id}/about` },
    { label: "Contact", href: `/p/pest/${id}/contact` },
  ];
}

// Top navigation chrome. Sticky, sits above the green banner; switches its
// styling so it reads on the dark banner (white text) when pinned over the
// hero, and on the light page body everywhere else (dark text). We render
// both style variants and toggle via a single class on the outer nav.
export function PestNav({
  business,
  id,
  current,
}: {
  business: SiteData["business"];
  id: string;
  current: "home" | "services" | "about" | "contact";
}) {
  const items = pestNav(id);
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href={`/p/pest/${id}`}
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-white"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          <span>{business.name}</span>
        </Link>
        <div className="hidden items-center gap-7 text-[11px] uppercase tracking-[0.22em] md:flex">
          {items.map((it) => {
            const slug = it.label.toLowerCase();
            const isActive =
              (current === "home" && slug === "home") ||
              (current === "services" && slug === "services") ||
              (current === "about" && slug === "about") ||
              (current === "contact" && slug === "contact");
            return (
              <Link
                key={it.href}
                href={it.href}
                className={
                  isActive
                    ? "text-white"
                    : "text-emerald-100/75 transition hover:text-white"
                }
              >
                {it.label}
              </Link>
            );
          })}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="rounded-full border border-emerald-300/50 bg-emerald-400/10 px-3 py-1.5 font-semibold text-white transition hover:border-emerald-300 hover:bg-emerald-400/20"
            >
              {business.phone}
            </a>
          )}
        </div>
        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#060c09] md:hidden"
          >
            <Phone className="h-3 w-3" /> Call
          </a>
        )}
      </nav>
    </header>
  );
}

// Green bug-swarm banner shared by all pest pages. Two variants:
//   - "hero" (home page): tall, top-aligned title, CTAs, subtitle
//   - "page" (sub-pages): compact strip with just eyebrow + page title
//
// In both variants the HeroBugBanner canvas is the main animation, with a
// faint radar and optional hero image underneath. Title sits in the UPPER
// portion of the banner so it's not buried — a fix to the previous layout
// where items-end pushed content to the bottom.
export function PestBanner({
  variant,
  eyebrow,
  title,
  subtitle,
  heroImage,
  children,
}: {
  variant: "hero" | "page";
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  heroImage?: string | null;
  children?: React.ReactNode;
}) {
  const heightClass =
    variant === "hero"
      ? "min-h-[600px] h-[78vh]"
      : "min-h-[320px] h-[42vh]";
  const bugCount = variant === "hero" ? 32 : 18;

  return (
    <section className="relative isolate overflow-hidden bg-[#060c09] text-white">
      <div className={`relative w-full ${heightClass}`}>
        {/* Layer 1: faint hero image + emerald gradient backdrop */}
        <div className="absolute inset-0">
          {heroImage ? (
            <SafeImg
              src={heroImage}
              alt=""
              className="h-full w-full object-cover opacity-20"
              fallback={<div className="h-full w-full bg-[#060c09]" />}
            />
          ) : (
            <div className="h-full w-full bg-[#060c09]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060c09]/60 via-[#0a1a13]/70 to-[#060c09]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(16,185,129,0.28),transparent_55%)]" />
          {/* CRT scanlines (subtle) */}
          <div
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0 1px, transparent 1px 3px)",
            }}
            aria-hidden
          />
        </div>

        {/* Layer 2: faint radar (atmosphere, not the focus) */}
        <div className="pointer-events-none absolute inset-0 opacity-45">
          <RadarSweepCanvas
            color="rgba(134, 239, 172, 0.75)"
            gridColor="rgba(134, 239, 172, 0.1)"
          />
        </div>

        {/* Layer 3: the bugs — main animation */}
        <HeroBugBanner
          color="rgba(22, 13, 7, 0.94)"
          accent="rgba(134, 239, 172, 0.95)"
          count={bugCount}
          scatterRadius={170}
        />

        {/* Content (top-aligned so the title sits near the top of the banner) */}
        <div
          className={`pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col px-5 sm:px-8 ${
            variant === "hero" ? "pt-28 sm:pt-32" : "pt-24 sm:pt-28"
          }`}
        >
          <div
            className={`pointer-events-auto ${
              variant === "hero" ? "max-w-3xl" : "max-w-4xl"
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">
              {eyebrow}
            </p>
            <h1
              className={`mt-4 font-serif font-normal leading-[0.98] tracking-tight text-white ${
                variant === "hero"
                  ? "text-4xl sm:text-6xl md:text-7xl"
                  : "text-3xl sm:text-5xl md:text-6xl"
              }`}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={`mt-5 max-w-2xl font-serif italic leading-[1.55] text-emerald-100/85 ${
                  variant === "hero" ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                }`}
              >
                {subtitle}
              </p>
            )}
            {children && <div className="mt-8">{children}</div>}
          </div>
        </div>
      </div>

      {/* Soft fade into the light body below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-slate-50" />
    </section>
  );
}

// Shared footer — dark emerald strip so it frames the light page content
// between the green banner and a matching dark base.
export function PestFooter({
  business,
  loc,
  socials,
}: {
  business: SiteData["business"];
  loc: string;
  socials: SiteData["socials"];
}) {
  return (
    <footer className="relative overflow-hidden border-t border-emerald-900/40 bg-[#060c09] text-emerald-100/80">
      {/* Low-density bug crawl across the footer strip. No cursor reaction
          so it never steals pointer from the social + contact links. */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <HeroBugBanner
          color="rgba(168, 120, 62, 0.9)"
          accent="rgba(134, 239, 172, 0.9)"
          count={14}
          reactToCursor={false}
        />
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 py-12 text-[12.5px] sm:grid-cols-3 sm:px-8">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.18em] text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            {business.name}
          </div>
          {loc && <div className="mt-2">{loc}</div>}
          {business.address && <div className="mt-1">{business.address}</div>}
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
            Contact
          </div>
          <div className="mt-3 space-y-1.5">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="block hover:text-emerald-300">
                {business.phone}
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="block hover:text-emerald-300">
                {business.email}
              </a>
            )}
          </div>
        </div>
        <div className="sm:text-right">
          <SocialLinks socials={socials} />
        </div>
      </div>
      <div className="relative z-10 border-t border-emerald-900/40 bg-[#050a07]/90 py-4 text-center text-[11px] uppercase tracking-[0.24em] text-emerald-200/50 backdrop-blur-sm">
        © {new Date().getFullYear()} {business.name}
      </div>
    </footer>
  );
}
