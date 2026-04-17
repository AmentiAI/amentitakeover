import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";
import type { RoofingSiteData } from "@/lib/templates/roofing";
import type { TemplateVariant } from "@/lib/templates/loader";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const serif = display.className;

function hexWithAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type ActivePage = "home" | "about" | "services" | "gallery" | "areas" | "contact";

export type TemplateShellProps = {
  data: RoofingSiteData;
  variant: TemplateVariant;
  active: ActivePage;
  children: React.ReactNode;
};

const NAV_ITEMS: { href: string; label: string; key: ActivePage }[] = [
  { href: "", label: "Home", key: "home" },
  { href: "/about", label: "About", key: "about" },
  { href: "/services", label: "Services", key: "services" },
  { href: "/gallery", label: "Work", key: "gallery" },
  { href: "/areas", label: "Service area", key: "areas" },
  { href: "/contact", label: "Contact", key: "contact" },
];

export function TemplateShell({ data, variant, active, children }: TemplateShellProps) {
  const { business, palette, socials, serviceArea } = data;
  const phoneHref = business.phone ? `tel:${business.phone.replace(/[^\d+]/g, "")}` : `/p/${variant}/${data.slug}/contact`;
  const base = `/p/${variant}/${data.slug}`;

  return (
    <div className={`${body.className} min-h-screen bg-white text-slate-900 antialiased`}>
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${palette.accent} 0%, ${palette.accent} 60%, ${palette.trust} 100%)`,
        }}
      />

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_8px_24px_-18px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={base} className="flex items-center gap-3">
            {business.logoUrl ? (
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={business.logoUrl}
                  alt={`${business.name} logo`}
                  className="h-full w-full object-contain p-1"
                />
              </span>
            ) : (
              <span
                className="grid h-11 w-11 place-items-center rounded-xl text-sm font-bold text-white shadow-md shadow-black/10"
                style={{ background: palette.accent }}
              >
                {initials(business.name)}
              </span>
            )}
            <span className="flex flex-col leading-tight">
              <span className={`${serif} text-base font-semibold tracking-tight text-slate-900 sm:text-lg`}>
                {business.name}
              </span>
              <span className="hidden text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:block">
                {variantSubtitle(variant)}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
            {NAV_ITEMS.map((n) => {
              const isActive = n.key === active;
              return (
                <Link
                  key={n.key}
                  href={`${base}${n.href}`}
                  className={`relative transition ${
                    isActive ? "text-slate-950" : "hover:text-slate-950"
                  }`}
                >
                  {n.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: palette.accent }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {business.phone && (
              <a
                href={phoneHref}
                className="hidden items-center gap-1.5 text-sm font-semibold text-slate-900 transition hover:text-slate-600 md:flex"
              >
                <Phone className="h-4 w-4" />
                {business.phone}
              </a>
            )}
            <Link
              href={`${base}/contact`}
              className="group inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-black/10 transition hover:brightness-110 sm:px-4 sm:py-2.5 sm:text-sm"
              style={{ background: palette.accent }}
            >
              <span className="hidden sm:inline">Free estimate</span>
              <span className="sm:hidden">Quote</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <nav className="flex overflow-x-auto border-t border-slate-100 px-2 text-xs font-medium text-slate-600 scrollbar-thin lg:hidden">
          {NAV_ITEMS.map((n) => {
            const isActive = n.key === active;
            return (
              <Link
                key={n.key}
                href={`${base}${n.href}`}
                className={`shrink-0 border-b-2 px-3 py-2.5 transition ${
                  isActive
                    ? "text-slate-950"
                    : "border-transparent hover:text-slate-900"
                }`}
                style={isActive ? { borderColor: palette.accent } : undefined}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div
            className="relative overflow-hidden rounded-3xl p-10 text-white sm:p-14"
            style={{
              background: `linear-gradient(135deg, ${palette.base} 0%, ${palette.accent} 140%)`,
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-30 blur-3xl"
              style={{ background: palette.accent }}
            />
            <div className="relative grid gap-6 sm:grid-cols-[1.3fr_1fr] sm:items-end sm:gap-10">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                  Ready to get started?
                </div>
                <h2 className={`${serif} mt-3 text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl`}>
                  Book your free inspection with {business.name}.
                </h2>
                <p className="mt-4 max-w-xl text-sm text-white/85 sm:text-base">
                  No pressure, no pushy sales. Just an honest assessment from a licensed local crew.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                {business.phone && (
                  <a
                    href={phoneHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-xl shadow-black/20"
                  >
                    <Phone className="h-4 w-4" />
                    {business.phone}
                  </a>
                )}
                <Link
                  href={`${base}/contact`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/15"
                >
                  Request a quote online <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-4">
            <div>
              <div className={`${serif} text-xl font-semibold tracking-tight text-slate-950`}>
                {business.name}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Licensed, bonded, and insured local contractor. Built on referrals from the neighborhoods we serve.
              </p>
              <div className="mt-5 flex gap-2 text-slate-500">
                {socials.instagram && <SocialIcon href={socials.instagram} icon={<Instagram className="h-4 w-4" />} />}
                {socials.facebook && <SocialIcon href={socials.facebook} icon={<Facebook className="h-4 w-4" />} />}
                {socials.linkedin && <SocialIcon href={socials.linkedin} icon={<Linkedin className="h-4 w-4" />} />}
                {socials.youtube && <SocialIcon href={socials.youtube} icon={<Youtube className="h-4 w-4" />} />}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Contact
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
                {business.phone && (
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                    <a href={phoneHref}>{business.phone}</a>
                  </li>
                )}
                {business.email && (
                  <li className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                    <a href={`mailto:${business.email}`}>{business.email}</a>
                  </li>
                )}
                {business.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                    {business.address}
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
                  {business.hoursLine}
                </li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Explore
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {NAV_ITEMS.map((n) => (
                  <li key={n.key}>
                    <Link
                      href={`${base}${n.href}`}
                      className="transition hover:text-slate-950"
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Service area
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {serviceArea.slice(0, 8).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="mt-14 flex flex-col items-start justify-between gap-2 border-t pt-6 text-xs text-slate-500 md:flex-row md:items-center"
            style={{ borderColor: hexWithAlpha("#000000", 0.08) }}
          >
            <div>
              © {new Date().getFullYear()} {business.name}. All rights reserved.
            </div>
            <div>
              {business.website && (
                <a
                  href={business.website}
                  className="text-slate-700 hover:text-slate-900"
                  target="_blank"
                  rel="noreferrer"
                >
                  {business.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile sticky call bar */}
      {business.phone && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
          <a
            href={phoneHref}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
          >
            <Phone className="h-4 w-4" /> Call
          </a>
          <Link
            href={`${base}/contact`}
            className="flex flex-[1.3] items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30"
            style={{ background: palette.accent }}
          >
            Free estimate <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white transition hover:border-slate-300 hover:text-slate-900"
    >
      {icon}
    </a>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

function variantSubtitle(variant: TemplateVariant): string {
  switch (variant) {
    case "electrical":
      return "Licensed electrical contractor";
    case "roofing2":
      return "Editorial · Est. locally";
    case "roofing3":
      return "Premium roofing & exteriors";
    default:
      return "Licensed roofing contractor";
  }
}

export { serif as templateSerif, display as templateDisplay, body as templateBody };
