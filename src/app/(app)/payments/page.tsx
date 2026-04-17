import { Placeholder } from "@/components/placeholder";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <Placeholder title="Payments" icon={CreditCard}>
      Invoices, subscriptions and checkout links will show here. Connect Stripe in Settings → Integrations.
    </Placeholder>
  );
}
