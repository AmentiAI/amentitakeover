// Plan shape + default-plan builder for the pest treatment-plans grid. Lives
// outside the section components so server pages can call buildTreatmentPlans
// without dragging the (client-only) section module into the server bundle.
export type Plan = {
  title: string;
  body: string;
  cadence: string;
  targets: string;
  features: string[];
  highlight?: boolean;
};

export function buildTreatmentPlans(
  services: { title: string; body: string }[],
): Plan[] {
  const firstThree = services.slice(0, 3);
  return [
    {
      title: firstThree[0]?.title || "One-time treatment",
      body:
        firstThree[0]?.body ||
        "Targeted treatment for an active problem. We identify the pest, locate entry points, and eliminate the colony.",
      cadence: "Single visit",
      targets: "Active problem",
      features: [
        "Full property inspection + written plan",
        "Targeted interior + exterior treatment",
        "30-day callback guarantee",
      ],
    },
    {
      title: firstThree[1]?.title || "Quarterly protection",
      body:
        firstThree[1]?.body ||
        "Our most popular plan. Four visits per year keep a fresh perimeter barrier around your home and stop problems before they start.",
      cadence: "Every 3 months",
      targets: "Year-round coverage",
      features: [
        "4 scheduled treatments per year",
        "Interior + exterior perimeter barrier",
        "Free re-treats between visits",
        "Priority scheduling + weather reschedules",
      ],
      highlight: true,
    },
    {
      title: firstThree[2]?.title || "Commercial program",
      body:
        firstThree[2]?.body ||
        "Custom-cadence service for restaurants, offices, multifamily, and warehouses. Compliance-ready documentation on request.",
      cadence: "Custom cadence",
      targets: "Businesses & multifamily",
      features: [
        "IPM-compliant documentation",
        "Scheduled service windows",
        "Dedicated account technician",
        "Emergency call-outs",
      ],
    },
  ];
}
