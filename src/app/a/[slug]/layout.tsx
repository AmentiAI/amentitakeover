import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";
import { AffiliateShell } from "./shell";

export const metadata = {
  title: "Affiliate Portal",
};

export default async function AffiliateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const affiliate = await prisma.affiliate.findUnique({
    where: { slug },
    select: { name: true, slug: true, active: true, commissionPct: true },
  });
  if (!affiliate) notFound();

  const session = await getAffiliateFromCookies();
  const authed = Boolean(session && session.slug === slug);

  // If not authed (or no active account), skip the shell — the page renders
  // its own login / disabled notice full-bleed.
  if (!authed || !affiliate.active) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <AffiliateShell
      slug={affiliate.slug}
      name={affiliate.name}
      commissionPct={affiliate.commissionPct}
    >
      {children}
    </AffiliateShell>
  );
}
