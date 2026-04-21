import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { SafeImg } from "@/components/safe-img";
import { StormCanvas } from "@/components/templates/roofing/storm-canvas";
import { RoofCounter } from "@/components/templates/roofing/roof-counter";
import {
  FlatRoofIcon,
  HammerBadgeIcon,
  MetalRoofIcon,
  ShingleIcon,
  TileRoofIcon,
} from "@/components/templates/roofing/roof-icons";
import type { SiteData } from "@/lib/templates/site";

// ---------- Hero callout (CTAs that live inside the hero banner) ----------

export function RoofingHeroCtas({
  business,
  rating,
  reviewsCount,
}: {
  business: SiteData["business"];
  rating: number | null;
  reviewsCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {business.phone && (
        <a
          href={`tel:${business.phone}`}
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#0b1220] shadow-[0_0_0_1px_rgba(251,191,36,0.6),0_12px_32px_-10px_rgba(251,191,36,0.5)] transition hover:bg-amber-300"
        >
          <Phone className="h-4 w-4" />
          Free inspection
        </a>
      )}
      <a
        href="#warranty"
        className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-100 hover:border-amber-400/60 hover:text-amber-300"
      >
        See warranty tiers <ArrowRight className="h-4 w-4" />
      </a>
      {rating != null && (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
          {rating.toFixed(1)} · {reviewsCount.toLocaleString()} reviews
        </span>
      )}
    </div>
  );
}

// ---------- Stat band ----------

export function RoofStatBand({
  reviewsCount,
}: {
  reviewsCount: number;
}) {
  const roofsInstalled = Math.max(320, reviewsCount * 6 + 480);
  const sqFtReplaced = Math.max(1_800_000, reviewsCount * 4_200 + 2_100_000);
  const warrantyYears = 50;
  return (
    <section className="relative border-y border-slate-800/80 bg-[#0a111d]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
        <RoofCounter target={roofsInstalled} label="Roofs installed" />
        <RoofCounter
          target={sqFtReplaced}
          label="Sq ft replaced"
          duration={2600}
        />
        <RoofCounter target={warrantyYears} label="Year material warranty" suffix=" yr" />
      </div>
    </section>
  );
}

// ---------- Resilience editorial (why-it-matters) ----------

const RESILIENCE_POINTS: { label: string; body: string }[] = [
  {
    label: "Wind-rated fastening",
    body: "Six-nail patterns and starter-strip adhesion sealed to manufacturer uplift specs — not contractor shortcuts.",
  },
  {
    label: "Proper flashing",
    body: "Step-flashing and counter-flashing at every transition — chimneys, sidewalls, skylights, valleys.",
  },
  {
    label: "Balanced ventilation",
    body: "Ridge + soffit intake calculated for attic volume so deck temps stay in spec year-round.",
  },
  {
    label: "Ice + water protection",
    body: "Self-adhering membrane at eaves, valleys, and around penetrations to prevent dam-driven leaks.",
  },
];

export function ResilienceEditorial({
  gallery,
  businessName,
}: {
  gallery: SiteData["gallery"];
  businessName: string;
}) {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1.1fr_1fr] md:py-24">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
            Why it matters
          </p>
          <h2 className="mt-4 font-serif text-[36px] leading-[1.05] tracking-tight text-slate-50 sm:text-[46px]">
            A roof is <span className="italic text-amber-300">the one system</span> you
            never want to think about twice.
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-400">
            Wind-lifted shingles, under-driven nails, missing flashing, and ice
            dams rarely fail on sunny days — they fail in the storms you don&apos;t
            see coming. We build for the weather you can&apos;t predict with
            manufacturer-certified installers and written workmanship warranties.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {RESILIENCE_POINTS.map((p) => (
              <li
                key={p.label}
                className="flex gap-3 border-l-2 border-amber-400/60 pl-4"
              >
                <div className="text-slate-300">
                  <div className="text-[13px] font-bold uppercase tracking-[0.18em] text-slate-100">
                    {p.label}
                  </div>
                  <div className="mt-1 text-[13px] leading-relaxed text-slate-400">
                    {p.body}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-slate-800">
            {gallery[0]?.src ? (
              <SafeImg
                src={gallery[0].src}
                alt={gallery[0].alt || `${businessName} installation`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/50 to-transparent p-6">
              <p className="font-serif text-[15px] italic text-slate-200">
                &ldquo;Our crews treat every deck like it&apos;s going to carry
                a generation of weather.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Inspection report ----------

export function InspectionReport() {
  return (
    <section className="relative border-y border-slate-800/80 bg-[#0a111d]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
              Inspection report
            </p>
            <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-tight text-slate-50 sm:text-[40px]">
              What a <span className="italic">free roof assessment</span> covers.
            </h2>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-slate-400">
            Every inspection delivers a written report with photos, rated
            deficiencies, and a scoped estimate — no pressure to buy.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <InspectionColumn
            title="Exterior + structural"
            items={[
              "Shingle / tile / membrane course integrity",
              "Flashing at chimneys, sidewalls, and valleys",
              "Ridge, hip, and soffit ventilation balance",
              "Gutter pitch, apron, and downspout tie-in",
              "Fascia, drip edge, and eave protection",
            ]}
          />
          <InspectionColumn
            title="Interior + attic"
            items={[
              "Decking soundness and fastener hold",
              "Attic moisture, mold, and insulation depth",
              "Penetration seals: vents, stacks, skylights",
              "Underlayment condition + ice/water shield",
              "Daylight visibility and nail-pop survey",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function InspectionColumn({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex items-center gap-3">
        <HammerBadgeIcon size={22} />
        <h3 className="text-[14px] font-bold uppercase tracking-[0.14em] text-slate-100">
          {title}
        </h3>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[13.5px] leading-relaxed text-slate-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Material catalog ----------

type MaterialEntry = {
  label: string;
  body: string;
  lifespan: string;
  tags: string[];
  icon: React.ReactNode;
};

const MATERIAL_CATALOG: MaterialEntry[] = [
  {
    label: "Architectural shingle",
    body: "Dimensional asphalt shingles — the workhorse for pitched residential roofs across most climates.",
    lifespan: "25–50 yr",
    tags: ["Residential", "Pitched ≥ 4/12"],
    icon: <ShingleIcon size={26} />,
  },
  {
    label: "Standing-seam metal",
    body: "Vertically-seamed steel or aluminum panels. Best for modern silhouettes, snow country, and coastal spray.",
    lifespan: "40–70 yr",
    tags: ["Residential", "Snow load", "Coastal"],
    icon: <MetalRoofIcon size={26} />,
  },
  {
    label: "Clay or concrete tile",
    body: "Mediterranean and Southwestern silhouettes. Non-combustible and thermally efficient in hot climates.",
    lifespan: "50+ yr",
    tags: ["Residential", "Hot climate"],
    icon: <TileRoofIcon size={26} />,
  },
  {
    label: "Flat / low-slope",
    body: "TPO, EPDM, and modified-bituminous membranes for low-slope commercial, multi-family, and residential additions.",
    lifespan: "20–30 yr",
    tags: ["Commercial", "Multi-family"],
    icon: <FlatRoofIcon size={26} />,
  },
];

export function MaterialCatalog() {
  return (
    <section id="materials" className="relative">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
              Materials we install
            </p>
            <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-tight text-slate-50 sm:text-[40px]">
              Four roof systems, <span className="italic">matched to the building.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-slate-400">
            We don&apos;t push one product. Climate, pitch, and intended
            lifespan drive the spec — not margin.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIAL_CATALOG.map((m) => (
            <article
              key={m.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/70 to-[#0a111d] p-6 transition hover:border-amber-400/40"
            >
              <div className="text-amber-300">{m.icon}</div>
              <h3 className="mt-5 text-[17px] font-bold text-slate-50">{m.label}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                {m.body}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {m.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-slate-700 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/85">
                Rated {m.lifespan}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Warranty plans ----------

export function buildWarrantyPlans() {
  return [
    {
      tier: "Entry",
      name: "Standard install",
      blurb:
        "Manufacturer-spec shingle replacement with code-minimum underlayment and ventilation.",
      features: [
        "Architectural asphalt shingles",
        "15# or synthetic underlayment",
        "Ridge-and-soffit ventilation audit",
        "5-year workmanship warranty",
      ],
      duration: "25-yr material · 5-yr workmanship",
      highlight: false,
    },
    {
      tier: "Preferred",
      name: "Premium system",
      blurb:
        "Full weather-proof system with ice-and-water shield, upgraded shingles, and a transferable warranty.",
      features: [
        "Designer or impact-rated shingles",
        "Ice-and-water shield at eaves + valleys",
        "Synthetic underlayment across full deck",
        "Ridge vent + rafter vent balance",
        "25-year workmanship warranty",
      ],
      duration: "50-yr material · 25-yr workmanship",
      highlight: true,
    },
    {
      tier: "Commercial",
      name: "Light-commercial",
      blurb:
        "TPO / modified-bit systems for low-slope commercial and multi-family with engineered drainage.",
      features: [
        "TPO, EPDM, or modified-bit membrane",
        "Tapered insulation for positive drainage",
        "ANSI-FM wind-uplift rated fastening",
        "Scheduled inspection program",
      ],
      duration: "20-yr NDL system warranty",
      highlight: false,
    },
  ];
}

export function WarrantyTiers({
  plans = buildWarrantyPlans(),
}: {
  plans?: ReturnType<typeof buildWarrantyPlans>;
} = {}) {
  return (
    <section id="warranty" className="relative border-y border-slate-800/80 bg-[#0a111d]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
              Warranty tiers
            </p>
            <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-tight text-slate-50 sm:text-[40px]">
              Three levels of <span className="italic">coverage.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-slate-400">
            Written warranties backed by the manufacturer and an in-house
            workmanship promise — transferable to the next owner.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <article
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                p.highlight
                  ? "border-amber-400/60 bg-gradient-to-b from-amber-400/10 to-[#0a111d]"
                  : "border-slate-800 bg-slate-900/40"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-amber-400 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#0b1220]">
                  Most chosen
                </span>
              )}
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {p.tier}
              </div>
              <h3 className="mt-3 font-serif text-[28px] leading-tight text-slate-50">
                {p.name}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                {p.blurb}
              </p>
              <ul className="mt-6 space-y-2.5 border-t border-slate-800/80 pt-5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                {p.duration}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Services grid ----------

export function ServicesGrid({
  services,
  headline,
}: {
  services: SiteData["services"];
  headline: string;
}) {
  if (services.length < 1) return null;
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
          Full service list
        </p>
        <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-tight text-slate-50 sm:text-[40px]">
          {headline}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <div className="text-[14px] font-bold text-slate-50">{s.title}</div>
              <div className="mt-2 text-[13px] leading-relaxed text-slate-400">
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Coverage ----------

export function CoverageMap({
  serviceArea,
  loc,
}: {
  serviceArea: string[];
  loc: string;
}) {
  return (
    <section id="coverage" className="relative border-y border-slate-800/80 bg-[#0a111d]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
            Coverage
          </p>
          <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-tight text-slate-50 sm:text-[40px]">
            Service area{" "}
            <span className="italic">
              {loc ? `around ${loc}` : "in your region"}
            </span>
            .
          </h2>
          <p className="mt-5 max-w-md text-[13px] leading-relaxed text-slate-400">
            Residential, multi-family, and light-commercial roofing across
            the neighborhoods below. Emergency tarp-up available 24/7.
          </p>
          {serviceArea.length > 0 && (
            <ul className="mt-8 grid grid-cols-2 gap-2">
              {serviceArea.slice(0, 12).map((a) => (
                <li
                  key={a}
                  className="flex items-center gap-2 text-[13px] text-slate-300"
                >
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  {a}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-slate-800 bg-[#070c16]">
          <svg
            viewBox="0 0 400 320"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <radialGradient id="rglow" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="rgba(251, 191, 36, 0.35)" />
                <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
              </radialGradient>
              <pattern id="rgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="400" height="320" fill="url(#rgrid)" />
            <rect width="400" height="320" fill="url(#rglow)" />
            <path
              d="M100 90 C 70 120, 70 180, 110 220 C 150 260, 240 250, 290 220 C 340 190, 330 130, 290 100 C 250 70, 150 60, 100 90 Z"
              fill="rgba(251, 191, 36, 0.08)"
              stroke="rgba(251, 191, 36, 0.45)"
              strokeWidth="1.2"
            />
            <path
              d="M120 110 C 95 135, 95 180, 125 210 C 155 240, 230 235, 270 210 C 310 185, 305 135, 270 115 C 235 95, 155 85, 120 110 Z"
              fill="none"
              stroke="rgba(251, 191, 36, 0.25)"
              strokeWidth="1"
            />
            {serviceArea.slice(0, 6).map((a, i) => {
              const seed = hashSeed(a);
              const x = 100 + (seed % 180);
              const y = 100 + ((seed >> 5) % 120);
              return (
                <g key={a}>
                  <circle
                    cx={x}
                    cy={y}
                    r="10"
                    fill="rgba(251, 191, 36, 0.12)"
                    className="origin-center"
                  >
                    <animate
                      attributeName="r"
                      values="8;14;8"
                      dur="2.8s"
                      begin={`${(i * 0.4).toFixed(2)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx={x} cy={y} r="3" fill="rgb(251, 191, 36)" />
                  <text
                    x={x + 10}
                    y={y + 4}
                    fill="rgba(226, 232, 240, 0.85)"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="ui-sans-serif, system-ui"
                  >
                    {a}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}

// ---------- Gallery / recent projects ----------

export function RecentProjects({
  gallery,
  businessName,
}: {
  gallery: SiteData["gallery"];
  businessName: string;
}) {
  if (gallery.length < 2) return null;
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
          Recent projects
        </p>
        <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-tight text-slate-50 sm:text-[40px]">
          Transformation, <span className="italic">documented.</span>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.slice(0, 6).map((g, i) => (
            <figure
              key={`${g.src}-${i}`}
              className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 ${
                i === 0 ? "sm:col-span-2 sm:row-span-2" : ""
              }`}
            >
              <SafeImg
                src={g.src}
                alt={g.alt || `${businessName} project`}
                className={`h-full w-full object-cover ${
                  i === 0 ? "aspect-[4/3]" : "aspect-square"
                }`}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Credential badges ----------

const LICENSE_BADGES: { label: string; body: string; icon: React.ReactNode }[] = [
  {
    label: "State licensed",
    body: "Active roofing-contractor license in good standing.",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    label: "Fully insured",
    body: "General liability + workers\u2019 comp on every job site.",
    icon: <BadgeCheck className="h-4 w-4" />,
  },
  {
    label: "Manufacturer certified",
    body: "Factory-trained installers for the systems we sell.",
    icon: <Award className="h-4 w-4" />,
  },
  {
    label: "Written estimates",
    body: "Scoped, line-itemed, and honored — no surprise change orders.",
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
];

export function LicenseBadges() {
  return (
    <section className="relative border-y border-slate-800/80 bg-[#0a111d]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
          Credentials
        </p>
        <h2 className="mt-3 font-serif text-[26px] leading-tight tracking-tight text-slate-50 sm:text-[32px]">
          Certified, insured, <span className="italic">backed.</span>
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LICENSE_BADGES.map((b) => (
            <div
              key={b.label}
              className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/30 p-5"
            >
              <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-400/10 text-amber-300">
                {b.icon}
              </div>
              <div>
                <div className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-100">
                  {b.label}
                </div>
                <div className="mt-1 text-[12.5px] leading-relaxed text-slate-400">
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

// ---------- Testimonials ----------

export function Testimonials({
  testimonials,
  headline,
}: {
  testimonials: SiteData["testimonials"];
  headline: string;
}) {
  if (testimonials.length === 0) return null;
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
          {headline}
        </p>
        <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-tight text-slate-50 sm:text-[40px]">
          Owners, on the record.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((t, i) => (
            <figure
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: Math.round(t.rating) }).map((_, k) => (
                  <Star key={k} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <blockquote className="mt-4 font-serif text-[17px] italic leading-relaxed text-slate-200">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {t.author}
                {t.location && <span className="text-slate-500"> · {t.location}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Final CTA ----------

export function FinalCta({
  business,
  headline,
}: {
  business: SiteData["business"];
  headline: string;
}) {
  return (
    <section className="relative overflow-hidden border-t border-slate-800/80 bg-[#0b1220]">
      <div className="absolute inset-0 opacity-60">
        <StormCanvas density={60} />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-24 text-center sm:px-8 sm:py-28">
        <p className="font-serif text-[13px] italic text-amber-300/85">
          {headline}
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl font-sans text-[40px] font-black leading-[0.98] tracking-tight text-slate-50 sm:text-[56px]">
          Get a written estimate —{" "}
          <span className="font-serif italic font-medium text-amber-200">
            inspection is free.
          </span>
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-[#0b1220] hover:bg-amber-300"
            >
              <Phone className="h-4 w-4" /> {business.phone}
            </a>
          )}
          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/40 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-slate-100 hover:border-amber-400/60 hover:text-amber-300"
            >
              <Mail className="h-4 w-4" /> Email us
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------- About editorial ----------

export function AboutEditorial({
  business,
  about,
  headline,
}: {
  business: SiteData["business"];
  about: SiteData["about"];
  headline: string;
}) {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1fr_1.2fr] md:py-24">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
            About the crew
          </p>
          <h2 className="mt-4 font-serif text-[36px] leading-[1.05] tracking-tight text-slate-50 sm:text-[44px]">
            {headline}
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-slate-400">
            {about.short}
          </p>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-400/10 text-amber-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-[13px] leading-relaxed text-slate-300">
              <span className="font-semibold text-slate-100">{business.name}</span>{" "}
              installs manufacturer-warrantied roof systems backed by our own
              written workmanship guarantee.
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-7 sm:p-9">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-300">
              {about.long}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Process (4-step) ----------

export function ProcessSteps({
  process,
  headline,
}: {
  process: SiteData["process"];
  headline: string;
}) {
  return (
    <section className="relative border-y border-slate-800/80 bg-[#0a111d]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
          The process
        </p>
        <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-tight text-slate-50 sm:text-[40px]">
          {headline}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {process.map((p) => (
            <div
              key={p.step}
              className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <div className="font-serif text-[28px] italic text-amber-300/80">
                {p.step}
              </div>
              <h3 className="mt-3 text-[15px] font-bold uppercase tracking-[0.14em] text-slate-100">
                {p.title}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- FAQ ----------

export function FaqSection({ faqs }: { faqs: SiteData["faqs"] }) {
  if (!faqs.length) return null;
  return (
    <section className="relative">
      <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-400">
          FAQs
        </p>
        <h2 className="mt-3 font-serif text-[32px] leading-tight tracking-tight text-slate-50 sm:text-[40px]">
          Straight answers, <span className="italic">up front.</span>
        </h2>
        <div className="mt-8 divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/40">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4 sm:px-6 sm:py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14.5px] font-semibold text-slate-100">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-700 text-amber-300 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Helpers ----------

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function splitHero(title: string): { before: string; after: string } {
  if (!title) return { before: "", after: "" };
  const m = title.match(/^(.{4,40}?)[:—-]\s+(.+)$/);
  if (m) return { before: m[1].trim(), after: m[2].trim() };
  return { before: "", after: title };
}

// Re-export Link so pages don't need to import it separately when using
// typography-bound CTAs inside section blocks.
export { Link };
