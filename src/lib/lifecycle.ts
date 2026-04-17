export type LifecycleStep = {
  key:
    | "hasWebsite"
    | "audited"
    | "siteGenerated"
    | "emailReady"
    | "inCampaign"
    | "campaignComplete"
    | "inSales"
    | "closedWon";
  label: string;
};

export const LIFECYCLE: LifecycleStep[] = [
  { key: "hasWebsite", label: "Has Website" },
  { key: "audited", label: "Audited" },
  { key: "siteGenerated", label: "Site Generated" },
  { key: "emailReady", label: "Email Ready" },
  { key: "inCampaign", label: "In Campaign" },
  { key: "campaignComplete", label: "Campaign Complete" },
  { key: "inSales", label: "In Sales" },
  { key: "closedWon", label: "Closed Won" },
];
