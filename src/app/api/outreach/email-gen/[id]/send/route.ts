import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, textToHtml } from "@/lib/email";
import { getTemplatePreviewUrl, normalizeTemplateChoice } from "@/lib/site-url";
import { bodyHasDemoUrlToken, replaceDemoUrlToken } from "@/lib/default-campaign";

export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const draft = await prisma.emailDraft.findUnique({
    where: { id },
    include: { scrapedBusiness: true },
  });
  if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

  const to = draft.scrapedBusiness?.email ?? null;
  if (!to) {
    return NextResponse.json(
      { error: "This business has no email on file. Scrape or add one first." },
      { status: 400 },
    );
  }

  if (draft.status === "sent") {
    return NextResponse.json({ error: "Draft already sent", draft }, { status: 400 });
  }

  await prisma.emailDraft.update({
    where: { id },
    data: { status: "sending" },
  });

  const template = normalizeTemplateChoice(draft.scrapedBusiness?.templateChoice);
  const siteUrl = draft.scrapedBusinessId
    ? getTemplatePreviewUrl(draft.scrapedBusinessId, {
        trackingToken: draft.id,
        template,
      })
    : null;
  const businessName = draft.scrapedBusiness?.name ?? "your business";
  const cleanedBody = stripStaleMockupUrls(draft.body, draft.scrapedBusinessId);
  // If the author dropped a [demo-url] token inline, swap it for the tracked
  // URL and skip the auto-appended P.S. block — otherwise we'd send the link
  // twice. Falls through to the legacy P.S. behavior when no token is present.
  const hasInlineToken = bodyHasDemoUrlToken(cleanedBody);
  const inlinedBody = siteUrl && hasInlineToken
    ? replaceDemoUrlToken(cleanedBody, siteUrl)
    : cleanedBody;
  const textWithLink = siteUrl && !hasInlineToken
    ? appendSiteLinkText(inlinedBody, siteUrl, businessName)
    : inlinedBody;
  const htmlWithLink = siteUrl && !hasInlineToken
    ? appendSiteLinkHtml(textToHtml(inlinedBody), siteUrl, businessName)
    : textToHtml(inlinedBody);

  const result = await sendEmail({
    to,
    subject: draft.subject,
    text: textWithLink,
    html: htmlWithLink,
    tags: [
      { name: "purpose", value: "outreach" },
      { name: "draft_id", value: draft.id },
    ],
  });

  if (!result.ok) {
    const reason = "reason" in result ? result.reason : result.error;
    await prisma.emailDraft.update({
      where: { id },
      data: { status: "failed" },
    });
    await prisma.activityEvent.create({
      data: {
        type: "email.send_failed",
        title: `Outreach email failed: ${draft.subject}`,
        details: { reason, to, draftId: draft.id },
      },
    });
    return NextResponse.json(
      { error: reason, skipped: "skipped" in result ? result.skipped : false },
      { status: 502 },
    );
  }

  const updated = await prisma.emailDraft.update({
    where: { id },
    data: { status: "sent", sentAt: new Date() },
  });

  await prisma.activityEvent.create({
    data: {
      type: "email.sent",
      title: `Outreach email sent: ${draft.subject}`,
      details: {
        to,
        messageId: result.id,
        draftId: draft.id,
        businessId: draft.scrapedBusinessId,
      },
    },
  });

  return NextResponse.json({ ok: true, draft: updated, messageId: result.id });
}

// Drafts authored before the signulldev.com rollout (or manually pasted) may
// contain stale preview URLs — old amentitakeover.vercel.app links or the
// untracked /p/<tpl>/<id> form. Strip them so we don't double-up with the
// new tracked P.S. block.
function stripStaleMockupUrls(body: string, scrapedBusinessId: string | null): string {
  let cleaned = body;
  // Old Vercel preview hostnames.
  cleaned = cleaned.replace(/https?:\/\/[^\s<>"')]*amentitakeover[^\s<>"')]*/gi, "");
  // Our own mockup paths — remove so the tracked P.S. is the only link.
  const idFragment = scrapedBusinessId ? `/${scrapedBusinessId}` : "";
  const pathRe = new RegExp(
    `https?:\\/\\/[^\\s<>"')]*\\/p\\/(site|roofing[23]?|electrical)${idFragment}(?:\\/v\\/[^\\s<>"')]*)?`,
    "gi",
  );
  cleaned = cleaned.replace(pathRe, "");
  // Collapse the blank lines we just left behind.
  cleaned = cleaned.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return cleaned;
}

function appendSiteLinkText(body: string, url: string, businessName: string): string {
  if (body.includes(url)) return body;
  return `${body.trimEnd()}\n\nP.S. I already sketched a homepage for ${businessName} — live preview here:\n${url}\n`;
}

function appendSiteLinkHtml(html: string, url: string, businessName: string): string {
  if (html.includes(url)) return html;
  const block = `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.55;color:#334155;"><p style="margin:0 0 8px 0;"><strong>P.S.</strong> I already sketched a homepage for ${escapeHtml(businessName)} — live preview:</p><p style="margin:0;"><a href="${url}" style="display:inline-block;padding:10px 16px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">View the mockup →</a></p><p style="margin:8px 0 0 0;font-size:12px;color:#64748b;">${url}</p></div>`;
  return html + block;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
