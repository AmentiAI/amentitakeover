import { sendEmail } from "@/lib/email";

/**
 * Notify a business owner that a lead was captured on their generated site.
 * Swallows errors — lead persistence must not depend on email delivery.
 */
export async function notifyLead({
  to,
  businessName,
  lead,
  industry,
}: {
  to: string | null;
  businessName: string;
  industry: "roofing" | "electrical";
  lead: {
    name: string;
    phone: string;
    zip?: string;
    need?: string;
    urgency?: string;
  };
}): Promise<void> {
  if (!to) return;

  const label = industry === "electrical" ? "dispatch request" : "quote request";
  const subject = `New ${label}: ${lead.name}${lead.need ? ` — ${lead.need}` : ""}`;

  const lines = [
    `A new ${label} came in from your ${industry} site.`,
    "",
    `Name:  ${lead.name}`,
    `Phone: ${lead.phone}`,
  ];
  if (lead.zip) lines.push(`ZIP:   ${lead.zip}`);
  if (lead.need) lines.push(`Need:  ${lead.need}`);
  if (lead.urgency) lines.push(`When:  ${lead.urgency}`);
  lines.push("", `— ${businessName}`);

  const text = lines.join("\n");

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.55;color:#0f172a;">
      <h2 style="margin:0 0 12px 0;font-size:18px;">New ${label}</h2>
      <p style="margin:0 0 20px 0;color:#475569;">A new lead came in from your ${industry} site.</p>
      <table style="border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Name</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(lead.name)}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Phone</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(lead.phone)}</td></tr>
        ${lead.zip ? `<tr><td style="padding:6px 16px 6px 0;color:#64748b;">ZIP</td><td style="padding:6px 0;">${escapeHtml(lead.zip)}</td></tr>` : ""}
        ${lead.need ? `<tr><td style="padding:6px 16px 6px 0;color:#64748b;">Need</td><td style="padding:6px 0;">${escapeHtml(lead.need)}</td></tr>` : ""}
        ${lead.urgency ? `<tr><td style="padding:6px 16px 6px 0;color:#64748b;">When</td><td style="padding:6px 0;">${escapeHtml(lead.urgency)}</td></tr>` : ""}
      </table>
      <p style="margin:24px 0 0 0;font-size:13px;color:#94a3b8;">— ${escapeHtml(businessName)}</p>
    </div>
  `;

  try {
    await sendEmail({
      to,
      subject,
      text,
      html,
      tags: [
        { name: "purpose", value: "lead_notification" },
        { name: "industry", value: industry },
      ],
    });
  } catch {
    // Intentionally silent — email delivery shouldn't break the lead API.
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
