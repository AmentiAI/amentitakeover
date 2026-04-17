import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";
import { ScriptsView } from "./scripts-view";

export const dynamic = "force-dynamic";

export default async function AffiliateScriptsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const affiliate = await prisma.affiliate.findUnique({
    where: { slug },
    select: { active: true, commissionPct: true },
  });
  if (!affiliate) notFound();

  const session = await getAffiliateFromCookies();
  if (!session || session.slug !== slug || !affiliate.active) {
    redirect(`/a/${slug}`);
  }

  return <ScriptsView commissionPct={affiliate.commissionPct} />;
}
