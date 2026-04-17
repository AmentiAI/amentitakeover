import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { AFFILIATE_COOKIE, verifyAffiliateToken } from "@/lib/affiliate-auth";

export type AffiliateSession = {
  id: string;
  name: string;
  slug: string;
  commissionPct: number;
};

export async function getAffiliateFromCookies(): Promise<AffiliateSession | null> {
  const store = await cookies();
  const token = store.get(AFFILIATE_COOKIE)?.value;
  const affiliateId = await verifyAffiliateToken(token);
  if (!affiliateId) return null;

  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    select: { id: true, name: true, slug: true, commissionPct: true, active: true },
  });
  if (!affiliate || !affiliate.active) return null;
  return {
    id: affiliate.id,
    name: affiliate.name,
    slug: affiliate.slug,
    commissionPct: affiliate.commissionPct,
  };
}
