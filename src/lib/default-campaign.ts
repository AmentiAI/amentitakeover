/**
 * Default outreach copy. Written once at the top so the form, the send route,
 * and any future bulk-blaster all stay in sync.
 *
 * The body contains a `[demo-url]` token. At send time, the token is swapped
 * for the tracked preview URL; when the token is present we skip the P.S.
 * link-append the send route normally adds, so the link only appears once.
 */
export const DEMO_URL_TOKEN = "[demo-url]";

export const DEFAULT_CAMPAIGN_BODY =
  `Hi, it's Will from Amenti AI. Here is the site I put together for you guys what do you think? ${DEMO_URL_TOKEN}. ` +
  `If this is to your liking I could get it fully set up in 24 hours just let me know a good time to call and who to reach out to. Thanks`;

export function defaultCampaignSubject(businessName: string | null | undefined): string {
  const name = (businessName ?? "").trim();
  return name ? `Site mockup for ${name}` : "Site mockup we built for you";
}

export function bodyHasDemoUrlToken(body: string): boolean {
  return body.includes(DEMO_URL_TOKEN);
}

export function replaceDemoUrlToken(body: string, url: string): string {
  return body.split(DEMO_URL_TOKEN).join(url);
}
