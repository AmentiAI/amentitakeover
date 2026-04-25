/**
 * Section primitives used across the multi-page template. Each is data-driven
 * so pages (home / about / services / contact / gallery) can assemble from
 * the same small, coherent library.
 */

import Link from "next/link";
import { ArrowRight, BadgeCheck, Mail, MapPin, Phone, Quote, ShieldCheck, Sparkles, Star } from "lucide-react";
import type { SiteData } from "@/lib/templates/site";
import { SafeImg } from "@/components/safe-img";
import {
  DEFAULT_BANNER_ABOUT,
  DEFAULT_BANNER_CTA,
  DEFAULT_BANNER_SERVICES,
  defaultGalleryAt,
  defaultServiceAt,
} from "@/lib/template-defaults";

export function Hero({ data }: { data: SiteData }) {
  const { hero, business } = data;
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        {hero.image ? (
          <SafeImg
            src={hero.image}
            alt={`${business.name} hero`}
            className="h-full w-full object-cover"
            fallback={<div className="h-full w-full" style={{ background: "var(--site-base)" }} />}
          />
        ) : (
          <div className="h-full w-full" style={{ background: "var(--site-base)" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/55 to-transparent" />
      </div>

      {hero.character && (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[44%] max-w-[520px] items-end justify-end pb-2 pr-4 sm:flex">
          <SafeImg
            src={hero.character}
            alt=""
            className="h-[88%] w-auto max-h-[640px] object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
            aria-hidden
          />
        </div>
      )}

      <div className="relative z-[2] mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28 lg:py-36">
        <div className="max-w-3xl text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.22em] backdrop-blur">
            <Sparkles className="h-3 w-3" />
            {hero.eyebrow}
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="inline-flex items-center gap-2 rounded-full btn-accent px-5 py-3 text-sm font-bold shadow-lg shadow-black/20 sm:text-[15px]"
              >
                <Phone className="h-4 w-4" /> Call {business.phone}
              </a>
            )}
            <Link
              href={`/p/site/${data.slug}/contact`}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20 sm:text-[15px]"
            >
              Get a free quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-[12.5px] text-white/80">
            {business.rating ? (
              <div className="inline-flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-white">{business.rating.toFixed(1)}/5</span>
                {business.reviewsCount > 0 && (
                  <span className="text-white/60">· {business.reviewsCount} reviews</span>
                )}
              </div>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Licensed · Bonded · Insured
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4" /> Written warranty
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ValuePropStrip({ data }: { data: SiteData }) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {data.valueProps.map((v) => (
          <div key={v.label} className="flex items-start gap-3">
            <span
              className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
              style={{ background: "var(--site-accent)" }}
            >
              <BadgeCheck className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[13px] font-bold text-slate-900">{v.label}</div>
              <div className="text-[12.5px] leading-relaxed text-slate-600">{v.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AboutPreview({ data }: { data: SiteData }) {
  const { about, banners, business, slug } = data;
  return (
    <section className="relative bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200 md:aspect-auto">
          {banners.about ? (
            <SafeImg
              src={banners.about}
              alt="About us"
              className="absolute inset-0 h-full w-full object-cover"
              defaultSrc={DEFAULT_BANNER_ABOUT}
              fallback={<div className="absolute inset-0" style={{ background: "var(--site-trust)" }} />}
            />
          ) : (
            <div className="absolute inset-0" style={{ background: "var(--site-trust)" }} />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">About {business.name}</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {data.headlines.about}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">{about.short}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/p/site/${slug}/about`}
              className="inline-flex items-center gap-2 rounded-full btn-base px-4 py-2 text-sm font-bold"
            >
              Our story <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/p/site/${slug}/gallery`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-200"
            >
              See our work
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesGrid({ data, compact = false }: { data: SiteData; compact?: boolean }) {
  const services = compact ? data.services.slice(0, 6) : data.services;
  return (
    <section className="relative bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">What we do</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {data.headlines.services}
            </h2>
          </div>
          {compact && (
            <Link
              href={`/p/site/${data.slug}/services`}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 underline-offset-4 hover:underline"
            >
              See all services <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={s.title}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[5/3] w-full overflow-hidden bg-slate-200">
                {s.image ? (
                  <SafeImg
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    defaultSrc={defaultServiceAt(i)}
                    fallback={
                      <div
                        className="absolute inset-0"
                        style={{ background: "var(--site-trust)" }}
                        aria-hidden
                      />
                    }
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: "var(--site-trust)" }}
                    aria-hidden
                  />
                )}
                <div
                  className="absolute inset-x-0 bottom-0 h-1.5"
                  style={{ background: "var(--site-accent)" }}
                  aria-hidden
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">{s.title}</h3>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-slate-600">{s.body}</p>
                <Link
                  href={`/p/site/${data.slug}/contact`}
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:underline"
                >
                  Get a quote <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesBannerStrip({ data }: { data: SiteData }) {
  if (!data.banners.services) return null;
  return (
    <section className="relative bg-white py-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-slate-200">
          <SafeImg
            src={data.banners.services}
            alt="Services overview"
            className="h-64 w-full object-cover sm:h-80 md:h-[28rem]"
            defaultSrc={DEFAULT_BANNER_SERVICES}
            fallback={<div className="h-64 w-full sm:h-80 md:h-[28rem]" style={{ background: "var(--site-base)" }} />}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">Craft you can see</div>
            <h3 className="mt-2 max-w-lg text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              {data.headlines.services}
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProcessSection({ data }: { data: SiteData }) {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">How it works</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {data.headlines.process}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            No pressure. No expiring discounts. Here&apos;s what to expect from call one through warranty.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.process.map((p) => (
            <div key={p.step} className="relative rounded-2xl bg-slate-50 p-6">
              <div
                className="text-xs font-bold tracking-[0.22em] text-white"
                style={{ color: "var(--site-accent)" }}
              >
                STEP {p.step}
              </div>
              <div className="mt-2 text-lg font-bold text-slate-900">{p.title}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GalleryStrip({ data, compact = false }: { data: SiteData; compact?: boolean }) {
  const shown = compact ? data.gallery.slice(0, 6) : data.gallery;
  if (shown.length === 0) return null;
  return (
    <section className="relative bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Recent work</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {data.headlines.gallery}
            </h2>
          </div>
          {compact && (
            <Link
              href={`/p/site/${data.slug}/gallery`}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 underline-offset-4 hover:underline"
            >
              Full gallery <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {shown.map((g, i) => (
            <div
              key={g.src + i}
              className={`relative overflow-hidden rounded-2xl ring-1 ring-slate-200 ${i % 5 === 0 && !compact ? "md:col-span-2 md:row-span-1 aspect-[2/1]" : "aspect-square"}`}
            >
              <SafeImg
                src={g.src}
                alt={g.alt}
                className="absolute inset-0 h-full w-full object-cover transition hover:scale-105"
                defaultSrc={defaultGalleryAt(i)}
                fallback={<div className="absolute inset-0" style={{ background: "var(--site-trust)" }} aria-hidden />}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ data }: { data: SiteData }) {
  return (
    <section className="relative bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">What customers say</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {data.headlines.testimonials}
          </h2>
          {data.business.rating ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-700">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              {data.business.rating.toFixed(1)}/5
              {data.business.reviewsCount > 0 && (
                <span className="text-slate-500">· {data.business.reviewsCount} Google reviews</span>
              )}
            </div>
          ) : null}
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {data.testimonials.map((t, i) => (
            <figure
              key={i}
              className="relative rounded-2xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200"
            >
              <Quote className="absolute right-5 top-5 h-8 w-8 text-slate-200" />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-3 text-[14px] leading-relaxed text-slate-800">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-[12px] font-semibold text-slate-600">
                {t.author} · <span className="font-normal text-slate-500">{t.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServiceAreaSection({ data }: { data: SiteData }) {
  return (
    <section className="relative bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Where we work</div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Proudly serving:</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.serviceArea.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
              >
                <MapPin className="h-3.5 w-3.5 text-accent" />
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTASection({ data }: { data: SiteData }) {
  const { banners, business, slug } = data;
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        {banners.cta ? (
          <SafeImg
            src={banners.cta}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
            defaultSrc={DEFAULT_BANNER_CTA}
            fallback={<div className="h-full w-full" style={{ background: "var(--site-base)" }} />}
          />
        ) : (
          <div className="h-full w-full" style={{ background: "var(--site-base)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,14,24,0.95) 0%, rgba(10,14,24,0.7) 55%, rgba(10,14,24,0.3) 100%)" }} />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24">
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.22em] backdrop-blur">
            <ShieldCheck className="h-3 w-3" />
            Free estimate · no obligation
          </div>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            {data.headlines.cta}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
            Same-week response. Written quotes. Real people on the phone.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="inline-flex items-center gap-2 rounded-full btn-accent px-5 py-3 text-sm font-bold shadow-lg shadow-black/20 sm:text-[15px]"
              >
                <Phone className="h-4 w-4" /> {business.phone}
              </a>
            )}
            <Link
              href={`/p/site/${slug}/contact`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-white/90 sm:text-[15px]"
            >
              Request a quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string | null;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        {image ? (
          <SafeImg
            src={image}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
            fallback={<div className="h-full w-full" style={{ background: "var(--site-base)" }} />}
          />
        ) : (
          <div className="h-full w-full" style={{ background: "var(--site-base)" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 to-slate-950/30" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24">
        <div className="max-w-2xl text-white">
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-white/75">{eyebrow}</div>
          <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{subtitle}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export function ContactBlock({ data }: { data: SiteData }) {
  const { business } = data;
  const loc = [business.address, [business.city, business.state].filter(Boolean).join(", "), business.postalCode]
    .filter(Boolean)
    .join(" · ");
  return (
    <section className="relative bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Get in touch</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Call, email, or send a note.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            Same-week response. Written quotes. No pressure, no expiring discounts.
          </p>
          <div className="mt-8 space-y-4">
            {business.phone && (
              <ContactRow icon={<Phone className="h-4 w-4" />} label="Call" value={business.phone} href={`tel:${business.phone}`} />
            )}
            {business.email && (
              <ContactRow icon={<Mail className="h-4 w-4" />} label="Email" value={business.email} href={`mailto:${business.email}`} />
            )}
            {loc && <ContactRow icon={<MapPin className="h-4 w-4" />} label="Visit" value={loc} />}
            <ContactRow icon={<ShieldCheck className="h-4 w-4" />} label="Hours" value={business.hoursLine} />
          </div>
        </div>

        <form className="flex flex-col gap-3 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Request a quote</div>
          <h3 className="text-xl font-bold text-slate-900">Tell us about your project.</h3>
          <div className="mt-1 grid gap-3">
            <FormInput label="Name" name="name" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormInput label="Phone" name="phone" type="tel" />
              <FormInput label="Email" name="email" type="email" required />
            </div>
            <FormInput label="Address / city" name="address" />
            <FormTextarea label="What do you need?" name="message" rows={4} />
          </div>
          <button
            type="button"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg btn-accent px-4 py-3 text-sm font-bold"
          >
            Send request <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-[11px] text-slate-500">We reply within one business day.</p>
        </form>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center gap-3">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
        style={{ background: "var(--site-accent)" }}
      >
        {icon}
      </span>
      <div className="leading-tight">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</div>
        <div className="text-sm font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block rounded-lg p-1 transition hover:bg-slate-50">
        {inner}
      </a>
    );
  }
  return <div className="p-1">{inner}</div>;
}

function FormInput({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400 focus:ring-2 focus:ring-accent"
      />
    </label>
  );
}

function FormTextarea({
  label,
  name,
  rows = 4,
}: {
  label: string;
  name: string;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">{label}</span>
      <textarea
        name={name}
        rows={rows}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-accent"
      />
    </label>
  );
}

export function FaqSection({ data }: { data: SiteData }) {
  return (
    <section className="relative bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Common questions</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Before you even ask.
          </h2>
        </div>
        <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {data.faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4 sm:px-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-left text-[15px] font-bold text-slate-900">
                <span>{f.q}</span>
                <span className="mt-1 text-slate-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
