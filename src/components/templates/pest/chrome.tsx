"use client";

import Link from "next/link";
import { Phone, ShieldCheck } from "lucide-react";
import { CompanyTextLogo } from "@/components/company-text-logo";
import { SafeImg } from "@/components/safe-img";
import { HeroBugBanner } from "@/components/templates/pest/hero-bug-banner";
import { RadarSweepCanvas } from "@/components/templates/pest/radar-sweep-canvas";
import { SocialLinks } from "@/components/templates/site/chrome";
import { usePestTheme } from "@/components/templates/pest/use-pest-theme";
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
  const { theme } = usePestTheme();
  const isDark = theme === "dark";
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href={`/p/pest/${id}`}
          className="inline-flex items-center text-sm font-bold uppercase tracking-[0.22em]"
        >
          {business.logoUrl ? (
            <SafeImg
              src={business.logoUrl}
              alt={business.name}
              className="h-14 w-auto max-h-16 object-contain sm:h-16 sm:max-h-20"
            />
          ) : (
            <CompanyTextLogo
              name={business.name}
              logoUrl={null}
              accent={isDark ? "#10b981" : "#047857"}
              tone={isDark ? "light" : "dark"}
              className="text-[13px] tracking-[0.22em]"
            />
          )}
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
                    ? isDark
                      ? "text-white"
                      : "text-stone-900"
                    : isDark
                      ? "text-emerald-100/75 transition hover:text-white"
                      : "text-stone-700 transition hover:text-stone-900"
                }
              >
                {it.label}
              </Link>
            );
          })}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className={
                isDark
                  ? "rounded-full border border-emerald-300/50 bg-emerald-400/10 px-3 py-1.5 font-semibold text-white transition hover:border-emerald-300/80 hover:bg-emerald-400/20"
                  : "rounded-full border border-emerald-700/40 bg-emerald-700/10 px-3 py-1.5 font-semibold text-emerald-900 transition hover:border-emerald-700/70 hover:bg-emerald-700/15"
              }
            >
              {business.phone}
            </a>
          )}
        </div>
        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className={
              isDark
                ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#060c09] md:hidden"
                : "inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f6efde] md:hidden"
            }
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
  children,
}: {
  variant: "hero" | "page";
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const heightClass =
    variant === "hero"
      ? "min-h-[600px] h-[78vh]"
      : "min-h-[320px] h-[42vh]";
  const bugCount = variant === "hero" ? 32 : 18;
  const { theme } = usePestTheme();
  const isDark = theme === "dark";

  // Theme-tuned palette. Light mode is a warm cream "field notes" look:
  // dark olive bugs and dark-emerald radar on a sandstone backdrop. Dark
  // mode keeps the original black + ivory bugs.
  const sectionBg = isDark ? "bg-black text-white" : "bg-[#ede2c8] text-stone-900";
  // Light mode: pure white where the nav sits, fading into the cream
  // banner color further down. Dark mode keeps its solid black field.
  const baseFill = isDark
    ? "bg-black"
    : "bg-[linear-gradient(to_bottom,#ffffff_0%,#ffffff_14%,#ede2c8_55%)]";
  const radialOverlay = isDark
    ? "bg-[radial-gradient(ellipse_at_80%_40%,rgba(16,185,129,0.18),transparent_60%)]"
    : "bg-[radial-gradient(ellipse_at_80%_40%,rgba(4,120,87,0.18),transparent_60%)]";
  const scanlineColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(60,40,15,0.55)";
  const fadeTo = isDark ? "to-black" : "to-[#ede2c8]";

  // Light mode: radar arms + scanner bar render WHITE (so they read as a
  // soft sweep of light over the cream lower portion of the banner instead
  // of a hard green stripe). Bug bodies stay dark-warm so they remain
  // visible against the cream backdrop.
  const radarColor = isDark
    ? "rgba(134, 239, 172, 0.75)"
    : "rgba(255, 255, 255, 0.95)";
  const radarGrid = isDark
    ? "rgba(134, 239, 172, 0.1)"
    : "rgba(255, 255, 255, 0.55)";
  const bugColor = isDark
    ? "rgba(248, 242, 224, 0.96)"
    : "rgba(46, 32, 12, 0.88)";
  const bugAccent = isDark
    ? "rgba(134, 239, 172, 0.95)"
    : "rgba(255, 255, 255, 0.95)";

  const eyebrowClass = isDark ? "text-emerald-300" : "text-emerald-800";
  const titleClass = isDark ? "text-white" : "text-stone-900";
  const subtitleClass = isDark ? "text-emerald-100/85" : "text-stone-700";

  return (
    <section className={`relative isolate overflow-hidden ${sectionBg}`}>
      <div className={`relative w-full ${heightClass}`}>
        {/* Layer 1: solid backdrop with a faint emerald highlight so the bug
            canvas has something to breathe against. */}
        <div className="absolute inset-0">
          <div className={`h-full w-full ${baseFill}`} />
          <div className={`absolute inset-0 ${radialOverlay}`} />
          {/* CRT scanlines (subtle) */}
          <div
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, ${scanlineColor} 0 1px, transparent 1px 3px)`,
            }}
            aria-hidden
          />
        </div>

        {/* Layer 2: faint radar (atmosphere, not the focus) */}
        <div className="pointer-events-none absolute inset-0 opacity-45">
          <RadarSweepCanvas color={radarColor} gridColor={radarGrid} />
        </div>

        {/* Layer 3: the bugs — main animation */}
        <HeroBugBanner
          color={bugColor}
          accent={bugAccent}
          count={bugCount}
          scatterRadius={170}
        />

        {/* Content — vertically centered on mobile so the title isn't crammed
            against the nav, top-aligned from sm+ where the long banner needs
            the title near the top to leave room for sub-content + canvas. */}
        <div
          className={`pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col px-5 sm:px-8 ${
            variant === "hero"
              ? "justify-center pb-12 pt-24 sm:justify-start sm:pb-0 sm:pt-32"
              : "justify-center pb-8 pt-20 sm:justify-start sm:pb-0 sm:pt-28"
          }`}
        >
          <div
            className={`pointer-events-auto ${
              variant === "hero" ? "max-w-3xl" : "max-w-4xl"
            }`}
          >
            <p className={`text-[11px] font-bold uppercase tracking-[0.28em] ${eyebrowClass}`}>
              {eyebrow}
            </p>
            <h1
              className={`mt-4 font-serif font-normal leading-[0.98] tracking-tight ${titleClass} ${
                variant === "hero"
                  ? "text-4xl sm:text-6xl md:text-7xl"
                  : "text-3xl sm:text-5xl md:text-6xl"
              }`}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={`mt-5 max-w-2xl font-serif italic leading-[1.55] ${subtitleClass} ${
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

      {/* Soft fade into the body below — seamless join with whatever section
          follows in the active theme. */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent ${fadeTo}`}
      />
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
  const { theme } = usePestTheme();
  const isDark = theme === "dark";

  const shellClass = isDark
    ? "relative overflow-hidden border-t border-emerald-900/40 bg-[#060c09] text-emerald-100/80"
    : "relative overflow-hidden border-t border-emerald-900/20 bg-[#ede2c8] text-stone-700";
  const headingClass = isDark ? "text-white" : "text-stone-900";
  const headingIconClass = isDark ? "text-emerald-300" : "text-emerald-700";
  const labelClass = isDark
    ? "text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/80"
    : "text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800";
  const linkHoverClass = isDark ? "hover:text-emerald-300" : "hover:text-emerald-700";
  const baseStripClass = isDark
    ? "relative z-10 border-t border-emerald-900/40 bg-[#050a07]/90 py-4 text-center text-[11px] uppercase tracking-[0.24em] text-emerald-200/50 backdrop-blur-sm"
    : "relative z-10 border-t border-emerald-900/15 bg-[#e3d6b5]/85 py-4 text-center text-[11px] uppercase tracking-[0.24em] text-stone-600 backdrop-blur-sm";

  const bugColor = isDark
    ? "rgba(248, 242, 224, 0.9)"
    : "rgba(46, 32, 12, 0.85)";
  const bugAccent = isDark
    ? "rgba(134, 239, 172, 0.9)"
    : "rgba(4, 120, 87, 0.9)";

  return (
    <footer className={shellClass}>
      {/* Low-density bug crawl across the footer strip. No cursor reaction
          so it never steals pointer from the social + contact links. */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <HeroBugBanner
          color={bugColor}
          accent={bugAccent}
          count={14}
          reactToCursor={false}
        />
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 py-12 text-[12.5px] sm:grid-cols-3 sm:px-8">
        <div>
          <div className={`flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.18em] ${headingClass}`}>
            <ShieldCheck className={`h-4 w-4 ${headingIconClass}`} />
            {business.name}
          </div>
          {loc && <div className="mt-2">{loc}</div>}
          {business.address && <div className="mt-1">{business.address}</div>}
        </div>
        <div>
          <div className={labelClass}>Contact</div>
          <div className="mt-3 space-y-1.5">
            {business.phone && (
              <a href={`tel:${business.phone}`} className={`block ${linkHoverClass}`}>
                {business.phone}
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className={`block ${linkHoverClass}`}>
                {business.email}
              </a>
            )}
          </div>
        </div>
        <div className="sm:text-right">
          <SocialLinks socials={socials} />
        </div>
      </div>
      <div className={baseStripClass}>
        © {new Date().getFullYear()} {business.name}
      </div>
    </footer>
  );
}
