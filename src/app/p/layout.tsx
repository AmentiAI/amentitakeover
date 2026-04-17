import { PreviewPricingModal } from "@/components/preview-pricing-modal";

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PreviewPricingModal />
    </>
  );
}
