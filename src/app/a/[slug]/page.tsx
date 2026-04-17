import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";
import { AffiliateLogin } from "./login";
import { OpportunitiesView } from "./opportunities-view";

export const dynamic = "force-dynamic";

export default async function AffiliatePortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { slug } = await params;
  const { code } = await searchParams;

  const affiliate = await prisma.affiliate.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, active: true, commissionPct: true },
  });
  if (!affiliate) notFound();
  if (!affiliate.active) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">Account disabled</h1>
          <p className="mt-1 text-sm text-slate-400">
            This affiliate account has been deactivated.
          </p>
        </div>
      </div>
    );
  }

  const session = await getAffiliateFromCookies();
  if (!session || session.slug !== affiliate.slug) {
    return <AffiliateLogin slug={affiliate.slug} prefilledCode={code ?? null} />;
  }

  if (code) redirect(`/a/${affiliate.slug}`);

  const [calls, deals] = await Promise.all([
    prisma.affiliateCall.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.affiliateDeal.findMany({
      where: { affiliateId: affiliate.id },
      select: { scrapedBusinessId: true, commissionDue: true, paidAt: true },
    }),
  ]);

  const dealedBizIds = new Set(deals.map((d) => d.scrapedBusinessId));
  const calledBizIds = new Set(calls.map((c) => c.scrapedBusinessId));

  const businesses = await prisma.scrapedBusiness.findMany({
    where: {
      archived: false,
      phone: { not: null },
      closedWon: false,
    },
    orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
    take: 60,
    select: {
      id: true,
      name: true,
      phone: true,
      website: true,
      email: true,
      industry: true,
      category: true,
      city: true,
      state: true,
      rating: true,
      reviewsCount: true,
      templateChoice: true,
    },
  });

  const bizMap = new Map(businesses.map((b) => [b.id, b]));
  const recentActivity = calls.map((c) => ({
    id: c.id,
    createdAt: c.createdAt.toISOString(),
    outcome: c.outcome,
    businessName: bizMap.get(c.scrapedBusinessId)?.name ?? "(unknown)",
  }));

  const commissionOwed = deals.reduce(
    (s, d) => (d.paidAt ? s : s + Number(d.commissionDue)),
    0,
  );

  return (
    <OpportunitiesView
      slug={affiliate.slug}
      stats={{
        callsTotal: calls.length,
        dealsTotal: deals.length,
        commissionOwed,
      }}
      businesses={businesses.map((b) => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        website: b.website,
        email: b.email,
        industry: b.industry ?? b.category,
        city: b.city,
        state: b.state,
        rating: b.rating,
        reviewsCount: b.reviewsCount,
        templateChoice: b.templateChoice,
        alreadyCalled: calledBizIds.has(b.id),
        alreadyClosed: dealedBizIds.has(b.id),
      }))}
      recentActivity={recentActivity}
    />
  );
}
