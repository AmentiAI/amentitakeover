import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone, Star } from "lucide-react";
import { loadSiteData, loadSiteMetadata } from "@/lib/templates/site-loader";
import { SocialLinks } from "@/components/templates/site/chrome";

export const dynamic = "force-dynamic";

export default async function EditorialHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  const { business, hero, about, services, gallery, testimonials, serviceArea, headlines, palette } = data;
  const heroImage = hero.image;
  const loc = [business.city, business.state].filter(Boolean).join(", ");
  const pullQuote = testimonials[0] ?? null;
  const restQuotes = testimonials.slice(1);

  return (
    <div className="min-h-screen bg-[#faf8f3] font-serif text-[#1a1814] [font-family:'Cormorant_Garamond',ui-serif,Georgia,'Times_New_Roman',serif]">
      <style>{themeStyles(palette)}</style>

      {/* Masthead */}
      <header className="border-b border-[#1a1814]/15">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href={`/p/editorial/${data.slug}`} className="text-[13px] font-semibold uppercase tracking-[0.32em] sm:text-sm">
            {business.name}
          </Link>
          <div className="hidden items-center gap-5 text-[12px] uppercase tracking-[0.28em] md:flex">
            {loc && <span className="text-[#1a1814]/65">{loc}</span>}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="font-semibold hover:underline">
                {business.phone}
              </a>
            )}
          </div>
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex items-center gap-1.5 rounded-none border border-[#1a1814] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] md:hidden"
            >
              <Phone className="h-3 w-3" /> Call
            </a>
          )}
        </div>
      </header>

      {/* Hero — oversized serif with full-bleed image */}
      <section className="relative">
        <div className="relative h-[72vh] min-h-[480px] w-full overflow-hidden sm:h-[82vh]">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt={business.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" style={{ background: "var(--ed-base)" }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1814]/75 via-[#1a1814]/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12">
            <div className="mx-auto max-w-6xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#faf8f3]/75">
                {hero.eyebrow}
              </div>
              <h1 className="mt-3 max-w-4xl text-[40px] font-normal leading-[1.02] tracking-tight text-[#faf8f3] sm:text-[68px] md:text-[88px]">
                {hero.title}
              </h1>
            </div>
          </div>
        </div>
        <div className="border-y border-[#1a1814]/15 bg-[#faf8f3]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 text-[12px] uppercase tracking-[0.24em] sm:px-8">
            <span className="text-[#1a1814]/65">An invited preview · {business.name}</span>
            {business.rating ? (
              <span className="inline-flex items-center gap-1.5 text-[#1a1814]">
                <Star className="h-3 w-3 fill-current" />
                {business.rating.toFixed(1)} · {business.reviewsCount} reviews
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* Intro — serif editorial */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1a1814]/55">
            <div>Est. local</div>
            <div className="mt-2">{loc || "Serving the area"}</div>
          </div>
          <div>
            <h2 className="text-[32px] font-normal leading-[1.08] tracking-tight text-[#1a1814] sm:text-[48px]">
              {headlines.about}
            </h2>
            <div className="mt-7 grid gap-6 text-[17px] leading-[1.65] text-[#1a1814]/80 md:grid-cols-2 md:gap-10">
              <p>{about.short}</p>
              <p className="text-[#1a1814]/70">{about.long}</p>
            </div>
            <div className="mt-8">
              <a
                href={business.phone ? `tel:${business.phone}` : "#"}
                className="inline-flex items-center gap-2 border-b border-[#1a1814] pb-1 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#1a1814] hover:gap-3"
              >
                Speak with us <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services — numbered editorial list */}
      <section className="border-y border-[#1a1814]/15 bg-[#f2ede2]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex items-end justify-between gap-4">
            <h2 className="max-w-xl text-[32px] font-normal leading-[1.1] tracking-tight sm:text-[48px]">
              {headlines.services}
            </h2>
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1a1814]/55">
              {String(services.length).padStart(2, "0")} services
            </div>
          </div>

          <ol className="mt-14 divide-y divide-[#1a1814]/15 border-t border-[#1a1814]/15">
            {services.map((s, i) => (
              <li
                key={s.title}
                className="grid gap-6 py-10 md:grid-cols-[auto_1fr_1.6fr] md:items-start md:gap-12"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1a1814]/55">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-[28px] font-normal leading-[1.08] tracking-tight text-[#1a1814] sm:text-[36px]">
                  {s.title}
                </h3>
                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-start md:gap-8">
                  <p className="text-[16px] leading-[1.65] text-[#1a1814]/75">{s.body}</p>
                  {s.image ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden md:w-[240px] lg:w-[280px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.image}
                        alt={s.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pull quote */}
      {pullQuote && (
        <section className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1a1814]/55">
            A recent word
          </div>
          <blockquote className="mt-6 text-[28px] font-normal leading-[1.25] tracking-tight text-[#1a1814] sm:text-[42px] md:text-[52px]">
            &ldquo;{pullQuote.quote}&rdquo;
          </blockquote>
          <div className="mt-6 text-[13px] uppercase tracking-[0.28em] text-[#1a1814]/65">
            {pullQuote.author} · {pullQuote.location}
          </div>
        </section>
      )}

      {/* Gallery — magazine asymmetric grid */}
      {gallery.length > 0 && (
        <section className="border-y border-[#1a1814]/15 bg-[#1a1814] text-[#faf8f3]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="flex items-end justify-between gap-4">
              <h2 className="max-w-xl text-[32px] font-normal leading-[1.1] tracking-tight sm:text-[48px]">
                {headlines.gallery}
              </h2>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#faf8f3]/55">
                Plate {String(gallery.length).padStart(2, "0")}
              </div>
            </div>

            <div className="mt-12 grid grid-cols-6 gap-3 sm:gap-4">
              {gallery.slice(0, 9).map((g, i) => (
                <figure
                  key={g.src + i}
                  className={`relative overflow-hidden ${editorialGridSpan(i)}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.src}
                    alt={g.alt}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process — oversized numerals */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1a1814]/55">
            The method
          </div>
          <h2 className="mt-3 text-[32px] font-normal leading-[1.08] tracking-tight text-[#1a1814] sm:text-[48px]">
            {headlines.process}
          </h2>
        </div>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {data.process.map((p, i) => (
            <li key={p.step} className="border-t border-[#1a1814]/20 pt-5">
              <div className="text-[56px] font-normal leading-none tracking-tight text-[#1a1814]/30 sm:text-[72px]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1a1814]/65">
                {p.title}
              </div>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#1a1814]/75">{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Remaining testimonials */}
      {restQuotes.length > 0 && (
        <section className="border-t border-[#1a1814]/15 bg-[#f2ede2]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1a1814]/55">
              Letters from clients
            </div>
            <div className="mt-10 grid gap-10 md:grid-cols-3 md:divide-x md:divide-[#1a1814]/15">
              {restQuotes.map((t, i) => (
                <figure key={i} className="md:px-6 md:first:pl-0 md:last:pr-0">
                  <div className="flex items-center gap-0.5 text-[#b08f4b]">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-[18px] leading-[1.55] text-[#1a1814]/85">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1a1814]/65">
                    {t.author} · {t.location}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Service area */}
      {serviceArea.length > 0 && (
        <section className="border-y border-[#1a1814]/15">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-8 sm:px-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#1a1814]/55">
              Serving
            </div>
            {serviceArea.map((a) => (
              <span key={a} className="text-[15px] italic text-[#1a1814]/80">
                {a}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Closing contact block */}
      <section className="bg-[#1a1814] text-[#faf8f3]">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#faf8f3]/60">
              An invitation
            </div>
            <h2 className="mt-4 text-[36px] font-normal leading-[1.05] tracking-tight sm:text-[56px] md:text-[72px]">
              {headlines.cta}
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-[1.65] text-[#faf8f3]/75">
              Same-week response. Written quotes. No auto-dialers, no pressure — just a short conversation to see if we&apos;re the right fit.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center gap-2 border-b border-[#faf8f3] pb-1 text-[14px] font-semibold uppercase tracking-[0.28em] hover:gap-3"
                >
                  <Phone className="h-3.5 w-3.5" /> {business.phone}
                </a>
              )}
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="inline-flex items-center gap-2 border-b border-[#faf8f3]/60 pb-1 text-[14px] font-semibold uppercase tracking-[0.28em] text-[#faf8f3]/90 hover:gap-3 hover:text-[#faf8f3]"
                >
                  <Mail className="h-3.5 w-3.5" /> {business.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Colophon footer */}
      <footer className="border-t border-[#faf8f3]/10 bg-[#1a1814] text-[#faf8f3]/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="text-[11px] uppercase tracking-[0.28em]">
            © {new Date().getFullYear()} {business.name}
            {loc ? ` · ${loc}` : ""}
          </div>
          <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.28em]">
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

function editorialGridSpan(i: number): string {
  // Creates an asymmetric magazine feel: bigger features at 0 and 4,
  // mixed portrait/landscape elsewhere.
  switch (i % 9) {
    case 0:
      return "col-span-6 aspect-[21/9] sm:col-span-4 sm:aspect-[16/10]";
    case 1:
      return "col-span-3 aspect-square sm:col-span-2";
    case 2:
      return "col-span-3 aspect-square sm:col-span-2 sm:aspect-[3/4]";
    case 3:
      return "col-span-3 aspect-[3/4] sm:col-span-2";
    case 4:
      return "col-span-6 aspect-[16/10] sm:col-span-4 sm:aspect-[16/7]";
    case 5:
      return "col-span-3 aspect-square sm:col-span-3";
    case 6:
      return "col-span-3 aspect-[4/5] sm:col-span-3 sm:aspect-[3/4]";
    case 7:
      return "col-span-6 aspect-[16/9] sm:col-span-4 sm:aspect-[16/10]";
    default:
      return "col-span-3 aspect-square sm:col-span-2";
  }
}

function themeStyles(p: { base: string; accent: string; trust: string }): string {
  return `:root{--ed-base:${p.base};--ed-accent:${p.accent};--ed-trust:${p.trust};}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = await loadSiteMetadata(id);
  return meta ?? { title: "Local business" };
}
