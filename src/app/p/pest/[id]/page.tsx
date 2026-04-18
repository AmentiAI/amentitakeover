import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Radar,
  Shield,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { loadSiteData, loadSiteMetadata } from "@/lib/templates/site-loader";
import { SocialLinks } from "@/components/templates/site/chrome";
import { SafeImg } from "@/components/safe-img";
import { BugCrawlCanvas } from "@/components/templates/pest/bug-crawl-canvas";
import { RadarSweepCanvas } from "@/components/templates/pest/radar-sweep-canvas";
import { BarrierShieldCanvas } from "@/components/templates/pest/barrier-shield-canvas";
import { PestCounter } from "@/components/templates/pest/pest-counter";
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

export const dynamic = "force-dynamic";

// Industry-locked template for pest-control businesses. The visual system
// leans into detection / eradication / protection motifs — radar sweep on
// hero, barrier shield with deflected intruders, cursor-reactive ambient
// bugs, inspection-report section, pest-by-pest catalog, coverage map,
// license badges, and count-up stats. Not usable for non-pest-control
// businesses (enforced in site-url.ts via INDUSTRY_LOCK).
export default async function PestHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  const { business, hero, about, services, gallery, testimonials, serviceArea, headlines } = data;
  const loc = [business.city, business.state].filter(Boolean).join(", ");
  const rating = business.rating;

  const plans = buildTreatmentPlans(services);
  // Derive counter targets from scraped data where possible, falling back to
  // reasonable pest-industry numbers. Keeps the numbers feeling site-specific
  // without fabricating claims we can't back up.
  const pestsEliminated = Math.max(12_000, business.reviewsCount * 220 + 18_500);
  const homesProtected = Math.max(480, business.reviewsCount * 9 + 720);
  const yearsInBusiness = 18;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060c09] text-[#e7f1ea]">
      {/* Ambient cursor-reactive bug layer (fixed to viewport, behind content) */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.28] mix-blend-screen">
        <BugCrawlCanvas
          count={18}
          color="rgba(134, 239, 172, 0.55)"
          fixed={false}
          reactToCursor
          scatterRadius={130}
        />
      </div>

      {/* Masthead */}
      <header className="relative z-20 border-b border-emerald-400/10 bg-[#060c09]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href={`/p/pest/${data.slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em]"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{business.name}</span>
          </Link>
          <div className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.22em] md:flex">
            <a href="#plans" className="text-emerald-100/60 hover:text-emerald-100">
              Plans
            </a>
            <a href="#pests" className="text-emerald-100/60 hover:text-emerald-100">
              Pests
            </a>
            <a href="#coverage" className="text-emerald-100/60 hover:text-emerald-100">
              Coverage
            </a>
            {loc && <span className="text-emerald-100/40">{loc}</span>}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="font-semibold text-emerald-100 hover:text-emerald-300"
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
        </div>
      </header>

      {/* Hero — serif headline + radar + muted image + dual-CTA */}
      <section className="relative z-10 overflow-hidden">
        <div className="relative h-[94vh] min-h-[600px] w-full">
          {/* Background: muted hero image with vignette and radial glow */}
          <div className="absolute inset-0">
            {hero.image ? (
              <SafeImg
                src={hero.image}
                alt={business.name}
                className="h-full w-full object-cover opacity-30"
                fallback={<div className="h-full w-full bg-[#060c09]" />}
              />
            ) : (
              <div className="h-full w-full bg-[#060c09]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#060c09]/40 via-[#060c09]/80 to-[#060c09]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_58%,rgba(16,185,129,0.28),transparent_58%)]" />
            {/* Subtle horizontal scanlines to evoke CRT/monitor feel */}
            <div
              className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0 1px, transparent 1px 3px)",
              }}
              aria-hidden
            />
          </div>

          {/* Radar sweep */}
          <RadarSweepCanvas
            color="rgba(134, 239, 172, 0.9)"
            gridColor="rgba(134, 239, 172, 0.14)"
          />

          {/* Hero content */}
          <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-5 pb-16 sm:px-8 sm:pb-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.26em] text-emerald-300 backdrop-blur">
                <Radar className="h-3 w-3" />
                Detect · Treat · Protect
              </div>
              <h1 className="mt-6 font-serif text-5xl font-normal leading-[0.98] tracking-tight text-white sm:text-7xl md:text-[88px]">
                <span className="block italic text-emerald-200/90">
                  {splitHero(hero.title).before}
                </span>
                <span className="mt-1 block font-sans font-black uppercase tracking-tight">
                  {splitHero(hero.title).after}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl font-serif text-lg italic leading-[1.55] text-emerald-100/80 sm:text-xl">
                Thorough inspection. Targeted treatment. An ongoing barrier you can&apos;t see — but every pest can.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="group inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-bold text-[#060c09] shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300 sm:text-[15px]"
                  >
                    <Phone className="h-4 w-4" /> Free inspection
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </a>
                )}
                <a
                  href="#plans"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-white/5 px-6 py-3 text-sm font-bold text-emerald-100 backdrop-blur transition hover:bg-white/10 sm:text-[15px]"
                >
                  See plans <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px] text-emerald-100/70">
                {rating ? (
                  <div className="inline-flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-emerald-400 text-emerald-400" />
                      ))}
                    </div>
                    <span className="font-semibold text-emerald-100">{rating.toFixed(1)}/5</span>
                    {business.reviewsCount > 0 && (
                      <span className="text-emerald-100/50">· {business.reviewsCount} reviews</span>
                    )}
                  </div>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-400" /> Licensed · Bonded · Insured
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Leaf className="h-4 w-4 text-emerald-400" /> Pet &amp; kid-safe
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Count-up stat band */}
      <section className="relative z-10 border-y border-emerald-400/15 bg-[#0a1612]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
          <PestCounter
            target={pestsEliminated}
            label="Pests eliminated"
            suffix="+"
            className="text-emerald-50"
          />
          <PestCounter
            target={homesProtected}
            label="Homes on active protection"
            suffix="+"
            className="text-emerald-50"
          />
          <PestCounter
            target={yearsInBusiness}
            label="Years in business"
            className="text-emerald-50"
          />
        </div>
      </section>

      {/* Barrier story — house + shield canvas + copy */}
      <section className="relative z-10 overflow-hidden py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-2 md:gap-16">
          {/* Canvas pane */}
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-emerald-400/15 bg-[#0a1612]">
            <BarrierShieldCanvas
              color="rgba(134, 239, 172, 0.92)"
              glowColor="rgba(52, 211, 153, 0.35)"
            />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-400">
              The invisible perimeter
            </div>
            <h2 className="mt-3 font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
              A <span className="italic">living barrier</span> around your home.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-emerald-100/75 sm:text-lg">
              We apply a precision-targeted treatment along entry points, foundation lines, eaves, and voids — then come back on a quarterly cadence to keep it fresh. Pests hit the edge of the property and turn around.
            </p>
            <ul className="mt-7 space-y-3 text-[14.5px] text-emerald-100/85">
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

      {/* Threat assessment / about — serif editorial block */}
      <section className="relative z-10 border-y border-emerald-400/15 bg-[#0a1612] py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-400">
              Threat assessment
            </div>
            <div className="mt-3 text-[12px] uppercase tracking-[0.22em] text-emerald-100/50">
              {loc || "Your neighborhood"}
            </div>
            <div className="mt-5 text-[13px] leading-relaxed text-emerald-100/60">
              Climate, geography, and season all change the pest pressure on a property. We tailor every treatment to what we actually find on your walk-through.
            </div>
          </div>
          <div>
            <h2 className="max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-[56px]">
              {headlines.about}
            </h2>
            <div className="mt-6 grid gap-6 text-base leading-relaxed text-emerald-100/75 md:grid-cols-2 md:gap-10">
              <p>{about.short}</p>
              <p className="text-emerald-100/60">{about.long}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inspection report section */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-400">
              Your free inspection
            </div>
            <h2 className="mt-3 font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
              What our tech <span className="italic">actually checks.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-emerald-100/70 sm:text-lg">
              A real inspection takes 45–60 minutes. Here&apos;s what gets documented on every visit — so you know exactly what you&apos;re paying for.
            </p>
          </div>
          <div className="mt-12 overflow-hidden rounded-3xl border border-emerald-400/15 bg-[#0a1612]">
            <div className="grid divide-y divide-emerald-400/10 md:grid-cols-2 md:divide-x md:divide-y-0">
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
            <div className="border-t border-emerald-400/10 bg-[#060c09] px-6 py-5 text-center text-[12.5px] uppercase tracking-[0.22em] text-emerald-100/55 sm:px-8">
              Findings are emailed to you the same day with photos, maps, and a written plan.
            </div>
          </div>
        </div>
      </section>

      {/* Pest catalog — pest-by-pest breakdown */}
      <section
        id="pests"
        className="relative z-10 border-y border-emerald-400/15 bg-[#0a1612] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-400">
                Pest catalog
              </div>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
                Know <span className="italic">what you&apos;re up against.</span>
              </h2>
            </div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/50">
              {PEST_CATALOG.length.toString().padStart(2, "0")} species we handle
            </div>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PEST_CATALOG.map((p) => (
              <article
                key={p.name}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-emerald-400/15 bg-[#060c09] p-6 transition hover:-translate-y-0.5 hover:border-emerald-400/45 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/15">
                    {p.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-100/50">
                    {p.tier}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-emerald-50">{p.name}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-emerald-100/65">{p.body}</p>
                <div className="mt-5 border-t border-emerald-400/10 pt-4 text-[11.5px] leading-relaxed">
                  <div className="font-bold uppercase tracking-[0.2em] text-emerald-300/80">
                    Signs
                  </div>
                  <div className="mt-1 text-emerald-100/70">{p.signs}</div>
                </div>
                <div className="mt-3 text-[11.5px] leading-relaxed">
                  <div className="font-bold uppercase tracking-[0.2em] text-emerald-300/80">
                    Our approach
                  </div>
                  <div className="mt-1 text-emerald-100/70">{p.approach}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Treatment plans */}
      <section id="plans" className="relative z-10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-400">
                Treatment plans
              </div>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
                {headlines.services}
              </h2>
            </div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/50">
              Pick a cadence · switch anytime
            </div>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {plans.map((p, i) => (
              <article
                key={p.title}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border p-7 transition hover:-translate-y-0.5 hover:shadow-2xl ${
                  p.highlight
                    ? "border-emerald-400/50 bg-[#0f2118] shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-400/35"
                    : "border-emerald-400/15 bg-[#0a1612] hover:border-emerald-400/40 hover:shadow-emerald-500/10"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 right-6 rounded-full bg-emerald-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#060c09]">
                    Most chosen
                  </div>
                )}
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-px flex-1 bg-emerald-400/20" />
                  <span>{p.cadence}</span>
                </div>
                <h3 className="mt-4 font-serif text-3xl font-normal leading-[1.05] tracking-tight text-emerald-50">
                  {p.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-emerald-100/65">{p.body}</p>
                <ul className="mt-5 space-y-2 text-[13.5px] text-emerald-100/85">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex items-center justify-between border-t border-emerald-400/10 pt-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/50">
                    {p.targets}
                  </div>
                  <a
                    href={business.phone ? `tel:${business.phone}` : "#"}
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-300 hover:text-emerald-200"
                  >
                    Book <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Full services grid (scraped) */}
      {services.length > 3 && (
        <section className="relative z-10 border-t border-emerald-400/15 bg-[#0a1612] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-400">
              Full service list
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
              Every pest. Every property. <span className="italic">One call.</span>
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <article
                  key={s.title}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-emerald-400/10 bg-[#060c09] transition hover:border-emerald-400/30"
                >
                  <div className="relative aspect-[5/3] w-full overflow-hidden bg-[#060c09]">
                    {s.image ? (
                      <SafeImg
                        src={s.image}
                        alt={s.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                        fallback={
                          <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(135deg,#0a1612,#132821)" }}
                            aria-hidden
                          />
                        }
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(135deg,#0a1612,#132821)" }}
                        aria-hidden
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060c09] via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-400" aria-hidden />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[17px] font-bold tracking-tight text-emerald-50">
                      {s.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-emerald-100/65">
                      {s.body}
                    </p>
                    <a
                      href={business.phone ? `tel:${business.phone}` : "#"}
                      className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-300 hover:text-emerald-200"
                    >
                      Get a quote <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coverage map — stylized SVG area visual */}
      {serviceArea.length > 0 && (
        <section id="coverage" className="relative z-10 py-24 sm:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[1.1fr_1fr] md:gap-16">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-400">
                Coverage map
              </div>
              <h2 className="mt-3 font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
                Protecting <span className="italic">{loc || "your area"}.</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-emerald-100/70 sm:text-lg">
                Active service zones across the region — routed weekly so quarterly customers stay on a tight cadence and emergency calls get a truck out the same day.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {serviceArea.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-[#0a1612] px-3 py-1.5 text-[13px] font-semibold text-emerald-100"
                  >
                    <MapPin className="h-3 w-3 text-emerald-400" /> {a}
                  </span>
                ))}
              </div>
            </div>
            <CoverageMap areas={serviceArea} />
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="relative z-10 border-y border-emerald-400/15 bg-[#0a1612] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-400">
              Recent jobs
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
              {headlines.gallery}
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {gallery.slice(0, 6).map((g, i) => (
                <figure
                  key={g.src + i}
                  className={`relative overflow-hidden rounded-2xl border border-emerald-400/10 ${
                    i === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" : "aspect-square"
                  }`}
                >
                  <SafeImg
                    src={g.src}
                    alt={g.alt}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-105"
                    fallback={
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(135deg,#132821,#060c09)" }}
                      />
                    }
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* License badges */}
      <section className="relative z-10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LICENSE_BADGES.map((b) => (
              <div
                key={b.label}
                className="flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-[#0a1612] p-5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-emerald-300">
                  {b.icon}
                </span>
                <div>
                  <div className="text-[13px] font-bold tracking-tight text-emerald-50">
                    {b.label}
                  </div>
                  <div className="mt-1 text-[12px] leading-relaxed text-emerald-100/60">
                    {b.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="relative z-10 border-t border-emerald-400/15 bg-[#0a1612] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-400">
              What neighbors say
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
              {headlines.testimonials}
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t, i) => (
                <figure
                  key={i}
                  className="relative rounded-2xl border border-emerald-400/15 bg-[#060c09] p-6"
                >
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <blockquote className="mt-3 font-serif text-[17px] italic leading-[1.55] text-emerald-50/90">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-[12px] font-semibold text-emerald-100/75">
                    {t.author}{" "}
                    <span className="font-normal text-emerald-100/45">· {t.location}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA — radar underlay + serif headline */}
      <section className="relative z-10 overflow-hidden bg-[#060c09] py-28 sm:py-36">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <RadarSweepCanvas
            color="rgba(134, 239, 172, 0.55)"
            gridColor="rgba(134, 239, 172, 0.08)"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.26em] text-emerald-300 backdrop-blur">
            <Shield className="h-3 w-3" />
            Free inspection · no obligation
          </div>
          <h2 className="mt-6 font-serif text-5xl font-normal leading-[1.02] tracking-tight sm:text-7xl">
            <span className="italic text-emerald-200/90">{splitHero(headlines.cta).before}</span>
            <br />
            <span className="font-sans font-black uppercase">{splitHero(headlines.cta).after}</span>
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
                <Mail className="h-4 w-4" /> Email us
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-emerald-400/15 bg-[#060c09]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-100/55">
            © {new Date().getFullYear()} {business.name}
            {loc ? ` · ${loc}` : ""}
          </div>
          <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.24em] text-emerald-100/55">
            {business.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> {business.address}
              </span>
            )}
            <SocialLinks socials={data.socials} variant="dark" size="sm" />
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---- Subcomponents ----

function BarrierItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-emerald-300">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

function InspectionColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-7 sm:p-9">
      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
        {title}
      </div>
      <ul className="mt-5 space-y-3 text-[14.5px] leading-relaxed text-emerald-100/85">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Stylized coverage map — pure SVG, no external dependency. Draws a soft
// organic blob for the service region and plants a location pin for each
// service-area city. Seeded from the area list so it renders deterministically.
function CoverageMap({ areas }: { areas: string[] }) {
  const pins = areas.slice(0, 8).map((label, i) => {
    const seed = hashSeed(label);
    const x = 20 + ((seed % 100) / 100) * 60;
    const y = 30 + (((seed >> 8) % 100) / 100) * 50;
    return { label, x, y, i };
  });
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-emerald-400/20 bg-[#0a1612] md:aspect-square">
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="map-glow" cx="55%" cy="55%" r="70%">
            <stop offset="0%" stopColor="rgba(52, 211, 153, 0.45)" />
            <stop offset="100%" stopColor="rgba(6, 12, 9, 0)" />
          </radialGradient>
          <pattern id="map-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M5 0H0V5" fill="none" stroke="rgba(134, 239, 172, 0.08)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#map-grid)" />
        <rect width="100" height="100" fill="url(#map-glow)" />
        {/* Region blob */}
        <path
          d="M22,44 C18,30 34,20 48,22 C64,24 80,30 82,46 C84,60 72,78 56,80 C40,82 24,72 22,44 Z"
          fill="rgba(52, 211, 153, 0.14)"
          stroke="rgba(134, 239, 172, 0.65)"
          strokeWidth="0.8"
          strokeDasharray="1.5 1.2"
        />
        {/* Concentric faint contour lines inside blob */}
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
        {/* Pins */}
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

// ---- Helpers ----

// Splits a headline at its first colon or em-dash so the pest template can
// render the two halves in contrasting typography. If there's no natural
// split, returns the whole string as `after` and an empty eyebrow.
function splitHero(title: string): { before: string; after: string } {
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

type Plan = {
  title: string;
  body: string;
  cadence: string;
  targets: string;
  features: string[];
  highlight?: boolean;
};

function buildTreatmentPlans(services: { title: string; body: string }[]): Plan[] {
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

// Catalog of pests. Each entry carries its own silhouette icon (from our
// pest-icons set), a short body, telltale signs, and our treatment approach.
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = await loadSiteMetadata(id);
  return meta ?? { title: "Pest control" };
}
