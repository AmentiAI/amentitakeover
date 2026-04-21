import Link from "next/link";
import { Home, Phone } from "lucide-react";
import { SafeImg } from "@/components/safe-img";
import { SocialLinks } from "@/components/templates/site/chrome";
import { StormCanvas } from "@/components/templates/roofing/storm-canvas";
import { RoofRidgeCanvas } from "@/components/templates/roofing/roof-ridge-canvas";
import type { SiteData } from "@/lib/templates/site";

type NavItem = { label: string; href: string; key: NavKey };
export type NavKey = "home" | "services" | "about" | "contact";

export function roofingNav(id: string): NavItem[] {
  return [
    { label: "Home", href: `/p/roofing/${id}`, key: "home" },
    { label: "Services", href: `/p/roofing/${id}/services`, key: "services" },
    { label: "About", href: `/p/roofing/${id}/about`, key: "about" },
    { label: "Contact", href: `/p/roofing/${id}/contact`, key: "contact" },
  ];
}

export function RoofingNav({
  business,
  id,
  current,
}: {
  business: SiteData["business"];
  id: string;
  current: NavKey;
}) {
  const items = roofingNav(id);
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href={`/p/roofing/${id}`}
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-white"
        >
          <Home className="h-4 w-4 text-amber-400" />
          <span>{business.name}</span>
        </Link>
        <div className="hidden items-center gap-7 text-[11px] uppercase tracking-[0.22em] md:flex">
          {items.map((it) => {
            const isActive = it.key === current;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={
                  isActive
                    ? "text-white"
                    : "text-slate-300/80 transition hover:text-white"
                }
              >
                {it.label}
              </Link>
            );
          })}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="rounded-full border border-amber-300/50 bg-amber-400/10 px-3 py-1.5 font-semibold text-white transition hover:border-amber-300 hover:bg-amber-400/20"
            >
              {business.phone}
            </a>
          )}
        </div>
        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0b1220] md:hidden"
          >
            <Phone className="h-3 w-3" /> Call
          </a>
        )}
      </nav>
    </header>
  );
}

// Hero/page banner shared by all roofing pages. Storm canvas over a muted
// hero image + ridge canvas gives the dark, weather-forward frame. Two height
// variants keep the homepage cinematic while sub-pages stay compact.
export function RoofingBanner({
  variant,
  eyebrow,
  title,
  subtitle,
  heroImage,
  svg,
  children,
}: {
  variant: "hero" | "page";
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  heroImage?: string | null;
  svg?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const heightClass =
    variant === "hero"
      ? "min-h-[560px] h-[74vh]"
      : "min-h-[320px] h-[44vh]";
  const stormDensity = variant === "hero" ? 100 : 60;

  return (
    <section className="relative isolate overflow-hidden bg-[#0b1220] text-white">
      <div className={`relative w-full ${heightClass}`}>
        {heroImage && (
          <div className="absolute inset-0">
            <SafeImg
              src={heroImage}
              alt="hero"
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/60 via-[#0b1220]/70 to-[#0b1220]" />
          </div>
        )}
        {!heroImage && !svg && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(251,191,36,0.15),transparent_60%)]" />
        )}

        {/* SVG banner — layered above the image tint, below ridge/storm */}
        {svg && (
          <div className="absolute inset-0">
            {svg}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b1220]/40 to-[#0b1220]" />
          </div>
        )}

        <div className="absolute inset-0 opacity-60">
          <RoofRidgeCanvas />
        </div>
        <div className="absolute inset-0 opacity-70">
          <StormCanvas density={stormDensity} />
        </div>

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
            <p className="font-serif text-[13px] italic tracking-wide text-amber-300/90">
              {eyebrow}
            </p>
            <h1
              className={`mt-4 font-sans font-black leading-[0.95] tracking-tight text-slate-50 ${
                variant === "hero"
                  ? "text-[44px] sm:text-[64px] md:text-[80px]"
                  : "text-3xl sm:text-5xl md:text-6xl"
              }`}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={`mt-6 max-w-2xl leading-relaxed text-slate-300 ${
                  variant === "hero" ? "text-[15px] sm:text-[17px]" : "text-[15px] sm:text-[16px]"
                }`}
              >
                {subtitle}
              </p>
            )}
            {children && <div className="mt-10">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function RoofingFooter({
  business,
  loc,
  socials,
}: {
  business: SiteData["business"];
  loc: string;
  socials: SiteData["socials"];
}) {
  return (
    <footer className="relative border-t border-slate-800/80 bg-[#070c16] text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 text-[12.5px] sm:grid-cols-3 sm:px-8">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.18em] text-slate-100">
            <Home className="h-4 w-4 text-amber-400" />
            {business.name}
          </div>
          {loc && <div className="mt-2">{loc}</div>}
          {business.address && <div className="mt-1">{business.address}</div>}
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Contact
          </div>
          <div className="mt-3 space-y-1.5">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="block hover:text-amber-300">
                {business.phone}
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="block hover:text-amber-300">
                {business.email}
              </a>
            )}
          </div>
        </div>
        <div className="sm:text-right">
          <SocialLinks socials={socials} />
        </div>
      </div>
      <div className="border-t border-slate-800/60 bg-[#050810] py-4 text-center text-[11px] uppercase tracking-[0.24em] text-slate-600">
        © {new Date().getFullYear()} {business.name}
      </div>
    </footer>
  );
}
