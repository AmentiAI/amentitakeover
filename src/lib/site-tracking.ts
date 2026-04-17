import { prisma } from "@/lib/db";
import type { TemplateChoice } from "@/lib/site-url";

/**
 * Log a "prospect opened their mockup" event. Links in outreach emails carry
 * `/v/{draftId}` suffixes so we can attribute the view back to a specific
 * email send.
 *
 * Best-effort: failures are swallowed so a DB hiccup never breaks the page
 * render for a prospect.
 */
export async function recordSiteView(opts: {
  scrapedBusinessId: string;
  template: TemplateChoice;
  trackingToken: string;
}): Promise<void> {
  try {
    const draft = await prisma.emailDraft.findUnique({
      where: { id: opts.trackingToken },
      select: { id: true, subject: true, scrapedBusinessId: true },
    });

    await prisma.activityEvent.create({
      data: {
        type: "template.viewed",
        title: draft
          ? `Prospect opened mockup: ${draft.subject}`
          : `Prospect opened mockup (${opts.template})`,
        details: {
          template: opts.template,
          scrapedBusinessId: opts.scrapedBusinessId,
          token: opts.trackingToken,
          draftId: draft?.id ?? null,
        },
      },
    });
  } catch {
    // tracking must never break the page
  }
}
