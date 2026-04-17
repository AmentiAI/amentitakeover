import { Fraunces, Inter } from "next/font/google";
import {
  ArrowUpRight,
  Phone,
  MapPin,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Hammer,
  Award,
  Plus,
  ArrowRight,
} from "lucide-react";
import type { RoofingSiteData } from "@/lib/templates/roofing";
import { QuoteForm2 } from "./quote-form";
import { BeforeAfterSlider } from "../roofing-shared/before-after";
import {
  FinancingBand,
  InsuranceClaimSteps,
  WarrantyCallout,
} from "../roofing-shared/upgrades";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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

export function RoofingTemplate2({ data }: { data: RoofingSiteData }) {
  const { business, hero, services, process, gallery, testimonials, serviceArea, faqs, socials, palette, about } = data;
  const phoneHref = business.phone ? `tel:${business.phone.replace(/[^\d+]/g, "")}` : "#quote";

  return (
    <div
      className={`${body.className} min-h-screen bg-white text-slate-900 antialiased`}
      style={{ ["--r2-accent" as string]: palette.accent }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .r2-accent-em { color: var(--r2-accent); }
          .r2-numeral { color: var(--r2-accent); }
          .r2-rule { background: var(--r2-accent); }
        `,
      }} />
      <div className="h-1 w-full" style={{ background: palette.accent }} />
      <TopBar business={business} phoneHref={phoneHref} />
      <Nav business={business} palette={palette} />

      <Hero data={data} phoneHref={phoneHref} />

      <StatsStrip business={business} />

      <Credentials palette={palette} />

      <ServicesEditorial services={services} palette={palette} />

      <InsuranceClaimSteps accent={palette.accent} />

      <CaseStudy data={data} />

      <ProcessRail steps={process} palette={palette} />

      <GalleryEditorial images={gallery} />

      <FinancingBand accent={palette.accent} phoneHref={phoneHref} />

      <Philosophy about={about} business={business} palette={palette} />

      <TestimonialsEditorial testimonials={testimonials} palette={palette} />

      <Coverage cities={serviceArea} business={business} />

      <FAQEditorial faqs={faqs} />

      <Consult data={data} />

      <FooterEditorial business={business} socials={socials} serviceArea={serviceArea} palette={palette} />
    </div>
  );
}

/* ---------- Top bar (discreet contact line) ---------- */

function TopBar({ business, phoneHref }: { business: RoofingSiteData["business"]; phoneHref: string }) {
  return (
    <div className="hidden border-b border-slate-200 bg-white md:block">
      <div className="mx-auto flex max-w-[1300px] items-center justify-between px-8 py-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            {[business.city, business.state].filter(Boolean).join(", ") || "Nationwide"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {business.hoursLine}
          </span>
        </div>
        <div className="flex items-center gap-5">
          {business.email && (
            <a href={`mailto:${business.email}`} className="flex items-center gap-1.5 hover:text-slate-900">
              <Mail className="h-3 w-3" /> {business.email}
            </a>
          )}
          {business.phone && (
            <a href={phoneHref} className="flex items-center gap-1.5 font-medium text-slate-800 hover:text-slate-950">
              <Phone className="h-3 w-3" /> {business.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Main nav ---------- */

function Nav({ business, palette }: { business: RoofingSiteData["business"]; palette: RoofingSiteData["palette"] }) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1300px] items-center justify-between px-4 sm:px-6 md:h-20 md:px-8">
        <a href="#top" className="flex items-center gap-3">
          {business.logoUrl ? (
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-sm border border-slate-200 bg-white">
              <img
                src={business.logoUrl}
                alt={`${business.name} logo`}
                className="h-full w-full object-contain p-1"
              />
            </span>
          ) : (
            <span
              className="grid h-10 w-10 place-items-center rounded-sm border border-slate-900 bg-white"
            >
              <Hammer className="h-4 w-4 text-slate-900" />
            </span>
          )}
          <span className="flex flex-col leading-tight">
            <span className={`${serif} text-[17px] font-medium tracking-[-0.015em] text-slate-950`}>
              {business.name}
            </span>
            <span className="text-[9.5px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Est. {new Date().getFullYear() - (business.yearsInBusiness ?? 14)} · {business.state ?? "Licensed"}
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-9 text-[13px] font-medium text-slate-700 md:flex">
          <a href="#services" className="transition hover:text-slate-950">Services</a>
          <a href="#work" className="transition hover:text-slate-950">Work</a>
          <a href="#process" className="transition hover:text-slate-950">Process</a>
          <a href="#reviews" className="transition hover:text-slate-950">Clients</a>
          <a href="#coverage" className="transition hover:text-slate-950">Coverage</a>
          <a href="#faq" className="transition hover:text-slate-950">FAQ</a>
        </nav>
        <a
          href="#consult"
          className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium text-white transition hover:brightness-110 sm:px-5 sm:py-2.5"
          style={{ background: palette.accent }}
        >
          <span className="hidden sm:inline">Request consult</span>
          <span className="sm:hidden">Consult</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero({ data, phoneHref }: { data: RoofingSiteData; phoneHref: string }) {
  const { hero, business, palette } = data;
  return (
    <section
      id="top"
      className="relative border-b border-slate-200 bg-white"
      style={{
        backgroundImage: `linear-gradient(180deg, ${hexWithAlpha(palette.accent, 0.06)} 0%, #ffffff 60%)`,
      }}
    >
      <div className="mx-auto max-w-[1300px] px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-16 md:px-8 lg:pb-28 lg:pt-24">
        <div className="mb-8 flex items-baseline justify-between gap-6 sm:mb-12">
          <div className="flex items-center gap-3 text-[10.5px] font-medium uppercase tracking-[0.24em] text-slate-500">
            <span className="h-px w-6 sm:w-8" style={{ background: palette.accent }} />
            A {(business.state ?? "local").toString()} roofing practice
          </div>
          <div className="hidden text-[10.5px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:block">
            Issue № {String(new Date().getFullYear()).slice(-2)}
          </div>
        </div>

        <h1 className={`${serif} max-w-5xl text-[clamp(2.25rem,7.2vw,6.25rem)] font-[300] leading-[0.98] tracking-[-0.03em] text-slate-950`}>
          {hero.title.split(" ").slice(0, -2).join(" ")}{" "}
          <em className="italic font-[400] r2-accent-em" style={{ color: palette.accent }}>
            {hero.title.split(" ").slice(-2).join(" ")}
          </em>
        </h1>

        <div className="mt-8 grid gap-8 sm:mt-12 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          <p className="max-w-xl text-base leading-[1.55] text-slate-600 sm:text-lg">
            {hero.subtitle}
          </p>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-end">
            <a
              href="#consult"
              className="group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-medium text-white transition hover:brightness-110 sm:px-7 sm:py-4"
              style={{ background: palette.accent }}
            >
              Book inspection
              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            {business.phone && (
              <a
                href={phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-[13px] font-medium text-slate-900 transition hover:border-slate-900 sm:px-7 sm:py-4"
              >
                <Phone className="h-3.5 w-3.5" />
                {business.phone}
              </a>
            )}
          </div>
        </div>

        {business.logoUrl ? (
          <div className="mt-16 overflow-hidden rounded-[4px] border border-slate-200">
            <div className="relative grid h-[640px] w-full place-items-center bg-white p-16">
              <img
                src={business.logoUrl}
                alt={`${business.name} logo`}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        ) : hero.image ? (
          <div className="mt-16 overflow-hidden rounded-[4px] border border-slate-200">
            <div className="relative">
              <img
                src={hero.image}
                alt={`${business.name} recent project`}
                className="h-[640px] w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/0 via-white/0 to-transparent" />
              <div className="absolute left-0 bottom-0 flex w-full items-end justify-between p-8">
                <div className="max-w-sm rounded-[2px] bg-white/95 p-5 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] backdrop-blur">
                  <div className="text-[9.5px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    Recent installation
                  </div>
                  <div className={`${serif} mt-1.5 text-lg font-medium leading-tight tracking-tight text-slate-950`}>
                    Full tear-off & replacement · {business.city ?? "local project"}
                  </div>
                </div>
                <div className="hidden rounded-[2px] bg-white/95 p-4 shadow-md backdrop-blur sm:block">
                  <div className="text-[9.5px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    Completed
                  </div>
                  <div className={`${serif} mt-1 text-2xl font-medium text-slate-950`}>
                    {String(new Date().getMonth() + 1).padStart(2, "0")}/{String(new Date().getFullYear()).slice(-2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ---------- Stats strip (minimal, inline) ---------- */

function StatsStrip({ business }: { business: RoofingSiteData["business"] }) {
  const stats = [
    { value: business.reviewsCount > 0 ? `${business.reviewsCount * 4}+` : "1,200+", label: "Projects completed" },
    { value: business.rating ? business.rating.toFixed(1) + "★" : "4.9★", label: "Average rating" },
    { value: business.yearsInBusiness ? `${business.yearsInBusiness}yrs` : "14yrs", label: "In business" },
    { value: "A+", label: "BBB accreditation" },
    { value: "100%", label: "Workmanship warranty" },
  ];
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1300px] grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white px-5 py-6 sm:px-8 sm:py-10">
            <div className={`${serif} text-4xl font-[400] tracking-tight text-slate-950 md:text-[2.75rem]`}>
              {s.value}
            </div>
            <div className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-500">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Services: editorial stack ---------- */

function ServicesEditorial({
  services,
  palette,
}: {
  services: RoofingSiteData["services"];
  palette: RoofingSiteData["palette"];
}) {
  return (
    <section id="services" className="relative border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1300px] px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:py-32">
        <SectionTitle
          numeral="01"
          eyebrow="Services"
          title={
            <>
              A complete practice<br />
              <em className="italic font-[400] r2-accent-em">for every kind of roof.</em>
            </>
          }
        />

        <div className="mt-16 border-t border-slate-200">
          {services.map((s, i) => (
            <article
              key={s.title}
              className="group grid grid-cols-1 items-center gap-10 border-b border-slate-200 py-10 md:grid-cols-[80px_1.2fr_1fr_auto] md:py-12"
            >
              <div className={`${serif} text-[13px] font-medium tracking-[0.18em] text-slate-400`}>
                0{i + 1}.
              </div>
              <div>
                <h3 className={`${serif} text-[clamp(1.75rem,3vw,2.5rem)] font-[400] leading-[1.05] tracking-[-0.015em] text-slate-950`}>
                  {s.title}
                </h3>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-slate-600">{s.body}</p>
              <a
                href="#consult"
                className="inline-flex items-center gap-1.5 self-center text-[13px] font-medium transition group-hover:gap-3"
                style={{ color: palette.accent }}
              >
                Discuss <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Case study ---------- */

function CaseStudy({ data }: { data: RoofingSiteData }) {
  const image = data.gallery[2] ?? data.gallery[0] ?? null;
  if (!image) return null;
  const pair =
    data.gallery.length >= 2
      ? {
          before: data.gallery[1].src,
          after: data.gallery[0].src,
          caption: "Before / After · Full tear-off",
          location: data.business.city ?? undefined,
        }
      : null;
  return (
    <section className="relative border-b border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-[1300px] gap-10 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:grid-cols-[1fr_1fr] lg:py-28">
        <div className="relative overflow-hidden rounded-[4px] border border-slate-200 bg-white">
          {pair ? (
            <BeforeAfterSlider pair={pair} accent={data.palette.accent} label="Drag" />
          ) : (
            <img
              src={image.src}
              alt={image.alt || "Case study"}
              className="aspect-[4/5] h-full w-full object-cover lg:aspect-auto"
            />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-slate-500">
            Selected project
          </div>
          <h2 className={`${serif} mt-5 text-[clamp(2rem,4vw,3.5rem)] font-[400] leading-[1.02] tracking-[-0.02em] text-slate-950`}>
            A full tear-off in 36 hours &mdash; <em className="italic">without the neighbors knowing.</em>
          </h2>
          <p className="mt-6 max-w-lg text-[15px] leading-[1.65] text-slate-600">
            A 3,200 sq. ft. residential replacement completed across two working days.
            Old asphalt down, synthetic underlayment, architectural shingle laid, ice &amp; water shield
            at every penetration. Magnet sweep of the driveway before we left.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-[2px] border border-slate-200 bg-slate-200 text-sm">
            <StatCell label="Scope" value="Full replacement" />
            <StatCell label="Timeline" value="36 hrs" />
            <StatCell label="Warranty" value="Lifetime" />
          </dl>
          <div className="mt-8">
            <WarrantyCallout accent={data.palette.accent} />
          </div>
          <a
            href="#work"
            className="mt-10 inline-flex items-center gap-2 self-start rounded-full border border-slate-900 px-6 py-3 text-[13px] font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white"
          >
            See more projects <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5">
      <div className="text-[9.5px] font-medium uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className={`${display.className} mt-1.5 text-xl font-[500] tracking-tight text-slate-950`}>{value}</div>
    </div>
  );
}

/* ---------- Process as numbered rail ---------- */

function ProcessRail({ steps, palette }: { steps: RoofingSiteData["process"]; palette: RoofingSiteData["palette"] }) {
  return (
    <section id="process" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1300px] px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:py-32">
        <SectionTitle
          numeral="02"
          eyebrow="Our process"
          title={<>Four steps. <em className="italic font-[400] r2-accent-em">Every project.</em></>}
        />
        <div className="mt-16 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.step} className="relative bg-white p-8">
              <div className="flex items-baseline justify-between">
                <div className={`${serif} text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500`}>
                  Step 0{i + 1}
                </div>
                <div className={`${serif} text-5xl font-[300] leading-none tracking-tight text-slate-200`}>
                  0{i + 1}
                </div>
              </div>
              <h3 className={`${serif} mt-8 text-xl font-[500] tracking-tight text-slate-950`}>
                {s.title}
              </h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Gallery editorial ---------- */

function GalleryEditorial({ images }: { images: RoofingSiteData["gallery"] }) {
  const items = images.slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section id="work" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1300px] px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:py-28">
        <SectionTitle
          numeral="03"
          eyebrow="Selected work"
          title={<>Documented, delivered, <em className="italic font-[400] r2-accent-em">warrantied.</em></>}
        />
        <div className="mt-16 grid gap-6 md:grid-cols-12">
          {items[0] && (
            <figure className="md:col-span-7">
              <div className="aspect-[4/3] overflow-hidden rounded-[4px] border border-slate-200 bg-white">
                <img src={items[0].src} alt={items[0].alt} className="h-full w-full object-cover" />
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between text-[11px] text-slate-500">
                <span className="font-medium uppercase tracking-[0.18em]">Project 01</span>
                <span>{items[0].alt || "Residential replacement"}</span>
              </figcaption>
            </figure>
          )}
          {items[1] && (
            <figure className="md:col-span-5">
              <div className="aspect-[4/5] overflow-hidden rounded-[4px] border border-slate-200 bg-white">
                <img src={items[1].src} alt={items[1].alt} className="h-full w-full object-cover" />
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between text-[11px] text-slate-500">
                <span className="font-medium uppercase tracking-[0.18em]">Project 02</span>
                <span>{items[1].alt || "Metal roof install"}</span>
              </figcaption>
            </figure>
          )}
          {items.slice(2, 4).map((item, i) => (
            <figure key={item.src + i} className="md:col-span-6">
              <div className="aspect-[16/10] overflow-hidden rounded-[4px] border border-slate-200 bg-white">
                <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between text-[11px] text-slate-500">
                <span className="font-medium uppercase tracking-[0.18em]">
                  Project 0{i + 3}
                </span>
                <span>{item.alt || "Recent work"}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Philosophy / About ---------- */

function Philosophy({
  about,
  business,
  palette,
}: {
  about: string;
  business: RoofingSiteData["business"];
  palette: RoofingSiteData["palette"];
}) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1300px] gap-10 px-4 py-16 sm:px-6 sm:py-20 md:gap-16 md:px-8 md:py-24 lg:grid-cols-[1fr_1.4fr] lg:py-32">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-slate-500">
            Philosophy
          </div>
          <h2 className={`${serif} mt-5 text-[clamp(2rem,4vw,3.25rem)] font-[300] leading-[1.02] tracking-[-0.025em] text-slate-950`}>
            We don't sell roofs &mdash;<br />
            <em className="italic font-[400] r2-accent-em">we document damage.</em>
          </h2>
        </div>
        <div>
          <p className={`${serif} text-[22px] font-[400] leading-[1.45] tracking-tight text-slate-800`}>
            {about}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 text-[12px] uppercase tracking-[0.18em] text-slate-500">
            <span>Licensed &bull; Bonded &bull; Insured</span>
            <span>Member of NRCA</span>
            <span>GAF Master Elite Certified</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Credentials band ---------- */

function Credentials({ palette }: { palette: RoofingSiteData["palette"] }) {
  const items = [
    "GAF Master Elite",
    "CertainTeed Select ShingleMaster",
    "Owens Corning Platinum",
    "HAAG Certified Inspector",
    "BBB A+ Accredited",
    "EPA Lead-Safe",
  ];
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1300px] px-4 py-10 sm:px-6 md:px-8 md:py-14">
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-slate-500">
            Certifications
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 sm:gap-x-10 sm:gap-y-4">
            {items.map((it) => (
              <div key={it} className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
                <Award className="h-3.5 w-3.5" style={{ color: palette.accent }} />
                {it}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials: editorial quote ---------- */

function TestimonialsEditorial({
  testimonials,
  palette,
}: {
  testimonials: RoofingSiteData["testimonials"];
  palette: RoofingSiteData["palette"];
}) {
  const [featured, ...rest] = testimonials;
  return (
    <section id="reviews" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1300px] px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:py-32">
        <SectionTitle
          numeral="04"
          eyebrow="Clients"
          title={<>The reviews, <em className="italic font-[400] r2-accent-em">in their words.</em></>}
        />

        <figure className="mt-16 border-y border-slate-200 py-16">
          <blockquote className={`${serif} mx-auto max-w-4xl text-center text-[clamp(1.75rem,3.2vw,2.75rem)] font-[300] leading-[1.25] tracking-[-0.02em] text-slate-900`}>
            &ldquo;{featured.quote}&rdquo;
          </blockquote>
          <figcaption className="mx-auto mt-10 flex items-center justify-center gap-4 text-[13px] text-slate-500">
            <span className="h-px w-10 bg-slate-300" />
            <span className="font-medium uppercase tracking-[0.22em] text-slate-700">{featured.author}</span>
            <span>&middot;</span>
            <span>{featured.location}</span>
            <span className="h-px w-10 bg-slate-300" />
          </figcaption>
        </figure>

        <div className="mt-16 grid gap-px border border-slate-200 bg-slate-200 md:grid-cols-2">
          {rest.map((t, i) => (
            <figure key={i} className="bg-white p-10">
              <div className={`${serif} text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-400`}>
                Review 0{i + 2}
              </div>
              <blockquote className={`${serif} mt-5 text-xl font-[400] leading-[1.4] tracking-tight text-slate-900`}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7 flex items-center justify-between text-[12px] text-slate-500">
                <span className="font-medium uppercase tracking-[0.18em] text-slate-800">{t.author}</span>
                <span>{t.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Coverage area ---------- */

function Coverage({
  cities,
  business,
}: {
  cities: string[];
  business: RoofingSiteData["business"];
}) {
  return (
    <section id="coverage" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1300px] px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:py-28">
        <SectionTitle
          numeral="05"
          eyebrow="Coverage"
          title={<>We work throughout <em className="italic font-[400] r2-accent-em">{business.state ?? "the region"}.</em></>}
        />
        <div className="mt-16 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-4">
          {cities.map((c, i) => (
            <div key={c} className="group flex items-baseline justify-between bg-white px-6 py-7">
              <div>
                <div className={`${serif} text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-400`}>
                  Area 0{i + 1}
                </div>
                <div className={`${serif} mt-2 text-lg font-[500] tracking-tight text-slate-950`}>
                  {c}
                </div>
              </div>
              <MapPin className="h-4 w-4 text-slate-300 transition group-hover:text-slate-600" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

function FAQEditorial({ faqs }: { faqs: RoofingSiteData["faqs"] }) {
  return (
    <section id="faq" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1300px] px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:py-28">
        <SectionTitle
          numeral="06"
          eyebrow="Frequently asked"
          title={<>Questions, <em className="italic font-[400] r2-accent-em">answered plainly.</em></>}
        />
        <div className="mt-14 divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((f, i) => (
            <details key={i} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                <div className="flex items-baseline gap-6">
                  <span className={`${display.className} text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400`}>
                    0{i + 1}
                  </span>
                  <span className={`${display.className} text-[clamp(1.15rem,1.7vw,1.35rem)] font-[500] tracking-tight text-slate-950`}>
                    {f.q}
                  </span>
                </div>
                <Plus className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-45" />
              </summary>
              <p className="ml-[calc(11px+1.5rem)] mt-4 max-w-3xl text-[14px] leading-relaxed text-slate-600">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Consult (quote form) ---------- */

function Consult({ data }: { data: RoofingSiteData }) {
  return (
    <section id="consult" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-[1300px] gap-10 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24 lg:grid-cols-[1fr_1fr] lg:py-32">
        <div>
          <SectionTitle
            numeral="07"
            eyebrow="Request a consultation"
            title={
              <>
                Let's look at <em className="italic font-[400] r2-accent-em">your roof together.</em>
              </>
            }
          />
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-slate-600">
            A licensed project manager will call within the hour to schedule an in-person visit.
            We'll document the condition, walk through options, and leave you with a written estimate &mdash;
            no obligation.
          </p>
          <div className="mt-10 space-y-4 border-t border-slate-200 pt-8 text-[13px]">
            <ContactLine icon={<Phone className="h-3.5 w-3.5" />} label="Call us" value={data.business.phone} />
            <ContactLine icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={data.business.email} />
            <ContactLine icon={<MapPin className="h-3.5 w-3.5" />} label="Office" value={data.business.address} />
            <ContactLine icon={<Clock className="h-3.5 w-3.5" />} label="Hours" value={data.business.hoursLine} />
          </div>
        </div>
        <div>
          <QuoteForm2 accent={data.palette.accent} businessSlug={data.slug} />
        </div>
      </div>
    </section>
  );
}

function ContactLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500">
        {icon}
      </div>
      <div>
        <div className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-500">
          {label}
        </div>
        <div className="mt-0.5 text-slate-800">{value}</div>
      </div>
    </div>
  );
}

/* ---------- Footer ---------- */

function FooterEditorial({
  business,
  socials,
  serviceArea,
  palette,
}: {
  business: RoofingSiteData["business"];
  socials: RoofingSiteData["socials"];
  serviceArea: string[];
  palette: RoofingSiteData["palette"];
}) {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-[1300px] px-4 py-14 sm:px-6 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              {business.logoUrl ? (
                <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-sm border border-slate-200 bg-white">
                  <img src={business.logoUrl} alt="logo" className="h-full w-full object-contain p-1" />
                </span>
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-sm border border-slate-900 bg-white">
                  <Hammer className="h-4 w-4 text-slate-900" />
                </span>
              )}
              <span className={`${display.className} text-xl font-[500] tracking-tight text-slate-950`}>
                {business.name}
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-slate-600">
              Licensed, bonded, and insured roofing contractor. Built on referrals and repeat clients.
            </p>
            <div className="mt-6 flex gap-2 text-slate-500">
              {socials.instagram && <Sq href={socials.instagram} icon={<Instagram className="h-3.5 w-3.5" />} />}
              {socials.facebook && <Sq href={socials.facebook} icon={<Facebook className="h-3.5 w-3.5" />} />}
              {socials.linkedin && <Sq href={socials.linkedin} icon={<Linkedin className="h-3.5 w-3.5" />} />}
              {socials.youtube && <Sq href={socials.youtube} icon={<Youtube className="h-3.5 w-3.5" />} />}
            </div>
          </div>

          <FooterCol title="Contact">
            {business.phone && <li>{business.phone}</li>}
            {business.email && <li>{business.email}</li>}
            {business.address && <li>{business.address}</li>}
            <li>{business.hoursLine}</li>
          </FooterCol>

          <FooterCol title="Services">
            <li>Residential roofing</li>
            <li>Commercial roofing</li>
            <li>Storm damage</li>
            <li>Leak repair</li>
            <li>Gutters</li>
            <li>Inspection</li>
          </FooterCol>

          <FooterCol title="Coverage">
            {serviceArea.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </FooterCol>
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-8 text-[11.5px] text-slate-500 md:flex-row md:items-center">
          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} {business.name}</span>
            <span>Licensed &amp; Insured</span>
          </div>
          <div className="flex items-center gap-5">
            {business.website && (
              <a href={business.website} className="hover:text-slate-900">
                {business.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <a href="#top" className="group inline-flex items-center gap-1 hover:text-slate-900">
              Back to top <ArrowRight className="h-3 w-3 -rotate-90" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-slate-500">
        {title}
      </div>
      <ul className="mt-4 space-y-2 text-[13px] text-slate-700">{children}</ul>
    </div>
  );
}

function Sq({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="grid h-9 w-9 place-items-center rounded-sm border border-slate-200 bg-white transition hover:border-slate-900 hover:text-slate-900"
    >
      {icon}
    </a>
  );
}

/* ---------- Shared: section title with numeral ---------- */

function SectionTitle({
  numeral,
  eyebrow,
  title,
}: {
  numeral: string;
  eyebrow: string;
  title: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 text-[10.5px] font-medium uppercase tracking-[0.24em] text-slate-500">
          <span className="r2-numeral font-semibold">{numeral}</span>
          <span className="r2-rule h-px w-10" />
          <span>{eyebrow}</span>
        </div>
        <h2 className={`${serif} mt-5 text-[clamp(2rem,4vw,3.5rem)] font-[300] leading-[1.02] tracking-[-0.02em] text-slate-950`}>
          {title}
        </h2>
      </div>
    </div>
  );
}
