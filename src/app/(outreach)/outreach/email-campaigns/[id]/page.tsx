import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";
import { CampaignEditForm } from "./campaign-edit-form";

export const dynamic = "force-dynamic";

export default async function CampaignEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) notFound();

  return (
    <>
      <OutreachTopbar activeHref="/outreach/email-campaigns" />
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/outreach/email-campaigns"
            className="mb-3 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to campaigns
          </Link>
          <CampaignEditForm
            campaign={{
              id: campaign.id,
              name: campaign.name,
              status: campaign.status,
              subject: campaign.subject,
              body: campaign.body,
              sent: campaign.sent,
              opened: campaign.opened,
              replied: campaign.replied,
            }}
          />
        </div>
      </div>
    </>
  );
}
