import { Inter, JetBrains_Mono } from "next/font/google";
import {
  Zap,
  Plug,
  Lightbulb,
  BatteryCharging,
  ShieldAlert,
  Building2,
  Home,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Siren,
  Activity,
  CircuitBoard,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import type { ElectricalSiteData, ElectricalIcon } from "@/lib/templates/electrical";
import { ElectricalQuoteForm } from "./quote-form";

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const MONO = mono.className;

export function ElectricalTemplate({ data }: { data: ElectricalSiteData }) {
  const { business, hero, services, process, gallery, testimonials, serviceArea, faqs, socials, palette, about } = data;
  const phoneHref = business.phone ? `tel:${business.phone.replace(/[^\d+]/g, "")}` : "#consult";

  return (
    <div
      className={`${body.className} min-h-screen bg-white text-slate-900 antialiased`}
      style={{
        ["--el-accent" as string]: palette.accent,
        ["--el-base" as string]: palette.base,
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .el-accent-bg { background-color: var(--el-accent); }
          .el-accent-text { color: var(--el-accent); }
          .el-accent-border { border-color: var(--el-accent); }
          .el-accent-bg-soft { background-color: color-mix(in srgb, var(--el-accent) 14%, transparent); }
          .el-accent-border-soft { border-color: color-mix(in srgb, var(--el-accent) 40%, transparent); }
          .el-base-bg { background-color: var(--el-base); }
          .el-base-border { border-color: var(--el-base); }
        `,
      }} />
      <StatusBar business={business} phoneHref={phoneHref} />
      <Nav business={business} />

      <Hero data={data} phoneHref={phoneHref} />

      <SpecsStrip business={business} />

      <Services services={services} />

      <DispatchShowcase data={data} />

      <ProcessCircuit steps={process} />

      {gallery.length > 0 ? <WorkGallery images={gallery} /> : null}

      <CodeCompliance about={about} business={business} />

      <Credentials business={business} />

      <Reviews testimonials={testimonials} />

      <Coverage cities={serviceArea} business={business} />

      <FAQGrid faqs={faqs} />

      <Consult data={data} />

      <Footer business={business} socials={socials} serviceArea={serviceArea} />
    </div>
  );
}

/* ---------- Status bar (live feel) ---------- */

function StatusBar({ business, phoneHref }: { business: ElectricalSiteData["business"]; phoneHref: string }) {
  return (
    <div className="el-base-bg border-b border-black/30">
      <div className={`${MONO} mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 py-2 text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-white`}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-semibold text-emerald-300">On call</span>
          <span className="hidden text-white/40 sm:inline">·</span>
          <span className="hidden text-white/70 sm:inline">24/7 emergency electrician · Licensed master</span>
        </div>
        {business.phone && (
          <a href={phoneHref} className="flex items-center gap-1.5 font-semibold text-white transition hover:opacity-80">
            <Phone className="h-3 w-3" /> {business.phone}
          </a>
        )}
      </div>
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav({ business }: { business: ElectricalSiteData["business"] }) {
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4">
        <a href="#top" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          {business.logoUrl ? (
            <img src={business.logoUrl} alt={`${business.name} logo`} className="h-8 sm:h-9 w-auto object-contain" />
          ) : (
            <span className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-sm el-base-bg el-accent-text">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            </span>
          )}
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13px] sm:text-[14px] font-bold tracking-tight text-slate-950">
              {business.name}
            </span>
            <span className={`${MONO} truncate text-[8.5px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.22em] el-accent-text`}>
              {business.licenseNumber ?? "Licensed · Bonded · Insured"}
            </span>
          </div>
        </a>
        <div className="hidden items-center gap-7 text-[12px] font-medium text-slate-600 lg:flex">
          <a href="#services" className="transition hover:text-slate-950">Services</a>
          <a href="#dispatch" className="transition hover:text-slate-950">Dispatch</a>
          <a href="#process" className="transition hover:text-slate-950">Process</a>
          <a href="#credentials" className="transition hover:text-slate-950">Credentials</a>
          <a href="#faq" className="transition hover:text-slate-950">FAQ</a>
        </div>
        <a
          href="#consult"
          className="inline-flex shrink-0 items-center gap-1 sm:gap-1.5 rounded-sm el-base-bg px-3 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold text-white transition hover:opacity-90"
        >
          <span className="hidden sm:inline">Request dispatch</span>
          <span className="sm:hidden">Dispatch</span>
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </nav>
  );
}

/* ---------- Hero ---------- */

function Hero({ data, phoneHref }: { data: ElectricalSiteData; phoneHref: string }) {
  const { hero, business } = data;
  return (
    <section id="top" className="relative overflow-hidden border-b border-slate-200 bg-white">
      <CircuitBackdrop />
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ backgroundColor: data.palette.accent, opacity: 0.1 }}
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full blur-3xl"
        style={{ backgroundColor: data.palette.base, opacity: 0.08 }}
      />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 pb-16 pt-10 sm:pb-24 sm:pt-16 lg:pb-32 lg:pt-20">
        <div className="grid gap-10 sm:gap-14 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <div className={`${MONO} mb-6 sm:mb-8 inline-flex items-center gap-2 border el-accent-border-soft el-accent-bg-soft el-accent-text px-3 py-1.5 text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.2em] sm:tracking-[0.24em]`}>
              <Activity className="h-3 w-3" />
              <span className="truncate max-w-[70vw] sm:max-w-none">
                {business.licenseNumber ?? "MASTER ELECTRICIAN"} · NEC 2023
              </span>
            </div>

            <h1 className="max-w-3xl text-[clamp(2.25rem,7vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-slate-950">
              {hero.title}
            </h1>

            <p className="mt-6 sm:mt-8 max-w-xl text-[14.5px] sm:text-[15px] leading-[1.65] text-slate-600">
              {hero.subtitle}
            </p>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#consult"
                className="group inline-flex items-center gap-2 el-base-bg px-5 sm:px-7 py-3.5 sm:py-4 text-[12.5px] sm:text-[13px] font-bold text-white transition hover:opacity-90"
              >
                <Zap className="h-4 w-4 el-accent-text" strokeWidth={2.5} />
                Request dispatch
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              {business.phone && (
                <a
                  href={phoneHref}
                  className="inline-flex items-center gap-2 border border-slate-300 bg-white px-5 sm:px-7 py-3.5 sm:py-4 text-[12.5px] sm:text-[13px] font-semibold text-slate-950 transition hover:border-slate-950"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {business.phone}
                </a>
              )}
            </div>
          </div>

          <LogoPanel business={business} hero={hero} />
        </div>
      </div>
    </section>
  );
}

function CircuitBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--el-accent) 1px, transparent 1px), linear-gradient(to bottom, var(--el-accent) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
      }}
    />
  );
}

/* ---------- Logo panel (first image slot = company logo) ---------- */

function LogoPanel({
  business,
  hero,
}: {
  business: ElectricalSiteData["business"];
  hero: ElectricalSiteData["hero"];
}) {
  const hasLogo = Boolean(business.logoUrl);
  return (
    <div className="relative">
      <div className="absolute -right-2 -top-2 sm:-right-3 sm:-top-3 h-full w-full border el-accent-border-soft" />
      <div className="relative border border-slate-200 bg-white">
        <div className="grid h-[280px] sm:h-[360px] lg:h-[420px] w-full place-items-center bg-white p-6 sm:p-10 lg:p-12">
          {hasLogo ? (
            <img
              src={business.logoUrl ?? undefined}
              alt={`${business.name} logo`}
              className="h-full w-full object-contain"
            />
          ) : hero.image ? (
            <img
              src={hero.image}
              alt={`${business.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-sm el-base-bg el-accent-text">
                <Zap className="h-8 w-8" strokeWidth={2.5} />
              </span>
              <div className={`${MONO} mt-5 text-[10px] uppercase tracking-[0.24em] text-slate-500`}>
                {business.name}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className={`${MONO} text-[9.5px] font-semibold uppercase tracking-[0.22em] text-emerald-700`}>
              DISPATCH · LIVE
            </span>
          </div>
          <span className={`${MONO} text-[9.5px] uppercase tracking-[0.22em] text-slate-500`}>
            {business.city ?? "METRO"} · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Specs strip (monospace rolodex) ---------- */

function SpecsStrip({ business }: { business: ElectricalSiteData["business"] }) {
  const items = [
    { label: "LICENSED", value: business.licenseNumber?.split("-").pop() ?? "MASTER" },
    { label: "CODE", value: "NEC 2023" },
    { label: "RATED", value: business.rating ? `${business.rating.toFixed(1)}★` : "5.0★" },
    { label: "REVIEWS", value: business.reviewsCount > 0 ? `${business.reviewsCount}` : "250+" },
    { label: "INSURED", value: "$2M GL" },
    { label: "RESPONSE", value: "24/7" },
  ];
  return (
    <section className="el-base-bg border-b border-slate-200 text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 divide-x divide-white/10 md:grid-cols-3 lg:grid-cols-6">
        {items.map((it) => (
          <div key={it.label} className="px-4 sm:px-5 py-4 sm:py-6">
            <div className={`${MONO} text-[9px] sm:text-[9.5px] uppercase tracking-[0.2em] sm:tracking-[0.24em] el-accent-text`}>
              {it.label}
            </div>
            <div className={`${MONO} mt-1.5 sm:mt-2 text-base sm:text-lg font-bold text-white`}>
              {it.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Services ---------- */

function Services({ services }: { services: ElectricalSiteData["services"] }) {
  return (
    <section id="services" className="relative border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:py-28">
        <SectionHead
          numeral="01"
          eyebrow="Service catalog"
          title="Every circuit, every service class."
          kicker="From residential service upgrades to commercial three-phase. All permitted, all inspected."
        />
        <div className="mt-10 sm:mt-14 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <article
              key={s.title}
              className="group relative bg-white p-5 sm:p-7 transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center border el-accent-border-soft el-accent-bg-soft el-accent-text">
                  <ServiceGlyph kind={s.icon} />
                </span>
                <span className={`${MONO} text-[10px] uppercase tracking-[0.22em] text-slate-300`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 sm:mt-7 text-base sm:text-lg font-bold tracking-tight text-slate-950">{s.title}</h3>
              <p className="mt-2 text-[13px] sm:text-[13.5px] leading-relaxed text-slate-600">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceGlyph({ kind }: { kind: ElectricalIcon }) {
  const props = { className: "h-5 w-5", strokeWidth: 2 } as const;
  switch (kind) {
    case "residential": return <Home {...props} />;
    case "commercial": return <Building2 {...props} />;
    case "panel": return <Gauge {...props} />;
    case "ev": return <BatteryCharging {...props} />;
    case "generator": return <Zap {...props} />;
    case "lighting": return <Lightbulb {...props} />;
    case "emergency": return <Siren {...props} />;
    case "surge": return <ShieldAlert {...props} />;
    default: return <Plug {...props} />;
  }
}

/* ---------- Dispatch showcase (spec sheet) ---------- */

function DispatchShowcase({ data }: { data: ElectricalSiteData }) {
  const { business, gallery } = data;
  const image = gallery[0] ?? null;
  return (
    <section id="dispatch" className="relative border-b border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-[1400px] gap-0 px-0 md:grid-cols-[1.1fr_1fr]">
        <div className="relative border-b border-slate-200 bg-white p-6 sm:p-10 md:border-b-0 md:border-r md:p-14">
          <SectionHead
            numeral="02"
            eyebrow="Typical work order"
            title="100A → 200A panel upgrade."
          />
          <p className="mt-6 sm:mt-8 max-w-md text-[14px] sm:text-[14.5px] leading-relaxed text-slate-600">
            Old 60A fuse panel retired. New 200A service entrance, new ground rod pair,
            AFCI/GFCI breakers throughout, bonded, inspected, utility reconnected same day.
          </p>

          <div className="mt-8 sm:mt-10 border border-slate-200">
            <SpecRow k="Service" v="200A" />
            <SpecRow k="Breakers" v="AFCI / GFCI" />
            <SpecRow k="Ground" v="Dual rod · bonded" />
            <SpecRow k="Code" v="NEC 2023" />
            <SpecRow k="Permit" v="Pulled · inspected" />
            <SpecRow k="Timeline" v="1 working day" last />
          </div>
        </div>

        <div className="relative min-h-[260px] sm:min-h-[360px] bg-slate-100">
          {image ? (
            <img src={image.src} alt={image.alt || "Panel upgrade"} className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <CircuitBoard className="mx-auto h-16 w-16 el-accent-text opacity-60" strokeWidth={1.5} />
                <div className={`${MONO} mt-4 text-[10px] uppercase tracking-[0.24em] text-slate-500`}>
                  {business.name}
                </div>
              </div>
            </div>
          )}
          <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
            <span className={`${MONO} border el-accent-border bg-white/90 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.22em] el-accent-text`}>
              WO #04210
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecRow({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between px-4 py-3 ${last ? "" : "border-b border-slate-200"}`}>
      <span className={`${MONO} text-[10.5px] uppercase tracking-[0.2em] text-slate-500`}>{k}</span>
      <span className={`${MONO} text-[13px] font-semibold text-slate-950`}>{v}</span>
    </div>
  );
}

/* ---------- Process (circuit diagram) ---------- */

function ProcessCircuit({ steps }: { steps: ElectricalSiteData["process"] }) {
  return (
    <section id="process" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:py-28">
        <SectionHead
          numeral="03"
          eyebrow="Dispatch protocol"
          title="Four steps. Every call."
        />
        <div className="relative mt-10 sm:mt-16">
          <div
            className="absolute left-0 right-0 top-[44px] hidden h-px md:block"
            style={{ background: "linear-gradient(to right, transparent, var(--el-accent), transparent)" }}
          />
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="relative mx-auto grid h-[72px] w-[72px] sm:h-[88px] sm:w-[88px] place-items-center border el-accent-border-soft bg-white">
                  <span className={`${MONO} text-xl sm:text-2xl font-bold el-accent-text`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute -top-1 -right-1 h-2 w-2 el-accent-bg" />
                  <span className="absolute -bottom-1 -left-1 h-2 w-2 el-accent-bg" />
                </div>
                <h3 className="mt-5 sm:mt-6 text-center text-base sm:text-lg font-bold tracking-tight text-slate-950">
                  {s.title}
                </h3>
                <p className="mt-2 text-center text-[13px] leading-relaxed text-slate-600">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Work gallery (grid w/ overlay) ---------- */

function WorkGallery({ images }: { images: ElectricalSiteData["gallery"] }) {
  const items = images.slice(0, 6);
  return (
    <section id="work" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:py-28">
        <SectionHead
          numeral="04"
          eyebrow="Field log"
          title="Work documented, wire by wire."
        />
        <div className="mt-10 sm:mt-14 grid gap-3 sm:grid-cols-2 md:grid-cols-6">
          {items.map((img, i) => (
            <figure
              key={img.src + i}
              className={`group relative overflow-hidden border border-slate-200 bg-white ${
                i === 0 ? "md:col-span-4 md:row-span-2" : "md:col-span-2"
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] aspect-[4/3]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <figcaption className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <span className={`${MONO} text-[9.5px] font-semibold uppercase tracking-[0.22em] el-accent-text`}>
                  JOB · {String(i + 1).padStart(3, "0")}
                </span>
                <span className={`${MONO} truncate text-[9.5px] uppercase tracking-[0.18em] text-white/80`}>
                  {img.alt?.slice(0, 28) || "Field work"}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Code compliance (philosophy reframed) ---------- */

function CodeCompliance({ about, business }: { about: string; business: ElectricalSiteData["business"] }) {
  return (
    <section className="relative border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <div>
            <SectionHead numeral="05" eyebrow="Code compliance" title="We don't cut corners on code." />
          </div>
          <div className="space-y-5 border-l-0 pl-0 sm:space-y-6 lg:border-l lg:border-slate-200 lg:pl-8">
            <p className="text-[14.5px] sm:text-[15.5px] leading-[1.7] text-slate-700">{about}</p>
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              {[
                "NEC 2023 current",
                "Permits always pulled",
                "AFCI + GFCI standard",
                "Torque-spec documented",
                "Photo report every job",
                "Written workmanship warranty",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2 text-[13px] text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 el-accent-text" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Credentials ---------- */

function Credentials({ business }: { business: ElectricalSiteData["business"] }) {
  const items = [
    { label: "Master", value: "Electrician" },
    { label: "License", value: business.licenseNumber?.slice(-8) ?? "EC-84212" },
    { label: "NEC", value: "2023 cycle" },
    { label: "IBEW", value: "Member" },
    { label: "Tesla", value: "Certified" },
    { label: "BBB", value: "A+" },
    { label: "ESFI", value: "Partner" },
    { label: "Bond", value: "$2M GL" },
  ];
  return (
    <section id="credentials" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:py-28">
        <SectionHead numeral="06" eyebrow="Credentials" title="Papers on file. Verifiable." />
        <div className="mt-10 sm:mt-14 grid grid-cols-2 gap-px border border-slate-200 bg-slate-200 md:grid-cols-4">
          {items.map((it) => (
            <div key={it.label} className="bg-white p-4 sm:p-6">
              <div className={`${MONO} text-[9.5px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.24em] el-accent-text`}>
                {it.label}
              </div>
              <div className={`${MONO} mt-2 sm:mt-3 text-base sm:text-lg font-bold text-slate-950`}>{it.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Reviews ---------- */

function Reviews({ testimonials }: { testimonials: ElectricalSiteData["testimonials"] }) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:py-28">
        <SectionHead numeral="07" eyebrow="Field reviews" title="What customers say afterwards." />
        <div className="mt-10 sm:mt-14 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <blockquote
              key={i}
              className="relative flex flex-col border border-slate-200 bg-white p-5 sm:p-7 shadow-[0_1px_0_rgba(15,23,42,0.03)]"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <span key={s} className="text-amber-500">★</span>
                ))}
              </div>
              <p className="mt-4 sm:mt-5 flex-1 text-[14px] sm:text-[14.5px] leading-relaxed text-slate-800">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-5 sm:mt-6 flex items-center justify-between gap-2 border-t border-slate-200 pt-4">
                <span className={`${MONO} truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-950`}>
                  {t.author}
                </span>
                <span className={`${MONO} shrink-0 text-[9.5px] uppercase tracking-[0.22em] el-accent-text opacity-80`}>
                  {t.location}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Coverage ---------- */

function Coverage({ cities, business }: { cities: string[]; business: ElectricalSiteData["business"] }) {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-14 lg:py-28">
        <div>
          <SectionHead numeral="08" eyebrow="Service area" title="Who we dispatch to." />
        </div>
        <div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-l-0 pl-0 sm:gap-x-8 md:grid-cols-3 lg:border-l lg:border-slate-200 lg:pl-8">
            {cities.map((c) => (
              <div key={c} className="flex items-center gap-2 text-[13px] sm:text-[13.5px] text-slate-700">
                <MapPin className="h-3.5 w-3.5 shrink-0 el-accent-text" />
                <span className="truncate">{c}</span>
              </div>
            ))}
          </div>
          {business.phone && (
            <div className={`${MONO} mt-8 sm:mt-10 flex items-center gap-2 border-l-0 pl-0 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-slate-500 lg:border-l lg:border-slate-200 lg:pl-8`}>
              <Clock className="h-3 w-3 shrink-0 el-accent-text" />
              <span className="truncate">Not listed? Call dispatch: {business.phone}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

function FAQGrid({ faqs }: { faqs: ElectricalSiteData["faqs"] }) {
  return (
    <section id="faq" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:py-28">
        <SectionHead numeral="09" eyebrow="Common questions" title="Answered before you ask." />
        <div className="mt-10 sm:mt-14 grid gap-px border border-slate-200 bg-slate-200 md:grid-cols-2">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group bg-white p-5 sm:p-7 transition hover:bg-slate-50"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 sm:gap-4">
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <span className={`${MONO} shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] el-accent-text`}>
                    Q.{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[14px] sm:text-[15px] font-semibold text-slate-950">{f.q}</span>
                </div>
                <PlusIcon className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-45" />
              </summary>
              <p className="mt-3 pl-0 sm:mt-4 sm:pl-10 text-[13px] sm:text-[13.5px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Consult ---------- */

function Consult({ data }: { data: ElectricalSiteData }) {
  const { business, palette } = data;
  return (
    <section id="consult" className="relative overflow-hidden border-b border-slate-200 bg-white">
      <CircuitBackdrop />
      <div className="relative mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:py-28">
        <div className="flex flex-col justify-center">
          <div className={`${MONO} inline-flex w-fit items-center gap-2 border border-emerald-600/40 bg-emerald-50 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.24em] text-emerald-700`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            On call · accepting dispatches
          </div>
          <h2 className="mt-5 sm:mt-6 max-w-xl text-[clamp(1.875rem,5vw,4rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-slate-950">
            Something sparking, tripping, or dead?
          </h2>
          <p className="mt-5 sm:mt-6 max-w-md text-[14.5px] sm:text-[15px] leading-relaxed text-slate-600">
            Request a licensed electrician. Same-day dispatch in {business.city ?? "your area"}.
          </p>
          {business.phone && (
            <div className="mt-8 sm:mt-10 flex items-center gap-3 border-t border-slate-200 pt-5 sm:pt-6">
              <Phone className="h-4 w-4 shrink-0 el-accent-text" />
              <div className="min-w-0">
                <div className={`${MONO} text-[9.5px] uppercase tracking-[0.22em] text-slate-500`}>
                  Direct line
                </div>
                <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} className="text-base sm:text-lg font-bold text-slate-950 transition hover:opacity-80">
                  {business.phone}
                </a>
              </div>
            </div>
          )}
        </div>
        <div>
          <ElectricalQuoteForm accent={palette.accent} businessSlug={data.slug} />
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer({ business, socials, serviceArea }: { business: ElectricalSiteData["business"]; socials: ElectricalSiteData["socials"]; serviceArea: string[] }) {
  return (
    <footer className="el-base-bg text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              {business.logoUrl ? (
                <img src={business.logoUrl} alt="logo" className="h-8 w-auto object-contain invert" />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-sm el-accent-bg text-black">
                  <Zap className="h-4 w-4" strokeWidth={2.5} />
                </span>
              )}
              <span className="text-[15px] font-bold text-white">{business.name}</span>
            </div>
            <p className={`${MONO} mt-3 max-w-sm text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/50`}>
              {business.licenseNumber ?? "Licensed · Bonded · Insured"}
            </p>
            {business.address && (
              <div className="mt-5 flex items-start gap-2 text-[13px] text-white/70">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 el-accent-text" />
                <span>{business.address}</span>
              </div>
            )}
            {business.phone && (
              <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} className="mt-2 flex items-center gap-2 text-[13px] text-white/70 transition hover:text-white">
                <Phone className="h-3.5 w-3.5 shrink-0 el-accent-text" />
                {business.phone}
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="mt-1 flex items-center gap-2 text-[13px] text-white/70 transition hover:text-white">
                <Mail className="h-3.5 w-3.5 shrink-0 el-accent-text" />
                <span className="truncate">{business.email}</span>
              </a>
            )}
          </div>
          <div>
            <div className={`${MONO} text-[10px] uppercase tracking-[0.22em] el-accent-text`}>Services</div>
            <ul className="mt-3 sm:mt-4 space-y-2 text-[13px] text-white/70">
              <li>Panel upgrades</li>
              <li>EV chargers</li>
              <li>Whole-home rewires</li>
              <li>Generators</li>
              <li>24/7 emergency</li>
            </ul>
          </div>
          <div>
            <div className={`${MONO} text-[10px] uppercase tracking-[0.22em] el-accent-text`}>Coverage</div>
            <ul className="mt-3 sm:mt-4 space-y-2 text-[13px] text-white/70">
              {serviceArea.slice(0, 5).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-5 sm:pt-6 text-[11px] text-white/50 md:flex-row md:items-center">
          <div className={MONO}>
            © {new Date().getFullYear()} {business.name} · All rights reserved
          </div>
          <div className="flex items-center gap-4">
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {socials.facebook && (
              <a href={socials.facebook} target="_blank" rel="noreferrer" className="hover:text-white">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-white">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {socials.youtube && (
              <a href={socials.youtube} target="_blank" rel="noreferrer" className="hover:text-white">
                <Youtube className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Shared section head ---------- */

function SectionHead({
  numeral,
  eyebrow,
  title,
  kicker,
}: {
  numeral: string;
  eyebrow: string;
  title: string;
  kicker?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3 sm:gap-4">
        <span className={`${MONO} text-[10px] font-semibold uppercase tracking-[0.22em] sm:tracking-[0.24em] el-accent-text`}>
          {numeral}
        </span>
        <span className={`${MONO} text-[10px] uppercase tracking-[0.22em] sm:tracking-[0.24em] text-slate-500`}>
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-4 sm:mt-5 max-w-3xl text-[clamp(1.75rem,4.2vw,3.75rem)] font-extrabold leading-[1] tracking-[-0.025em] text-slate-950">
        {title}
      </h2>
      {kicker ? (
        <p className="mt-4 sm:mt-5 max-w-xl text-[14px] sm:text-[14.5px] leading-relaxed text-slate-600">{kicker}</p>
      ) : null}
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" strokeWidth={2} stroke="currentColor">
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  );
}
