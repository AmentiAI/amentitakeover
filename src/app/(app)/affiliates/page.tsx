import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { AffiliateAdmin } from "./affiliate-admin";
import { UnpaidDeals } from "./unpaid-deals";

export const dynamic = "force-dynamic";

export default async function AffiliatesPage() {
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { calls: true, deals: true } },
      deals: {
        select: { commissionDue: true, paidAt: true },
      },
    },
  });

  const unpaidDealsRaw = await prisma.affiliateDeal.findMany({
    where: { paidAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      affiliate: { select: { name: true } },
    },
  });
  const bizIds = unpaidDealsRaw.map((d) => d.scrapedBusinessId);
  const bizNames = bizIds.length
    ? await prisma.scrapedBusiness.findMany({
        where: { id: { in: bizIds } },
        select: { id: true, name: true },
      })
    : [];
  const bizMap = new Map(bizNames.map((b) => [b.id, b.name]));
  const unpaidDeals = unpaidDealsRaw.map((d) => ({
    id: d.id,
    affiliateName: d.affiliate.name,
    businessName: bizMap.get(d.scrapedBusinessId) ?? "(unknown)",
    dealValue: Number(d.dealValue),
    commissionPct: d.commissionPct,
    commissionDue: Number(d.commissionDue),
    createdAt: d.createdAt.toISOString(),
  }));

  const rows = affiliates.map((a) => {
    const owed = a.deals.reduce(
      (sum, d) => (d.paidAt ? sum : sum + Number(d.commissionDue)),
      0,
    );
    const paid = a.deals.reduce(
      (sum, d) => (d.paidAt ? sum + Number(d.commissionDue) : sum),
      0,
    );
    return {
      id: a.id,
      name: a.name,
      slug: a.slug,
      passcode: a.passcode,
      commissionPct: a.commissionPct,
      active: a.active,
      callsCount: a._count.calls,
      dealsCount: a._count.deals,
      commissionOwed: owed,
      commissionPaid: paid,
      createdAt: a.createdAt.toISOString(),
    };
  });

  return (
    <>
      <Topbar title="Affiliates" />
      <div className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <AffiliateAdmin initial={rows} />
          <UnpaidDeals initial={unpaidDeals} />
        </div>
      </div>
    </>
  );
}
