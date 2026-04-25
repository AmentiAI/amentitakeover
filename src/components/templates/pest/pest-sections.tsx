import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Leaf,
  MapPin,
  Phone,
  Plus,
  Radar,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { SafeImg } from "@/components/safe-img";
import { defaultServiceAt } from "@/lib/template-defaults";
import { BarrierShieldCanvas } from "@/components/templates/pest/barrier-shield-canvas";
import { DetectionGridCanvas } from "@/components/templates/pest/detection-grid-canvas";
import { HeroBugBanner } from "@/components/templates/pest/hero-bug-banner";
import { RadarSweepCanvas } from "@/components/templates/pest/radar-sweep-canvas";
import { TreatmentZonesCanvas } from "@/components/templates/pest/treatment-zones-canvas";
import {
  AntIcon,
  BedBugIcon,
  CockroachIcon,
  MosquitoIcon,
  RodentIcon,
  SpiderIcon,
  TermiteIcon,
  WaspIcon,
} from "@/components/templates/pest/pest-icons";
import type { SiteData } from "@/lib/templates/site";

// Shared content sections for the multi-page pest template. Everything below
// is designed for a LIGHT page body (slate-50 alternating with white cards,
// emerald-600 accent). The dark green bug banner lives in chrome.tsx.

// -------- Barrier story (about) --------

export function BarrierSection() {
  return (
    <section className="relative bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div className="relative h-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-[#060c09] sm:h-[440px]">
          <BarrierShieldCanvas
            color="rgba(134, 239, 172, 0.9)"
            glowColor="rgba(52, 211, 153, 0.35)"
          />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
            The invisible perimeter
          </div>
          <h2 className="mt-3 font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            A <span className="italic text-emerald-700">living barrier</span> around your home.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
            We apply a precision-targeted treatment along entry points, foundation lines, eaves, and voids — then come back on a quarterly cadence to keep it fresh. Pests hit the edge of the property and turn around.
          </p>
          <ul className="mt-7 space-y-3 text-[14.5px] text-slate-700">
            <BarrierItem icon={<Radar className="h-3.5 w-3.5" />}>
              Property walk-through identifies conducive conditions before you ever see a pest.
            </BarrierItem>
            <BarrierItem icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              Treatments use EPA-registered, label-compliant products — applied at the lowest effective rate.
            </BarrierItem>
            <BarrierItem icon={<Leaf className="h-3.5 w-3.5" />}>
              Pet- and child-safe formulations with cure times clearly communicated before we arrive.
            </BarrierItem>
            <BarrierItem icon={<ClipboardCheck className="h-3.5 w-3.5" />}>
              Every visit documented: findings, products applied, conditions noted — in writing.
            </BarrierItem>
          </ul>
        </div>
      </div>
    </section>
  );
}

function BarrierItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

// -------- Threat assessment (about) --------

export function ThreatAssessment({
  headline,
  aboutShort,
  aboutLong,
  loc,
}: {
  headline: string;
  aboutShort: string;
  aboutLong: string;
  loc: string;
}) {
  return (
    <section className="relative border-y border-slate-200 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 md:grid-cols-[1fr_2fr] md:gap-16">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
            Threat assessment
          </div>
          <div className="mt-3 text-[12px] uppercase tracking-[0.22em] text-slate-500">
            {loc || "Your neighborhood"}
          </div>
          <div className="mt-5 text-[13px] leading-relaxed text-slate-500">
            Climate, geography, and season all change the pest pressure on a property. We tailor every treatment to what we actually find on your walk-through.
          </div>
        </div>
        <div>
          <h2 className="max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-[56px]">
            {headline}
          </h2>
          <div className="mt-6 grid gap-6 text-base leading-relaxed text-slate-600 md:grid-cols-2 md:gap-10">
            <p>{aboutShort}</p>
            <p className="text-slate-500">{aboutLong}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------- Inspection report (about) --------

export function InspectionReport() {
  return (
    <section className="relative bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
            Your free inspection
          </div>
          <h2 className="mt-3 font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            What our tech <span className="italic text-emerald-700">actually checks.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            A real inspection takes 45–60 minutes. Here&apos;s what gets documented on every visit — so you know exactly what you&apos;re paying for.
          </p>
        </div>
        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
          <div className="grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0">
            <InspectionColumn
              title="Exterior survey"
              items={[
                "Foundation perimeter + weep holes",
                "Entry points around HVAC, utility, plumbing penetrations",
                "Soffits, eaves, attic vents for wasp + rodent access",
                "Mulch beds, wood-to-soil contact, standing water",
                "Trees, shrubs, and branches in contact with structure",
              ]}
            />
            <InspectionColumn
              title="Interior + structural"
              items={[
                "Kitchen + pantry harborage (under appliances, cabinets)",
                "Bathrooms, utility rooms, and plumbing chases",
                "Attic, crawlspace, and basement signs of activity",
                "Garages, storage rooms, laundry access points",
                "Evidence log: droppings, shed wings, mud tubes, rub marks",
              ]}
            />
          </div>
          <div className="border-t border-slate-200 bg-white px-6 py-5 text-center text-[12.5px] uppercase tracking-[0.22em] text-slate-500 sm:px-8">
            Findings are emailed to you the same day with photos, maps, and a written plan.
          </div>
        </div>
      </div>
    </section>
  );
}

function InspectionColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-7 sm:p-9">
      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-600">
        {title}
      </div>
      <ul className="mt-5 space-y-3 text-[14.5px] leading-relaxed text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------- Pest catalog (services) --------

export function PestCatalog() {
  return (
    <section id="pests" className="relative border-y border-slate-200 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
              Pest catalog
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
              Know <span className="italic text-emerald-700">what you&apos;re up against.</span>
            </h2>
          </div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            {PEST_CATALOG.length.toString().padStart(2, "0")} species we handle
          </div>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PEST_CATALOG.map((p) => (
            <article
              key={p.name}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                  {p.icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  {p.tier}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">{p.name}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{p.body}</p>
              <div className="mt-5 border-t border-slate-200 pt-4 text-[11.5px] leading-relaxed">
                <div className="font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Signs
                </div>
                <div className="mt-1 text-slate-600">{p.signs}</div>
              </div>
              <div className="mt-3 text-[11.5px] leading-relaxed">
                <div className="font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Our approach
                </div>
                <div className="mt-1 text-slate-600">{p.approach}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- Treatment plans (services / home) --------

export function TreatmentPlans({
  plans,
  headline,
  callHref,
}: {
  plans: Plan[];
  headline: string;
  callHref: string;
}) {
  return (
    <section id="plans" className="relative bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
              Treatment plans
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
              {headline}
            </h2>
          </div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Pick a cadence · switch anytime
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <article
              key={p.title}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl ${
                p.highlight
                  ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-200"
                  : "border-slate-200 bg-white hover:border-emerald-300"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 right-6 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  Most chosen
                </div>
              )}
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className="h-px flex-1 bg-emerald-200" />
                <span>{p.cadence}</span>
              </div>
              <h3 className="mt-4 font-serif text-3xl font-normal leading-[1.05] tracking-tight text-slate-900">
                {p.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{p.body}</p>
              <ul className="mt-5 space-y-2 text-[13.5px] text-slate-700">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex items-center justify-between border-t border-slate-200 pt-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  {p.targets}
                </div>
                <a
                  href={callHref}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-700 hover:text-emerald-600"
                >
                  Book <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- Full services grid (services) --------

export function ServicesGrid({
  services,
  callHref,
}: {
  services: { title: string; body: string; image: string | null }[];
  callHref: string;
}) {
  if (services.length <= 3) return null;
  return (
    <section className="relative border-t border-slate-200 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
          Full service list
        </div>
        <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
          Every pest. Every property. <span className="italic text-emerald-700">One call.</span>
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={s.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="relative aspect-[5/3] w-full overflow-hidden bg-slate-100">
                {s.image ? (
                  <SafeImg
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    defaultSrc={defaultServiceAt(i)}
                    fallback={
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)" }}
                        aria-hidden
                      />
                    }
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)" }}
                    aria-hidden
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500" aria-hidden />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[17px] font-bold tracking-tight text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-slate-600">
                  {s.body}
                </p>
                <a
                  href={callHref}
                  className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-700 hover:text-emerald-600"
                >
                  Get a quote <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- Coverage (contact) --------

export function CoverageSection({
  serviceArea,
  loc,
}: {
  serviceArea: string[];
  loc: string;
}) {
  if (serviceArea.length === 0) return null;
  return (
    <section id="coverage" className="relative bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
            Coverage map
          </div>
          <h2 className="mt-3 font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            Protecting <span className="italic text-emerald-700">{loc || "your area"}.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
            Active service zones across the region — routed weekly so quarterly customers stay on a tight cadence and emergency calls get a truck out the same day.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {serviceArea.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-700"
              >
                <MapPin className="h-3 w-3 text-emerald-600" /> {a}
              </span>
            ))}
          </div>
        </div>
        <CoverageMap areas={serviceArea} />
      </div>
    </section>
  );
}

function CoverageMap({ areas }: { areas: string[] }) {
  const pins = areas.slice(0, 8).map((label, i) => {
    const seed = hashSeed(label);
    const x = 20 + ((seed % 100) / 100) * 60;
    const y = 30 + (((seed >> 8) % 100) / 100) * 50;
    return { label, x, y, i };
  });
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-slate-200 bg-[#0a1612] md:aspect-square">
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="map-glow-light" cx="55%" cy="55%" r="70%">
            <stop offset="0%" stopColor="rgba(52, 211, 153, 0.45)" />
            <stop offset="100%" stopColor="rgba(6, 12, 9, 0)" />
          </radialGradient>
          <pattern id="map-grid-light" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M5 0H0V5" fill="none" stroke="rgba(134, 239, 172, 0.08)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#map-grid-light)" />
        <rect width="100" height="100" fill="url(#map-glow-light)" />
        <path
          d="M22,44 C18,30 34,20 48,22 C64,24 80,30 82,46 C84,60 72,78 56,80 C40,82 24,72 22,44 Z"
          fill="rgba(52, 211, 153, 0.14)"
          stroke="rgba(134, 239, 172, 0.65)"
          strokeWidth="0.8"
          strokeDasharray="1.5 1.2"
        />
        <path
          d="M30,50 C30,38 42,30 52,32 C66,34 74,42 76,54 C78,64 66,72 54,74 C40,75 30,62 30,50 Z"
          fill="none"
          stroke="rgba(134, 239, 172, 0.3)"
          strokeWidth="0.5"
        />
        <path
          d="M40,54 C40,46 48,42 54,44 C62,46 68,50 68,58 C68,64 60,68 52,68 C46,68 40,62 40,54 Z"
          fill="none"
          stroke="rgba(134, 239, 172, 0.2)"
          strokeWidth="0.5"
        />
        {pins.map((p) => (
          <g key={p.label + p.i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill="rgba(134, 239, 172, 0.18)"
              stroke="rgba(134, 239, 172, 0.7)"
              strokeWidth="0.5"
            >
              <animate
                attributeName="r"
                values="3;5;3"
                dur={`${2 + (p.i % 3) * 0.6}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.9;0.2;0.9"
                dur={`${2 + (p.i % 3) * 0.6}s`}
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={p.x} cy={p.y} r="1.1" fill="rgba(134, 239, 172, 1)" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// -------- License badges (about) --------

export function LicenseBadges() {
  return (
    <section className="relative bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LICENSE_BADGES.map((b) => (
            <div
              key={b.label}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                {b.icon}
              </span>
              <div>
                <div className="text-[13px] font-bold tracking-tight text-slate-900">
                  {b.label}
                </div>
                <div className="mt-1 text-[12px] leading-relaxed text-slate-600">
                  {b.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- Testimonials (home) --------

export function TestimonialsSection({
  testimonials,
  headline,
}: {
  testimonials: SiteData["testimonials"];
  headline: string;
}) {
  if (testimonials.length === 0) return null;
  return (
    <section className="relative border-t border-slate-200 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
          What neighbors say
        </div>
        <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
          {headline}
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.slice(0, 3).map((t, i) => (
            <figure
              key={i}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                ))}
              </div>
              <blockquote className="mt-3 font-serif text-[17px] italic leading-[1.55] text-slate-800">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-[12px] font-semibold text-slate-700">
                {t.author}{" "}
                <span className="font-normal text-slate-400">· {t.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- Final CTA (reused on every page) --------

export function FinalCta({
  business,
  ctaHeadline,
  backdrop = "radar",
}: {
  business: SiteData["business"];
  ctaHeadline: string;
  // "radar" is the default look for Home/Services/About. "bugs" is used on
  // Contact where the bug swarm gets top billing over the green radar.
  backdrop?: "radar" | "bugs";
}) {
  const { before, after } = splitHero(ctaHeadline);
  return (
    <section className="relative overflow-hidden bg-[#060c09] py-24 text-white sm:py-32">
      {backdrop === "radar" ? (
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <RadarSweepCanvas
            color="rgba(134, 239, 172, 0.55)"
            gridColor="rgba(134, 239, 172, 0.08)"
          />
        </div>
      ) : (
        <div className="absolute inset-0 opacity-90">
          <HeroBugBanner
            color="rgba(248, 242, 224, 0.96)"
            accent="rgba(134, 239, 172, 0.95)"
            count={28}
            reactToCursor
            scatterRadius={140}
          />
        </div>
      )}
      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.26em] text-emerald-300 backdrop-blur">
          <Shield className="h-3 w-3" />
          Free inspection · no obligation
        </div>
        <h2 className="mt-6 font-serif text-5xl font-normal leading-[1.02] tracking-tight sm:text-6xl">
          {before && (
            <>
              <span className="italic text-emerald-200/90">{before}</span>
              <br />
            </>
          )}
          <span className="font-sans font-black uppercase">{after}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-serif text-lg italic leading-[1.55] text-emerald-100/80 sm:text-xl">
          Pick up the phone. We&apos;ll walk your property, map every pressure point, and send you a written treatment plan — at no cost.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-400 px-7 py-3 text-[15px] font-bold text-[#060c09] shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
            >
              <Phone className="h-4 w-4" /> {business.phone}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
          )}
          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-white/5 px-7 py-3 text-[15px] font-bold text-emerald-100 backdrop-blur transition hover:bg-white/10"
            >
              Email us
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// -------- Home-page service teaser (compact plans preview + link to /services) --------

export function ServicesTeaser({
  services,
  id,
}: {
  services: { title: string; body: string }[];
  id: string;
}) {
  const top = services.slice(0, 3);
  return (
    <section className="relative bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
              Services
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
              Plans matched to <span className="italic text-emerald-700">your pressure.</span>
            </h2>
          </div>
          <Link
            href={`/p/pest/${id}/services`}
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-700 hover:text-emerald-600"
          >
            See all plans <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {top.map((s) => (
            <article
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                Plan
              </div>
              <h3 className="mt-3 text-[18px] font-bold tracking-tight text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- Helpers / data --------

export function splitHero(title: string): { before: string; after: string } {
  const m = title.match(/^(.{4,40}?)[:—-]\s+(.+)$/);
  if (m) return { before: m[1].trim(), after: m[2].trim() };
  return { before: "", after: title };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type Plan = {
  title: string;
  body: string;
  cadence: string;
  targets: string;
  features: string[];
  highlight?: boolean;
};

export function buildTreatmentPlans(services: { title: string; body: string }[]): Plan[] {
  const firstThree = services.slice(0, 3);
  return [
    {
      title: firstThree[0]?.title || "One-time treatment",
      body:
        firstThree[0]?.body ||
        "Targeted treatment for an active problem. We identify the pest, locate entry points, and eliminate the colony.",
      cadence: "Single visit",
      targets: "Active problem",
      features: [
        "Full property inspection + written plan",
        "Targeted interior + exterior treatment",
        "30-day callback guarantee",
      ],
    },
    {
      title: firstThree[1]?.title || "Quarterly protection",
      body:
        firstThree[1]?.body ||
        "Our most popular plan. Four visits per year keep a fresh perimeter barrier around your home and stop problems before they start.",
      cadence: "Every 3 months",
      targets: "Year-round coverage",
      features: [
        "4 scheduled treatments per year",
        "Interior + exterior perimeter barrier",
        "Free re-treats between visits",
        "Priority scheduling + weather reschedules",
      ],
      highlight: true,
    },
    {
      title: firstThree[2]?.title || "Commercial program",
      body:
        firstThree[2]?.body ||
        "Custom-cadence service for restaurants, offices, multifamily, and warehouses. Compliance-ready documentation on request.",
      cadence: "Custom cadence",
      targets: "Businesses & multifamily",
      features: [
        "IPM-compliant documentation",
        "Scheduled service windows",
        "Dedicated account technician",
        "Emergency call-outs",
      ],
    },
  ];
}

const PEST_CATALOG: {
  name: string;
  body: string;
  signs: string;
  approach: string;
  tier: string;
  icon: React.ReactNode;
}[] = [
  {
    name: "Ants",
    body: "Carpenter, pavement, sugar, and fire ants. Most infestations trail from an unseen exterior nest.",
    signs: "Trails along baseboards, sawdust near wood, small dirt mounds outside.",
    approach: "Non-repellent bait that ants carry back to the colony — eliminates the queen.",
    tier: "Very common",
    icon: <AntIcon size={22} />,
  },
  {
    name: "Termites",
    body: "Subterranean and drywood. Cause more structural damage in the US than fire and storms combined.",
    signs: "Mud tubes on foundations, hollow-sounding wood, discarded wings at windowsills.",
    approach: "Liquid barrier treatment + in-ground bait stations with ongoing monitoring.",
    tier: "High damage",
    icon: <TermiteIcon size={22} />,
  },
  {
    name: "Rodents",
    body: "Mice and rats seeking warmth and food. One breeding pair can become 200+ in a year.",
    signs: "Droppings, rub marks along walls, rustling at night, chewed wiring or drywall.",
    approach: "Exclusion seal of entry points, tamper-resistant bait stations, snap monitoring.",
    tier: "Year-round",
    icon: <RodentIcon size={22} />,
  },
  {
    name: "Wasps & hornets",
    body: "Paper wasps, yellow jackets, bald-faced hornets. Aggressive nest defense — don't DIY.",
    signs: "Visible paper nests under eaves or in voids, heavy flight around a single point.",
    approach: "Pro-grade dust into the nest entry, removal after colony kill, entry-point seal.",
    tier: "Seasonal",
    icon: <WaspIcon size={22} />,
  },
  {
    name: "Mosquitos",
    body: "Vectors for West Nile, Zika, EEE. Breed in any standing water — including a bottle cap.",
    signs: "Bites within minutes of going outside, dawn/dusk swarms, activity around shaded vegetation.",
    approach: "Backpack barrier mist on harborage foliage + larvicide treatment of standing water.",
    tier: "Seasonal",
    icon: <MosquitoIcon size={22} />,
  },
  {
    name: "Cockroaches",
    body: "German, American, Oriental. Breed in humid voids; trigger asthma and contaminate food.",
    signs: "Droppings resembling pepper, egg cases in cabinets, musty odor, sightings at night.",
    approach: "Gel bait in voids + IGR (insect-growth regulator) to break the reproductive cycle.",
    tier: "Indoor",
    icon: <CockroachIcon size={22} />,
  },
  {
    name: "Spiders",
    body: "Most are harmless; brown recluse and black widow warrant fast treatment.",
    signs: "Webs in corners, egg sacs under furniture, sightings in garages and basements.",
    approach: "Web removal + crack-and-crevice treatment of harborage, exterior perimeter barrier.",
    tier: "Common",
    icon: <SpiderIcon size={22} />,
  },
  {
    name: "Bed bugs",
    body: "Travel on luggage, furniture, clothing. Hide in seams and feed while you sleep.",
    signs: "Small blood spots on sheets, dark fecal dots in mattress seams, itchy linear bites.",
    approach: "Thermal or targeted residual treatment, mattress encasements, 14- + 28-day follow-up.",
    tier: "Specialty",
    icon: <BedBugIcon size={22} />,
  },
];

const LICENSE_BADGES: { label: string; body: string; icon: React.ReactNode }[] = [
  {
    label: "State licensed",
    body: "Active pest-control operator license in good standing.",
    icon: <BadgeCheck className="h-4 w-4" />,
  },
  {
    label: "Fully insured",
    body: "$2M general liability + workers comp on every tech.",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    label: "EPA-registered products",
    body: "Label-compliant application at the lowest effective rate.",
    icon: <Leaf className="h-4 w-4" />,
  },
  {
    label: "Satisfaction guarantee",
    body: "Free re-treats if pests return between scheduled visits.",
    icon: <Award className="h-4 w-4" />,
  },
];

// -------- Value props / why us (home) --------

export function ValueBar() {
  const items: { icon: React.ReactNode; title: string; body: string }[] = [
    {
      icon: <Search className="h-5 w-5" />,
      title: "Real inspection",
      body: "45-minute walk-through with a written report — not a sales pitch.",
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      title: "Pet + kid safe",
      body: "EPA-registered products at the lowest effective rate. Cure times shared in advance.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Perimeter guarantee",
      body: "If pests return between visits, we come back free — no questions.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Same-day response",
      body: "Emergencies get a truck dispatched today. Routine bookings within 48 hours.",
    },
  ];
  return (
    <section className="relative bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
              Why us
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
              Four things we do <span className="italic text-emerald-700">every single visit.</span>
            </h2>
          </div>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-lg"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 transition group-hover:bg-emerald-600 group-hover:text-white">
                {it.icon}
              </span>
              <h3 className="mt-5 text-[17px] font-bold tracking-tight text-slate-900">
                {it.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- Process steps (home) --------

export function ProcessSteps() {
  const steps: {
    icon: React.ReactNode;
    step: string;
    title: string;
    body: string;
    bullets: string[];
  }[] = [
    {
      icon: <Search className="h-5 w-5" />,
      step: "01",
      title: "Inspect",
      body: "A real walk-through of your property, documented with photos and a written plan emailed the same day.",
      bullets: [
        "Foundation + entry-point map",
        "Evidence log: droppings, wings, trails",
        "Conducive-conditions report",
      ],
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      step: "02",
      title: "Treat",
      body: "Targeted interior + exterior treatment. Low-odor, label-compliant, applied only where needed.",
      bullets: [
        "Crack + crevice precision treatment",
        "Foundation perimeter barrier",
        "Bait stations in rodent corridors",
      ],
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      step: "03",
      title: "Protect",
      body: "Quarterly return visits keep the barrier fresh. Emergency re-treats between visits are always free.",
      bullets: [
        "Scheduled maintenance cadence",
        "Weather + season adjustments",
        "Unlimited callbacks, no fee",
      ],
    },
  ];
  return (
    <section className="relative border-y border-slate-200 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
              How it works
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
              Three steps, <span className="italic text-emerald-700">one written plan.</span>
            </h2>
          </div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Inspection · treatment · guarantee
          </div>
        </div>
        <div className="relative mt-12">
          {/* Connecting dashed line between step numbers on desktop */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-14 hidden h-px bg-[linear-gradient(to_right,transparent,rgba(16,185,129,0.35)_12%,rgba(16,185,129,0.35)_88%,transparent)] lg:block"
          />
          <div className="relative grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <article
                key={s.step}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                    {s.icon}
                  </span>
                  <span className="font-serif text-4xl italic text-emerald-700">
                    {s.step}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-[26px] font-normal leading-tight tracking-tight text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">
                  {s.body}
                </p>
                <ul className="mt-5 space-y-2 text-[13px] text-slate-700">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// -------- Treatment zones (home) — uses TreatmentZonesCanvas --------

export function TreatmentZonesSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
            Treatment coverage
          </div>
          <h2 className="mt-3 font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            Every <span className="italic text-emerald-700">entry point</span> — mapped, monitored, treated.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
            A quarterly visit treats four zones in parallel: attic voids, kitchen harborage, living-space thresholds, and the foundation perimeter. Nothing gets skipped.
          </p>
          <ul className="mt-7 grid gap-3 text-[14px] text-slate-700 sm:grid-cols-2">
            <ZoneLegend color="rgba(16, 185, 129, 1)" label="Attic voids + vents" />
            <ZoneLegend color="rgba(16, 185, 129, 1)" label="Kitchen harborage" />
            <ZoneLegend color="rgba(16, 185, 129, 1)" label="Living thresholds" />
            <ZoneLegend color="rgba(16, 185, 129, 1)" label="Foundation perimeter" />
          </ul>
        </div>
        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl border border-emerald-900/30 bg-[#060c09] shadow-2xl shadow-emerald-900/20">
          <TreatmentZonesCanvas />
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200/85 backdrop-blur">
            Live coverage
          </div>
        </div>
      </div>
    </section>
  );
}

function ZoneLegend({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[13px] font-semibold text-slate-700">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 12px ${color}` }}
      />
      {label}
    </li>
  );
}

// -------- Pest teaser (home) — 4 pests with bug icons + link to services --------

export function PestTeaser({ id }: { id: string }) {
  const top = PEST_CATALOG.slice(0, 4);
  return (
    <section className="relative overflow-hidden bg-[#060c09] py-20 text-white sm:py-28">
      {/* Live detection grid overlay sets the mood for the pest callouts */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <DetectionGridCanvas />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">
              Most flagged
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-white sm:text-5xl">
              What we&apos;re <span className="italic text-emerald-300">catching this season.</span>
            </h2>
          </div>
          <Link
            href={`/p/pest/${id}/services`}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 px-4 py-2 text-[12px] font-bold text-emerald-100 transition hover:bg-emerald-400/10"
          >
            All pests <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((p) => (
            <article
              key={p.name}
              className="group relative flex flex-col rounded-2xl border border-emerald-900/40 bg-[#0a1612]/70 p-6 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-[#0a1612]"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
                  {p.icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300/70">
                  {p.tier}
                </span>
              </div>
              <h3 className="mt-5 text-[17px] font-bold tracking-tight text-white">{p.name}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-emerald-100/80">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- Guarantee / pledge (home) --------

export function GuaranteePledge() {
  return (
    <section className="relative bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-10 shadow-sm sm:p-14">
          <div className="absolute -right-10 -top-10 grid h-40 w-40 place-items-center rounded-full bg-emerald-100/70">
            <Shield className="h-16 w-16 text-emerald-600/80" />
          </div>
          <div className="relative">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-700">
              Our pledge
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
              If the pests come back, <span className="italic text-emerald-700">so do we.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-slate-600">
              Between scheduled visits, you get unlimited free re-treats. No trip fee, no deductible, no fine print. The only guarantee we know how to write is the one we&apos;d want as a homeowner ourselves.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PledgeChip icon={<Bug className="h-3.5 w-3.5" />} label="Unlimited re-treats" />
              <PledgeChip icon={<Shield className="h-3.5 w-3.5" />} label="No trip fee" />
              <PledgeChip icon={<Award className="h-3.5 w-3.5" />} label="30-day guarantee" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PledgeChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-emerald-800">
      {icon} {label}
    </span>
  );
}

// -------- FAQ (home) — uses client accordion --------

export function FAQSection({
  faqs,
}: {
  faqs: { q: string; a: string }[];
}) {
  if (faqs.length === 0) return null;
  const shown = faqs.slice(0, 6);
  return (
    <section className="relative border-t border-slate-200 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
          Questions we hear often
        </div>
        <h2 className="mt-3 font-serif text-4xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
          Straight answers, <span className="italic text-emerald-700">no jargon.</span>
        </h2>
        <div className="mt-10 divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {shown.map((f, i) => (
            <FAQRow key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQRow({
  q,
  a,
  defaultOpen,
}: {
  q: string;
  a: string;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group px-6 py-5 marker:content-[''] sm:px-8"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
        <span className="text-[15.5px] font-bold tracking-tight text-slate-900">
          {q}
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 transition group-open:rotate-45 group-open:bg-emerald-600 group-open:text-white">
          <Plus className="h-4 w-4" />
        </span>
      </summary>
      <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600">{a}</p>
    </details>
  );
}
