import { RoofingTemplate } from "@/components/templates/roofing";
import { DEMO_DATA } from "@/lib/templates/roofing";

export const metadata = {
  title: `${DEMO_DATA.business.name} — Roofing contractor`,
  description: DEMO_DATA.business.tagline,
};

export default function RoofingDemoPage() {
  return <RoofingTemplate data={DEMO_DATA} />;
}
