import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Eye,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
  Tag,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";
import { BizActions } from "./biz-actions";

export const dynamic = "force-dynamic";

const TEMPLATES: Array<{ key: string; label: string }> = [
  { key: "site", label: "Pro Multi-Page" },
  { key: "editorial", label: "Editorial" },
];

export default async function AffiliateBusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  const affiliate = await prisma.affiliate.findUnique({
    where: { slug },
    select: { id: true, active: true },
  });
  if (!affiliate) notFound();

  const session = await getAffiliateFromCookies();
  if (!session || session.slug !== slug || !affiliate.active) {
    redirect(`/a/${slug}`);
  }

  const biz = await prisma.scrapedBusiness.findUnique({
    where: { id },
    include: { site: true },
  });
  if (!biz) notFound();

  const [myCalls, myDeals] = await Promise.all([
    prisma.affiliateCall.findMany({
      where: { affiliateId: affiliate.id, scrapedBusinessId: biz.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.affiliateDeal.findMany({
      where: { affiliateId: affiliate.id, scrapedBusinessId: biz.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const liveSiteUrl = biz.website ?? biz.site?.url ?? null;
  const currentTemplate = biz.templateChoice === "editorial" ? "editorial" : "site";
  const templateUrl = `/p/${currentTemplate}/${biz.id}`;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-4">
        <Link
          href={`/a/${slug}`}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to opportunities
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-800">
            <Building2 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold text-white">
                {biz.name}
              </h1>
              {myDeals.length > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                  closed
                </span>
              )}
              {myDeals.length === 0 && myCalls.length > 0 && (
                <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                  called {myCalls.length}×
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              {(biz.industry || biz.category) && (
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3 w-3" /> {biz.industry ?? biz.category}
                </span>
              )}
              {(biz.city || biz.state) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[biz.address, biz.city, biz.state, biz.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
              {typeof biz.rating === "number" && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {biz.rating.toFixed(1)} ({biz.reviewsCount} reviews)
                </span>
              )}
              {biz.lat != null && biz.lng != null && (
                <a
                  href={`https://www.google.com/maps/@${biz.lat},${biz.lng},17z`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
                >
                  <MapPin className="h-3 w-3" /> Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        <BizActions
          businessId={biz.id}
          phone={biz.phone}
          name={biz.name}
        />
      </div>

      {/* Two-col: business + contact-ish */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card title="Contact info" icon={<Phone className="h-4 w-4" />}>
          <div className="space-y-2 text-sm">
            {biz.phone && (
              <Row
                icon={<Phone className="h-3.5 w-3.5" />}
                label={
                  <a
                    href={`tel:${biz.phone}`}
                    className="text-sky-400 hover:text-sky-300"
                  >
                    {biz.phone}
                  </a>
                }
              />
            )}
            {biz.email && (
              <Row
                icon={<Mail className="h-3.5 w-3.5" />}
                label={
                  <a
                    href={`mailto:${biz.email}`}
                    className="text-sky-400 hover:text-sky-300"
                  >
                    {biz.email}
                  </a>
                }
              />
            )}
            {liveSiteUrl && (
              <Row
                icon={<Globe className="h-3.5 w-3.5" />}
                label={
                  <a
                    href={liveSiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
                  >
                    {liveSiteUrl.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                }
              />
            )}
            {!biz.phone && !biz.email && !liveSiteUrl && (
              <div className="text-slate-500">—</div>
            )}
          </div>

          {(biz.instagram || biz.facebook || biz.linkedin || biz.twitter) && (
            <div className="mt-4 flex items-center gap-2 text-slate-400">
              {biz.instagram && (
                <SocialIcon href={biz.instagram} icon={<Instagram className="h-3.5 w-3.5" />} />
              )}
              {biz.facebook && (
                <SocialIcon href={biz.facebook} icon={<Facebook className="h-3.5 w-3.5" />} />
              )}
              {biz.linkedin && (
                <SocialIcon href={biz.linkedin} icon={<Linkedin className="h-3.5 w-3.5" />} />
              )}
              {biz.twitter && (
                <SocialIcon href={biz.twitter} icon={<Twitter className="h-3.5 w-3.5" />} />
              )}
            </div>
          )}

          {biz.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {biz.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10.5px] text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card title="Your activity" icon={<Phone className="h-4 w-4" />}>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Calls" value={String(myCalls.length)} />
            <Stat label="Deals" value={String(myDeals.length)} />
            <Stat
              label="Owed"
              value={`$${myDeals
                .filter((d) => !d.paidAt)
                .reduce((s, d) => s + Number(d.commissionDue), 0)
                .toFixed(2)}`}
              tone="warn"
            />
          </div>
        </Card>
      </div>

      {/* Website / generated template */}
      <Card
        className="mt-5"
        title="Website & generated template"
        icon={<Globe className="h-4 w-4" />}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <PanelTile
            title="Their live site"
            value={liveSiteUrl}
            href={liveSiteUrl}
            emptyLabel="No website on file"
          />
          <PanelTile
            title="Our template preview"
            value={`${labelFor(biz.templateChoice)} · ${biz.name}`}
            href={templateUrl}
            emptyLabel="No template rendered yet"
            accent
          />

          {biz.site && (
            <div className="md:col-span-2 rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Scraped site snapshot
              </div>
              {biz.site.title && (
                <div className="font-medium text-slate-100">{biz.site.title}</div>
              )}
              {biz.site.description && (
                <p className="mt-1 line-clamp-3 text-slate-400">
                  {biz.site.description}
                </p>
              )}
              {biz.site.palette.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">
                    Palette
                  </span>
                  <div className="flex gap-1">
                    {biz.site.palette.slice(0, 6).map((c) => (
                      <span
                        key={c}
                        title={c}
                        className="h-4 w-4 rounded-full border border-slate-700"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Try other templates
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TEMPLATES.map((t) => (
              <a
                key={t.key}
                href={`/p/${t.key}/${biz.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-[11px] font-medium text-slate-300 hover:border-slate-500 hover:text-white"
              >
                <Eye className="h-3.5 w-3.5" />
                {t.label}
              </a>
            ))}
          </div>
        </div>
      </Card>

      {/* Notes */}
      {biz.notes && (
        <Card className="mt-5" title="Notes" icon={<Tag className="h-4 w-4" />}>
          <div className="whitespace-pre-wrap text-sm text-slate-300">
            {biz.notes}
          </div>
        </Card>
      )}

      {/* My call history for this business */}
      <Card
        className="mt-5"
        title={`Your calls (${myCalls.length})`}
        icon={<Phone className="h-4 w-4" />}
      >
        {myCalls.length === 0 ? (
          <div className="text-sm text-slate-500">
            No calls logged for this business yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {myCalls.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2 text-xs"
              >
                <div className="text-slate-300">{c.outcome}</div>
                <div className="text-[11px] text-slate-500">
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* My deals for this business */}
      {myDeals.length > 0 && (
        <Card
          className="mt-5"
          title={`Your deals (${myDeals.length})`}
          icon={<Tag className="h-4 w-4" />}
        >
          <div className="divide-y divide-slate-800">
            {myDeals.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between py-2 text-xs"
              >
                <div className="text-slate-300">
                  ${Number(d.dealValue).toFixed(2)} × {d.commissionPct}% = $
                  {Number(d.commissionDue).toFixed(2)}
                </div>
                <div>
                  {d.paidAt ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      paid {new Date(d.paidAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function labelFor(key: string | null | undefined): string {
  const t = TEMPLATES.find((x) => x.key === (key || "site"));
  return t ? `${t.label} template` : "Template";
}

function Card({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-800 bg-slate-900/50 p-5 ${
        className ?? ""
      }`}
    >
      <header className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        {icon && <span className="text-slate-400">{icon}</span>}
        {title}
      </header>
      {children}
    </section>
  );
}

function Row({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-300">
      <span className="mt-0.5 text-slate-500">{icon}</span>
      <span className="flex-1">{label}</span>
    </div>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="grid h-7 w-7 place-items-center rounded-full border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
    >
      {icon}
    </a>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={`mt-0.5 text-sm font-semibold ${
          tone === "warn" ? "text-amber-300" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function PanelTile({
  title,
  value,
  href,
  emptyLabel,
  accent,
}: {
  title: string;
  value: string | null;
  href: string | null;
  emptyLabel: string;
  accent?: boolean;
}) {
  const clickable = href != null;
  if (clickable) {
    return (
      <a
        href={href!}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center justify-between gap-3 rounded-lg border p-4 transition ${
          accent
            ? "border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400"
            : "border-slate-700 bg-slate-950 hover:border-slate-500"
        }`}
      >
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </div>
          <div
            className={`mt-1 truncate text-sm ${
              accent ? "font-semibold text-emerald-300" : "font-medium text-slate-100"
            }`}
          >
            {value ?? emptyLabel}
          </div>
        </div>
        <ExternalLink
          className={`h-4 w-4 shrink-0 ${
            accent ? "text-emerald-400" : "text-slate-500"
          }`}
        />
      </a>
    );
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-slate-800 bg-slate-950 p-4">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </div>
        <div className="mt-1 truncate text-sm text-slate-500">{emptyLabel}</div>
      </div>
    </div>
  );
}
