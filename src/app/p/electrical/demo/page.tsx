import { ElectricalTemplate } from "@/components/templates/electrical";
import { DEMO_ELECTRICAL_DATA } from "@/lib/templates/electrical";

export default function ElectricalTemplateDemo() {
  return <ElectricalTemplate data={DEMO_ELECTRICAL_DATA} />;
}

export const metadata = {
  title: "Voltline Electrical Co. — Electrical template demo",
};
