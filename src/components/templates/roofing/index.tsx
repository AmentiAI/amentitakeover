import { Fraunces, Inter } from "next/font/google";
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Star,
  Phone,
  MapPin,
  Mail,
  Clock,
  Home,
  Building2,
  Wrench,
  CloudLightning,
  Waves,
  Search,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Hammer,
  BadgeCheck,
  Award,
  Check,
  X,
  Quote,
  Sparkles,
} from "lucide-react";
import type { RoofingSiteData, ServiceIcon } from "@/lib/templates/roofing";
import { QuoteForm } from "./quote-form";
import { BeforeAfterSlider } from "../roofing-shared/before-after";
import {
  FinancingBand,
  InsuranceClaimSteps,
  TrustBadgeStrip,
  WarrantyCallout,
} from "../roofing-shared/upgrades";

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

export function RoofingTemplate({ data }: { data: RoofingSiteData }) {
  const { business, hero, services, process, gallery, testimonials, serviceArea, faqs, socials, palette, about } = data;
  const phoneHref = business.phone ? `tel:${business.phone.replace(/[^\d+]/g, "")}` : "#quote";

  return (
    <div className={`${body.className} min-h-screen bg-white text-slate-900 antialiased`}>
      <AccentBar palette={palette} />

      {hero.alertBanner && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-semibold text-white"
          style={{ background: palette.base }}
        >
          <CloudLightning className="h-3.5 w-3.5" />
          {hero.alertBanner}
        </div>
      )}

      <StickyNav business={business} palette={palette} phoneHref={phoneHref} />

      <Hero data={data} phoneHref={phoneHref} />

      <TrustBadgeStrip accent={palette.accent} />

      <StatsBand business={business} palette={palette} />

      <Services services={services} palette={palette} featureImage={data.gallery[0]?.src ?? data.hero.image ?? null} />

      <InsuranceClaimSteps accent={palette.accent} />

      <AboutBand about={about} business={business} palette={palette} />

      <Process steps={process} palette={palette} />

      <Gallery images={gallery} palette={palette} />

      <FinancingBand accent={palette.accent} phoneHref={phoneHref} />

      <WhyUs palette={palette} />

      <Testimonials testimonials={testimonials} palette={palette} />

      <ServiceArea cities={serviceArea} business={business} palette={palette} />

      <FAQs faqs={faqs} />

      <CTABand palette={palette} phoneHref={phoneHref} businessName={business.name} />

      <Footer business={business} socials={socials} serviceArea={serviceArea} />

      <MobileStickyCTA phoneHref={phoneHref} phone={business.phone} palette={palette} />
    </div>
  );
}

/* ---------- Shared display-text helper ---------- */

const serif = display.className;

/* ---------- Accent top bar ---------- */

function AccentBar({ palette }: { palette: RoofingSiteData["palette"] }) {
  return (
    <div
      className="h-1.5 w-full"
      style={{
        background: `linear-gradient(90deg, ${palette.accent} 0%, ${palette.accent} 60%, ${palette.trust} 100%)`,
      }}
    />
  );
}

function hexWithAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ---------- Nav ---------- */

function StickyNav({
  business,
  palette,
  phoneHref,
}: {
  business: RoofingSiteData["business"];
  palette: RoofingSiteData["palette"];
  phoneHref: string;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_8px_24px_-18px_rgba(15,23,42,0.18)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-3">
          {business.logoUrl ? (
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
                src={business.logoUrl}
                alt={`${business.name} logo`}
                className="h-full w-full object-contain p-1"
              />
            </span>
          ) : (
            <span
              className="grid h-11 w-11 place-items-center rounded-xl shadow-md shadow-black/10"
              style={{ background: palette.accent }}
            >
              <Hammer className="h-5 w-5 text-white" />
            </span>
          )}
          <span className="flex flex-col leading-tight">
            <span className={`${serif} text-lg font-semibold tracking-tight text-slate-900`}>
              {business.name}
            </span>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Licensed roofing contractor
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
          <a href="#services" className="transition hover:text-slate-950">Services</a>
          <a href="#process" className="transition hover:text-slate-950">Process</a>
          <a href="#gallery" className="transition hover:text-slate-950">Work</a>
          <a href="#reviews" className="transition hover:text-slate-950">Reviews</a>
          <a href="#areas" className="transition hover:text-slate-950">Service area</a>
          <a href="#faq" className="transition hover:text-slate-950">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          {business.phone && (
            <a
              href={phoneHref}
              className="hidden items-center gap-1.5 text-sm font-semibold text-slate-900 transition hover:text-slate-600 sm:flex"
            >
              <Phone className="h-4 w-4" />
              {business.phone}
            </a>
          )}
          <a
            href="#quote"
            className="group inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/15 transition hover:brightness-110"
            style={{ background: palette.accent }}
          >
            Free estimate
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero({
  data,
  phoneHref,
}: {
  data: RoofingSiteData;
  phoneHref: string;
}) {
  const { hero, business, palette } = data;
  // Split the title so we can emphasize the last clause in italic serif
  const words = hero.title.split(" ");
  const pivot = Math.max(1, Math.floor(words.length * 0.6));
  const headLead = words.slice(0, pivot).join(" ");
  const headAccent = words.slice(pivot).join(" ");

  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${hexWithAlpha(palette.accent, 0.08)} 0%, #ffffff 55%)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-40 -top-20 h-[560px] w-[560px] rounded-full opacity-30 blur-3xl"
        style={{ background: palette.accent }}
      />
      <div
        className="pointer-events-none absolute -left-60 bottom-0 h-[480px] w-[480px] rounded-full opacity-20 blur-3xl"
        style={{ background: palette.trust }}
      />
      <GridBackdrop />

      <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 sm:pt-16 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm"
              style={{ background: palette.accent }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Licensed · Bonded · Insured in {business.state ?? "your state"}
            </div>

            <h1
              className={`${serif} mt-6 text-[clamp(2.5rem,6vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.025em] text-slate-950`}
            >
              {headLead}{" "}
              <span className="relative inline-block italic text-slate-900">
                {headAccent}
                <span
                  className="absolute inset-x-0 -bottom-1 block h-[0.14em] rounded-full"
                  style={{ background: palette.accent }}
                />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {hero.subtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#quote"
                className="group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-10px] transition hover:brightness-110"
                style={{ background: palette.accent, boxShadow: `0 18px 40px -18px ${palette.accent}` }}
              >
                Book free inspection
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
              {business.phone && (
                <a
                  href={phoneHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  <Phone className="h-4 w-4" />
                  {business.phone}
                </a>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
              {business.rating != null && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-900">{business.rating.toFixed(1)}</span>
                  <span>· {business.reviewsCount} reviews</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Lifetime workmanship warranty
              </div>
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-sky-500" />
                Insurance-claim experts
              </div>
            </div>
          </div>

          <HeroStack data={data} />
        </div>
      </div>

      <div id="quote" className="relative mx-auto max-w-3xl px-6 pb-24">
        <QuoteForm accent={palette.accent} businessSlug={data.slug} />
      </div>
    </section>
  );
}

function GridBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage:
          "linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse at top, black 30%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at top, black 30%, transparent 70%)",
      }}
    />
  );
}

function HeroStack({ data }: { data: RoofingSiteData }) {
  const { hero, business, palette } = data;
  return (
    <div className="relative">
      <div className="absolute -right-4 -top-4 h-full w-full rounded-[32px]" style={{ background: palette.accent, opacity: 0.15 }} />
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.45)]">
        {business.logoUrl ? (
          <div className="relative grid h-[520px] w-full place-items-center bg-white p-12">
            <img
              src={business.logoUrl}
              alt={`${business.name} logo`}
              className="h-full w-full object-contain"
            />
          </div>
        ) : hero.image ? (
          <>
            <img
              src={hero.image}
              alt={`${business.name} roofing project`}
              className="h-[520px] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow">
              Recent install · {business.city ?? "local"}
            </div>
          </>
        ) : (
          <div
            className="relative h-[520px] w-full"
            style={{
              background: `linear-gradient(135deg, ${palette.base} 0%, ${palette.accent} 100%)`,
            }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }} />
            <div className="absolute inset-0 grid place-items-center px-10 text-center text-white">
              <div>
                <div className={`${serif} text-4xl font-medium tracking-tight`}>{business.name}</div>
                <div className="mt-2 text-sm uppercase tracking-[0.24em] opacity-80">
                  {business.city ?? "Local"} roofing contractor
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:block">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-[15px] font-bold text-slate-900">G</span>
          <div className="text-sm leading-tight">
            <div className="flex items-center gap-1 font-semibold text-slate-900">
              {business.rating != null ? business.rating.toFixed(1) : "5.0"}
              <div className="ml-1 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-500">{business.reviewsCount || "312"} Google reviews</div>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 top-12 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:flex sm:items-center sm:gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: palette.trust + "22", color: palette.trust }}>
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="text-xs leading-tight">
          <div className={`${serif} text-sm font-semibold text-slate-900`}>Lifetime warranty</div>
          <div className="text-slate-500">In writing</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Stats band ---------- */

function StatsBand({
  business,
  palette,
}: {
  business: RoofingSiteData["business"];
  palette: RoofingSiteData["palette"];
}) {
  const stats = [
    { value: business.reviewsCount > 0 ? `${business.reviewsCount * 4}+` : "1,200+", label: "Roofs installed" },
    { value: business.rating != null ? business.rating.toFixed(1) : "5.0", label: "Avg. Google rating", sub: "★★★★★" },
    { value: business.yearsInBusiness ? `${business.yearsInBusiness}+` : "14+", label: "Years in business" },
    { value: "100%", label: "Workmanship warranty" },
  ];
  return (
    <section
      className="relative isolate overflow-hidden text-white"
      style={{ background: palette.base }}
    >
      <div
        className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[520px] rounded-full opacity-50 blur-3xl"
        style={{ background: palette.accent }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Numbers that matter</div>
            <h2 className={`${serif} mt-3 text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-5xl`}>
              Built on <span className="italic" style={{ color: palette.accent }}>referrals</span>,<br className="hidden md:block" /> not billboards.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-white/70">
            We don't chase storms or blanket the neighborhood with door knockers. The work speaks — and so do the reviews from the people whose houses we put roofs on.
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="p-6 sm:p-8" style={{ background: palette.base }}>
              <div
                className={`${serif} text-4xl font-semibold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl`}
                style={{ color: palette.accent }}
              >
                {s.value}
              </div>
              {s.sub && <div className="mt-2 text-sm text-amber-400">{s.sub}</div>}
              <div className="mt-3 text-xs uppercase tracking-[0.16em] text-white/60 sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Services ---------- */

function Services({ services, palette, featureImage }: { services: RoofingSiteData["services"]; palette: RoofingSiteData["palette"]; featureImage: string | null }) {
  const [featured, ...rest] = services;
  return (
    <section id="services" className="relative bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHead
            eyebrow="What we do"
            title={<>Roofing work that <em className="italic text-slate-900" style={{ color: palette.accent }}>outlasts</em> the warranty.</>}
            kicker="From a leaking skylight to a full commercial tear-off — the same crew discipline on every job."
          />
          <a
            href="#quote"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Get a free estimate <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-6">
          {/* Featured card spans 3/6 columns with a big image backdrop */}
          <article
            className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white lg:col-span-3"
            style={
              featureImage
                ? undefined
                : { background: `linear-gradient(135deg, ${palette.base} 0%, ${palette.accent} 100%)` }
            }
          >
            {featureImage ? (
              <img
                src={featureImage}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="relative">
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ background: palette.accent }}
              >
                <ServiceGlyph kind={featured.icon} />
              </span>
              <h3 className={`${serif} mt-6 text-3xl font-medium tracking-tight sm:text-4xl`}>
                {featured.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">{featured.body}</p>
              <a href="#quote" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-white">
                Start a project <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </a>
            </div>
          </article>

          {rest.slice(0, 4).map((s, i) => (
            <article
              key={s.title}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                i === 0 ? "lg:col-span-3" : "lg:col-span-2"
              }`}
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-xl text-white"
                style={{ background: palette.accent }}
              >
                <ServiceGlyph kind={s.icon} />
              </span>
              <h3 className={`${serif} mt-5 text-xl font-semibold tracking-tight text-slate-950`}>{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              <a
                href="#quote"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition group-hover:gap-2"
                style={{ color: palette.accent }}
              >
                Learn more <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}

          {rest.length > 4 && (
            <article
              className="relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-3xl p-8 text-white lg:col-span-6"
              style={{ background: `linear-gradient(135deg, ${palette.accent} 0%, #0f172a 140%)` }}
            >
              <div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                  <ServiceGlyph kind={rest[4].icon} />
                </span>
                <h3 className={`${serif} mt-6 text-3xl font-medium tracking-tight sm:text-4xl`}>
                  {rest[4].title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85">{rest[4].body}</p>
              </div>
              <a href="#quote" className="mt-6 inline-flex items-center gap-1 self-start rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90">
                Book yours <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

function ServiceGlyph({ kind }: { kind: ServiceIcon }) {
  const map: Record<ServiceIcon, React.ReactNode> = {
    residential: <Home className="h-5 w-5" />,
    commercial: <Building2 className="h-5 w-5" />,
    repair: <Wrench className="h-5 w-5" />,
    storm: <CloudLightning className="h-5 w-5" />,
    gutters: <Waves className="h-5 w-5" />,
    inspection: <Search className="h-5 w-5" />,
  };
  return <>{map[kind]}</>;
}

/* ---------- About band ---------- */

function AboutBand({
  about,
  business,
  palette,
}: {
  about: string;
  business: RoofingSiteData["business"];
  palette: RoofingSiteData["palette"];
}) {
  return (
    <section className="relative border-y border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.3fr] lg:py-28">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">About {business.name}</div>
          <h2 className={`${serif} mt-4 text-4xl font-medium leading-[1.05] tracking-tight text-slate-950 sm:text-5xl`}>
            {business.tagline.split(" ").slice(0, -1).join(" ")}{" "}
            <em className="italic" style={{ color: palette.accent }}>
              {business.tagline.split(" ").slice(-1)[0]}
            </em>
          </h2>
        </div>
        <div>
          <p className={`${serif} text-xl italic leading-[1.5] text-slate-700`}>
            <Quote className="-mb-1 mr-1 inline h-5 w-5 text-slate-300" />
            {about}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
            <Stat label="Roofs installed" value={business.reviewsCount > 0 ? `${business.reviewsCount * 4}+` : "1,200+"} accent={palette.accent} />
            <Stat label="Avg. rating" value={business.rating ? `${business.rating.toFixed(1)}★` : "5.0★"} accent={palette.accent} />
            <Stat label="Warranty" value="Lifetime" accent={palette.accent} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className={`${serif} mt-1 text-3xl font-semibold tracking-tight`} style={{ color: accent }}>
        {value}
      </dd>
    </div>
  );
}

/* ---------- Process ---------- */

function Process({ steps, palette }: { steps: RoofingSiteData["process"]; palette: RoofingSiteData["palette"] }) {
  return (
    <section id="process" className="relative bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <SectionHead
          eyebrow="The process"
          title={<>Four steps. <em className="italic" style={{ color: palette.accent }}>Zero surprises.</em></>}
          kicker="We don't sell roofs — we document damage, explain options, and let you decide."
        />
        <ol className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.step}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={`${serif} absolute -right-3 -top-2 text-[7rem] font-semibold leading-none tracking-tight text-slate-100 transition group-hover:text-slate-200`}
              >
                {i + 1}
              </span>
              <div className="relative">
                <span
                  className={`${serif} text-xs font-semibold uppercase tracking-[0.22em]`}
                  style={{ color: palette.accent }}
                >
                  {s.step}
                </span>
                <h3 className={`${serif} mt-4 text-xl font-semibold text-slate-950`}>{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Gallery ---------- */

function Gallery({ images, palette }: { images: RoofingSiteData["gallery"]; palette: RoofingSiteData["palette"] }) {
  const items = images.slice(0, 6);
  if (items.length === 0) return null;
  const canSlide = items.length >= 2;
  const sliderPair = canSlide
    ? { before: items[1].src, after: items[0].src, caption: items[0].alt || "Recent install", location: undefined }
    : null;
  const rest = canSlide ? items.slice(2, 6) : items;

  return (
    <section id="gallery" className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-28">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHead
            eyebrow="Recent work"
            title={<>Real jobs. Real crews. <em className="italic" style={{ color: palette.accent }}>Real results.</em></>}
            kicker="Drag the slider to see the difference — from storm-worn shingles to a roof that'll outlast the warranty."
          />
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {sliderPair ? (
            <BeforeAfterSlider
              pair={sliderPair}
              accent={palette.accent}
              label="Drag to compare"
            />
          ) : (
            <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img src={items[0].src} alt={items[0].alt} className="h-full w-full object-cover" />
            </figure>
          )}

          <div className="flex flex-col gap-4">
            <WarrantyCallout accent={palette.accent} />
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                What's in the before/after
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ background: palette.accent }} />
                  Full tear-off to deck · no layovers
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ background: palette.accent }} />
                  Synthetic underlayment + ice &amp; water shield
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ background: palette.accent }} />
                  Architectural shingles with GAF manufacturer warranty
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ background: palette.accent }} />
                  Driveway magnet-swept for nails before we leave
                </li>
              </ul>
            </div>
          </div>
        </div>

        {rest.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rest.map((img, i) => (
              <figure
                key={img.src + i}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover transition duration-[800ms] group-hover:scale-[1.04]"
                />
                <figcaption className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-5 opacity-0 transition group-hover:opacity-100">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Project</div>
                    <div className={`${serif} mt-0.5 text-sm font-medium text-white`}>{img.alt || "Recent project"}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Why Us comparison ---------- */

function WhyUs({ palette }: { palette: RoofingSiteData["palette"] }) {
  const us = [
    "Same crew lead on your job start to finish",
    "Written estimate with itemized materials",
    "Manufacturer + workmanship warranty in writing",
    "Insurance-claim documentation done for you",
    "Same-day clean-up, magnet sweep for nails",
    "Licensed, bonded, and fully insured",
  ];
  const them = [
    "Different sub-contractor crews each day",
    "Vague flat-rate numbers, pressure to sign",
    "Verbal warranty that disappears after year one",
    "You chase the adjuster alone",
    "Debris left in your yard for days",
    "Unlicensed storm-chasers from out of state",
  ];
  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <SectionHead
          eyebrow="Why us"
          title={<>The difference is in <em className="italic" style={{ color: palette.accent }}>the details</em>.</>}
          kicker="Ask any of our crew what makes the job different — they'll tell you it starts with doing it right the first time."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <div
            className="relative overflow-hidden rounded-3xl border p-8 text-white"
            style={{ background: palette.base, borderColor: hexWithAlpha(palette.accent, 0.4) }}
          >
            <div className="absolute right-6 top-6 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white" style={{ background: palette.accent }}>
              Our crew
            </div>
            <h3 className={`${serif} text-2xl font-medium tracking-tight sm:text-3xl`}>What you get with us</h3>
            <ul className="mt-8 space-y-4">
              {us.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/90">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: palette.accent }}>
                    <Check className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8">
            <div className="absolute right-6 top-6 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              The typical roofer
            </div>
            <h3 className={`${serif} text-2xl font-medium tracking-tight text-slate-950 sm:text-3xl`}>What you get elsewhere</h3>
            <ul className="mt-8 space-y-4">
              {them.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-600">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100">
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </span>
                  <span className="text-sm leading-relaxed line-through decoration-slate-300 decoration-[1.5px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */

function Testimonials({ testimonials, palette }: { testimonials: RoofingSiteData["testimonials"]; palette: RoofingSiteData["palette"] }) {
  const [featured, ...rest] = testimonials;
  return (
    <section id="reviews" className="relative border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <SectionHead
          eyebrow="What clients say"
          title={<>The only marketing we pay for is <em className="italic" style={{ color: palette.accent }}>keeping customers happy.</em></>}
        />

        <figure className="mt-14 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: featured.rating }).map((_, r) => (
              <Star key={r} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className={`${serif} mt-5 text-lg font-medium leading-[1.3] tracking-tight text-slate-900 sm:text-2xl md:text-[2rem]`}>
            "<em className="italic">{featured.quote}</em>"
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <span
              className="grid h-12 w-12 place-items-center rounded-full text-base font-semibold text-white"
              style={{ background: `hsl(${(0 * 67) % 360} 55% 45%)` }}
            >
              {initialsOf(featured.author)}
            </span>
            <div>
              <div className="font-semibold text-slate-900">{featured.author}</div>
              <div className="text-sm text-slate-500">{featured.location} · Verified Google review</div>
            </div>
          </figcaption>
        </figure>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {rest.map((t, i) => (
            <figure
              key={i}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <Quote className="absolute right-5 top-5 h-6 w-6 text-slate-200" />
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, r) => (
                  <Star key={r} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className={`${serif} mt-4 text-lg font-medium leading-snug tracking-tight text-slate-800`}>
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ background: `hsl(${((i + 1) * 67) % 360} 55% 45%)` }}
                >
                  {initialsOf(t.author)}
                </span>
                <div className="text-sm">
                  <div className="font-semibold text-slate-900">{t.author}</div>
                  <div className="text-slate-500">{t.location}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

/* ---------- Service Area ---------- */

function ServiceArea({
  cities,
  business,
  palette,
}: {
  cities: string[];
  business: RoofingSiteData["business"];
  palette: RoofingSiteData["palette"];
}) {
  return (
    <section id="areas" className="relative bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-28">
        <SectionHead
          eyebrow="Service area"
          title={<>Proudly serving <em className="italic" style={{ color: palette.accent }}>{business.state ?? "the region"}</em>.</>}
          kicker="If you're nearby, we'll make it work. Call for coverage in your zip."
        />
        <ul className="mt-12 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((c) => (
            <li
              key={c}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: palette.accent + "18", color: palette.accent }}>
                <MapPin className="h-4 w-4" />
              </span>
              <span className={`${serif} text-base font-medium`}>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- FAQs ---------- */

function FAQs({ faqs }: { faqs: RoofingSiteData["faqs"] }) {
  return (
    <section id="faq" className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-24 lg:py-28">
        <SectionHead
          eyebrow="FAQ"
          title={<>Questions we hear <em className="italic">every day.</em></>}
        />
        <div className="mt-12 divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {faqs.map((f, i) => (
            <details key={i} className="group px-6 py-5 open:bg-slate-50/70">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                <span className={`${serif} text-lg font-medium text-slate-950`}>{f.q}</span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA band ---------- */

function CTABand({
  palette,
  phoneHref,
  businessName,
}: {
  palette: RoofingSiteData["palette"];
  phoneHref: string;
  businessName: string;
}) {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ background: palette.accent }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 80% 100%, ${hexWithAlpha(palette.base, 0.6)}, transparent 55%)`,
        }}
      />
      <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:py-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          Ready when you are
        </div>
        <h2 className={`${serif} mt-6 text-4xl font-medium leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl`}>
          Ready for a roof you won't <em className="italic text-white/90">have to think about?</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-white/90 sm:text-lg">
          {businessName} offers a no-pressure free inspection with a written report and clear options — usually the same day you call.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <a
            href="#quote"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-semibold shadow-2xl shadow-black/20 transition hover:bg-slate-50 sm:px-7"
            style={{ color: palette.base }}
          >
            Book free inspection
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
          <a
            href={phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-4 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/15 sm:px-7"
          >
            <Phone className="h-4 w-4" />
            Or call now
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer({
  business,
  socials,
  serviceArea,
}: {
  business: RoofingSiteData["business"];
  socials: RoofingSiteData["socials"];
  serviceArea: string[];
}) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className={`${serif} text-xl font-semibold tracking-tight text-slate-950`}>{business.name}</div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Licensed, bonded, and insured roofing contractor. Built on referrals.
          </p>
          <div className="mt-5 flex gap-2 text-slate-500">
            {socials.instagram && <Social href={socials.instagram} icon={<Instagram className="h-4 w-4" />} />}
            {socials.facebook && <Social href={socials.facebook} icon={<Facebook className="h-4 w-4" />} />}
            {socials.linkedin && <Social href={socials.linkedin} icon={<Linkedin className="h-4 w-4" />} />}
            {socials.youtube && <Social href={socials.youtube} icon={<Youtube className="h-4 w-4" />} />}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contact</div>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
            {business.phone && (
              <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-slate-400" />{business.phone}</li>
            )}
            {business.email && (
              <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-slate-400" />{business.email}</li>
            )}
            {business.address && (
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-slate-400" />{business.address}</li>
            )}
            <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 text-slate-400" />{business.hoursLine}</li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Services</div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>Residential roofing</li>
            <li>Commercial roofing</li>
            <li>Storm damage restoration</li>
            <li>Leak & repair</li>
            <li>Gutters & downspouts</li>
            <li>Free inspection</li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Service area</div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {serviceArea.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-slate-500 md:flex-row">
          <div>© {new Date().getFullYear()} {business.name}. All rights reserved.</div>
          <div>
            {business.website && (
              <a href={business.website} className="text-slate-700 hover:text-slate-900">
                {business.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, icon }: { href: string; icon: React.ReactNode }) {
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

/* ---------- Mobile sticky CTA ---------- */

function MobileStickyCTA({
  phoneHref,
  phone,
  palette,
}: {
  phoneHref: string;
  phone: string | null;
  palette: RoofingSiteData["palette"];
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
      {phone && (
        <a
          href={phoneHref}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
      )}
      <a
        href="#quote"
        className="flex flex-[1.3] items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/30"
        style={{ background: palette.accent }}
      >
        Free estimate
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

/* ---------- Section head ---------- */

function SectionHead({
  eyebrow,
  title,
  kicker,
}: {
  eyebrow: string;
  title: React.ReactNode;
  kicker?: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2">
        <span className="h-px w-6 bg-slate-300" />
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</span>
      </div>
      <h2 className={`${serif} mt-4 text-4xl font-medium leading-[1.04] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem]`}>
        {title}
      </h2>
      {kicker && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{kicker}</p>}
    </div>
  );
}
