import { Bebas_Neue, Inter } from "next/font/google";
import {
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Shield,
  Award,
  Clock,
  Check,
  Star,
  Plus,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
} from "lucide-react";
import type { RoofingSiteData } from "@/lib/templates/roofing";
import { QuoteForm3 } from "./quote-form";

/**
 * Bold / luxury-dark roofing template.
 *
 * Design feel: deep charcoal canvas, oversized display type, editorial gutters,
 * photography-forward. Uses the same RoofingSiteData contract as roofing/roofing2
 * so the picker can switch between looks without re-running the scrape.
 */

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export function RoofingTemplate3({ data }: { data: RoofingSiteData }) {
  const {
    business,
    hero,
    services,
    process,
    gallery,
    testimonials,
    serviceArea,
    faqs,
    socials,
    palette,
    about,
  } = data;

  const phoneHref = business.phone
    ? `tel:${business.phone.replace(/[^\d+]/g, "")}`
    : "#quote";
  const accent = palette.accent;

  return (
    <div className={`${body.className} min-h-screen bg-[#0b0b0c] text-zinc-100 antialiased`}>
      <Nav business={business} phoneHref={phoneHref} />
      <Hero data={data} phoneHref={phoneHref} accent={accent} />
      <Marquee business={business} />
      <PromiseRow accent={accent} />
      <ServicesBold services={services} accent={accent} />
      <ShowcaseSplit data={data} accent={accent} />
      <ProcessTimeline steps={process} accent={accent} />
      <GalleryMasonry images={gallery} />
      <TestimonialsRail testimonials={testimonials} accent={accent} />
      <Philosophy about={about} business={business} accent={accent} />
      <CoverageStrip cities={serviceArea} />
      <FAQBold faqs={faqs} />
      <Consult business={business} accent={accent} />
      <Footer business={business} socials={socials} />
    </div>
  );
}

function Nav({
  business,
  phoneHref,
}: {
  business: RoofingSiteData["business"];
  phoneHref: string;
}) {
  const initials = business.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <header className="border-b border-white/5 bg-[#0b0b0c]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <div className="flex items-center gap-3">
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logoUrl}
              alt={`${business.name} logo`}
              className="h-9 w-9 rounded-sm object-contain"
            />
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-sm border border-white/15 bg-white/5 text-[11px] font-semibold tracking-widest text-white">
              {initials}
            </div>
          )}
          <div>
            <div className={`${display.className} text-xl leading-none tracking-wide text-white`}>
              {business.name}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/40">
              Roofing Contractor
            </div>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-[12px] uppercase tracking-[0.22em] text-white/60 md:flex">
          <a href="#services" className="transition hover:text-white">Services</a>
          <a href="#work" className="transition hover:text-white">Work</a>
          <a href="#process" className="transition hover:text-white">Process</a>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
        </nav>
        <a
          href={phoneHref}
          className="hidden items-center gap-2 rounded-full border border-white/20 bg-white px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-zinc-200 sm:inline-flex"
        >
          <Phone className="h-3.5 w-3.5" />
          {business.phone ?? "Call now"}
        </a>
      </div>
    </header>
  );
}

function Hero({
  data,
  phoneHref,
  accent,
}: {
  data: RoofingSiteData;
  phoneHref: string;
  accent: string;
}) {
  const { hero, business } = data;
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      {hero.image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${hero.image})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0c]/30 via-[#0b0b0c]/60 to-[#0b0b0c]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-28 md:py-40 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/80"
            style={{ borderColor: `${accent}66`, background: `${accent}18` }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: accent }}
            />
            {business.city ? `Serving ${business.city}` : "Local roofing crew"}
          </div>
          <h1
            className={`${display.className} mt-7 text-[64px] leading-[0.92] tracking-[-0.01em] text-white sm:text-[88px] lg:text-[112px]`}
          >
            {hero.title}
          </h1>
          <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-white/70">
            {hero.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#quote"
              className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-black transition hover:brightness-110"
              style={{ background: accent }}
            >
              Book a free inspection
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/5"
            >
              <Phone className="h-3.5 w-3.5" />
              {business.phone ?? "Call us"}
            </a>
          </div>
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-6 text-sm text-white/60">
            <HeroStat
              value={business.rating ? `${business.rating.toFixed(1)}★` : "5.0★"}
              label={business.reviewsCount ? `${business.reviewsCount} reviews` : "Top rated"}
            />
            <HeroStat value="Licensed" label="Bonded · Insured" />
            <HeroStat value="Warranty" label="In writing" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className={`${display.className} text-2xl tracking-wide text-white`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.24em]">{label}</div>
    </div>
  );
}

function Marquee({ business }: { business: RoofingSiteData["business"] }) {
  const words = [
    "Residential roofing",
    "Storm response",
    "Insurance claims",
    "Commercial flat roof",
    "Metal & tile",
    "Gutters",
    business.city ?? "Your neighborhood",
  ];
  return (
    <div className="border-y border-white/5 bg-black/40 py-5">
      <div className="flex items-center gap-10 overflow-x-auto px-6 text-[11px] uppercase tracking-[0.3em] text-white/50">
        {words.map((w, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10">
            {w}
            <span className="h-1 w-1 rounded-full bg-white/20" />
          </span>
        ))}
      </div>
    </div>
  );
}

function PromiseRow({ accent }: { accent: string }) {
  const items = [
    { icon: Shield, title: "Workmanship guaranteed", body: "Written warranty on every roof we touch." },
    { icon: Clock, title: "Most jobs in 1 day", body: "Tear-off to clean-up, start to finish." },
    { icon: Award, title: "Manufacturer certified", body: "GAF / Owens Corning / CertainTeed." },
  ];
  return (
    <section className="border-b border-white/5">
      <div className="mx-auto grid max-w-7xl gap-px bg-white/10 md:grid-cols-3">
        {items.map((it, i) => (
          <div key={i} className="bg-[#0b0b0c] px-8 py-10">
            <it.icon className="h-5 w-5" style={{ color: accent }} />
            <div className={`${display.className} mt-5 text-2xl tracking-wide text-white`}>
              {it.title}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesBold({
  services,
  accent,
}: {
  services: RoofingSiteData["services"];
  accent: string;
}) {
  return (
    <section id="services" className="border-b border-white/5 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/50">
              What we do
            </div>
            <h2
              className={`${display.className} mt-4 text-5xl leading-none tracking-tight text-white sm:text-6xl`}
            >
              Every shingle, every seam, every flash.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-white/60">
              A single crew from diagnosis to clean-up. No sub-sub-sub-contractors
              showing up in a truck you've never seen before.
            </p>
          </div>
          <div className="grid gap-px bg-white/10 lg:col-span-8 md:grid-cols-2">
            {services.map((s, i) => (
              <div key={i} className="group bg-[#0b0b0c] p-8 transition hover:bg-white/[0.03]">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-white/50">
                  <span className="tabular-nums">{(i + 1).toString().padStart(2, "0")}</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <div
                  className={`${display.className} mt-5 text-3xl tracking-tight text-white`}
                >
                  {s.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{s.body}</p>
                <div
                  className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition"
                  style={{ color: accent }}
                >
                  Learn more
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseSplit({ data, accent }: { data: RoofingSiteData; accent: string }) {
  const feature = data.gallery[0] ?? null;
  if (!feature) return null;
  return (
    <section className="border-b border-white/5 bg-black/40 py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="aspect-[4/3] overflow-hidden rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={feature.src}
              alt={feature.alt || "Featured project"}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center lg:col-span-5">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/50">
            Featured project
          </div>
          <h3
            className={`${display.className} mt-4 text-5xl leading-[0.95] tracking-tight text-white sm:text-6xl`}
          >
            A roof that doesn't fail when it matters.
          </h3>
          <p className="mt-6 text-sm leading-relaxed text-white/60">
            Every install is photographed at every stage — decking, underlayment,
            flashing, fastening, final. If something's wrong, we can see it
            before the wind finds it.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/70">
            <SpecLine label="Scope" value="Full tear-off + re-roof" />
            <SpecLine label="Material" value="Architectural asphalt / synthetic underlayment" />
            <SpecLine label="Warranty" value="Lifetime materials / 10-year workmanship" />
          </div>
          <a
            href="#work"
            className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] transition hover:bg-white/5"
            style={{ borderColor: `${accent}80`, color: accent }}
          >
            See all projects
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function SpecLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-white/10 pb-2">
      <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}

function ProcessTimeline({
  steps,
  accent,
}: {
  steps: RoofingSiteData["process"];
  accent: string;
}) {
  return (
    <section id="process" className="border-b border-white/5 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/50">
          How it works
        </div>
        <h2
          className={`${display.className} mt-4 text-5xl leading-none tracking-tight text-white sm:text-6xl`}
        >
          Four steps. No surprises.
        </h2>
        <div className="mt-14 grid gap-px bg-white/10 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="relative bg-[#0b0b0c] p-8">
              <div
                className={`${display.className} text-7xl leading-none tracking-tight`}
                style={{ color: `${accent}44` }}
              >
                {s.step}
              </div>
              <div
                className={`${display.className} mt-4 text-2xl tracking-wide text-white`}
              >
                {s.title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryMasonry({ images }: { images: RoofingSiteData["gallery"] }) {
  if (images.length === 0) return null;
  return (
    <section id="work" className="border-b border-white/5 bg-black/40 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/50">
              Recent work
            </div>
            <h2
              className={`${display.className} mt-4 text-5xl leading-none tracking-tight text-white sm:text-6xl`}
            >
              Unfiltered. No stock photos.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-white/50">
            Every photograph is ours — shot on-site with crew working.
          </p>
        </div>
        <div className="mt-12 grid auto-rows-[200px] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.slice(0, 8).map((img, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-sm ${
                i === 0 ? "col-span-2 row-span-2" : i === 3 ? "row-span-2" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt || "Recent roofing project"}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsRail({
  testimonials,
  accent,
}: {
  testimonials: RoofingSiteData["testimonials"];
  accent: string;
}) {
  return (
    <section className="border-b border-white/5 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/50">
          What clients say
        </div>
        <div className="mt-10 grid gap-px bg-white/10 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-[#0b0b0c] p-8">
              <div className="flex items-center gap-0.5" style={{ color: accent }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p
                className={`${display.className} mt-6 text-2xl leading-snug tracking-tight text-white`}
              >
                "{t.quote}"
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.2em]">
                <span className="text-white/80">{t.author}</span>
                <span className="text-white/40">{t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Philosophy({
  about,
  business,
  accent,
}: {
  about: string;
  business: RoofingSiteData["business"];
  accent: string;
}) {
  return (
    <section className="relative border-b border-white/5 py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/50">
            The philosophy
          </div>
          <h2
            className={`${display.className} mt-4 text-5xl leading-none tracking-tight text-white sm:text-6xl`}
          >
            Built on referrals.
            <br />
            <span style={{ color: accent }}>We'd like to keep it that way.</span>
          </h2>
        </div>
        <div className="lg:col-span-7">
          <p className="text-lg leading-relaxed text-white/70">{about}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Pillar label="Crew discipline" body="Same lead, same hands, every job." />
            <Pillar label="Clean sites" body="Magnet sweep, daily haul-off, nothing left behind." />
            <Pillar label="Honest estimates" body="Itemized, no expiring discounts, no gimmicks." />
            <Pillar label="Warranty in writing" body={`${business.name} stands behind every install.`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Pillar({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-sm border border-white/10 p-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/60">
        <Check className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-2 text-sm text-white/70">{body}</p>
    </div>
  );
}

function CoverageStrip({ cities }: { cities: string[] }) {
  return (
    <section className="border-b border-white/5 bg-black/40 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/50">
            <MapPin className="mr-2 inline h-3 w-3" />
            Service area
          </div>
          {cities.map((c, i) => (
            <span
              key={i}
              className={`${display.className} text-xl tracking-wide text-white/80`}
            >
              {c}
              {i < cities.length - 1 && (
                <span className="ml-8 inline-block h-1 w-1 rounded-full bg-white/20 align-middle" />
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQBold({ faqs }: { faqs: RoofingSiteData["faqs"] }) {
  return (
    <section id="faq" className="border-b border-white/5 py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/50">
            Questions
          </div>
          <h2
            className={`${display.className} mt-4 text-5xl leading-none tracking-tight text-white sm:text-6xl`}
          >
            Answered.
          </h2>
        </div>
        <div className="lg:col-span-8">
          <div className="divide-y divide-white/10 border-y border-white/10">
            {faqs.map((f, i) => (
              <details key={i} className="group px-1 py-6">
                <summary className="flex cursor-pointer items-start justify-between gap-6 list-none">
                  <span
                    className={`${display.className} text-2xl tracking-tight text-white`}
                  >
                    {f.q}
                  </span>
                  <Plus className="mt-1 h-5 w-5 shrink-0 text-white/50 transition group-open:rotate-45" />
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/60">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Consult({
  business,
  accent,
}: {
  business: RoofingSiteData["business"];
  accent: string;
}) {
  return (
    <section id="quote" className="border-b border-white/5 py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/50">
            Free consultation
          </div>
          <h2
            className={`${display.className} mt-4 text-5xl leading-none tracking-tight text-white sm:text-6xl`}
          >
            Your roof, assessed.
            <br />
            <span style={{ color: accent }}>No sales act.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm text-white/60">
            We'll climb up, take photos, and send you a written report. If
            you've got damage, we'll tell you. If you don't, we'll tell you
            that too.
          </p>
          <div className="mt-10 space-y-4 text-sm text-white/70">
            {business.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" style={{ color: accent }} />
                <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">
                  {business.phone}
                </a>
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" style={{ color: accent }} />
                <a href={`mailto:${business.email}`} className="hover:text-white">
                  {business.email}
                </a>
              </div>
            )}
            {business.address && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4" style={{ color: accent }} />
                <span>{business.address}</span>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7">
          <QuoteForm3 accent={accent} businessSlug={business.name} />
        </div>
      </div>
    </section>
  );
}

function Footer({
  business,
  socials,
}: {
  business: RoofingSiteData["business"];
  socials: RoofingSiteData["socials"];
}) {
  return (
    <footer className="py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className={`${display.className} text-3xl tracking-wide text-white`}>
            {business.name}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/40">
            {business.hoursLine}
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/50">
          {socials.instagram && (
            <a href={socials.instagram} aria-label="Instagram" className="transition hover:text-white">
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {socials.facebook && (
            <a href={socials.facebook} aria-label="Facebook" className="transition hover:text-white">
              <Facebook className="h-4 w-4" />
            </a>
          )}
          {socials.youtube && (
            <a href={socials.youtube} aria-label="YouTube" className="transition hover:text-white">
              <Youtube className="h-4 w-4" />
            </a>
          )}
          {socials.linkedin && (
            <a href={socials.linkedin} aria-label="LinkedIn" className="transition hover:text-white">
              <Linkedin className="h-4 w-4" />
            </a>
          )}
        </div>
        <div className="text-[11px] text-white/40">
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
