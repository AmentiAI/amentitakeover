import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";
import { OutreachPrefillForm } from "./prefill-form";

export const dynamic = "force-dynamic";

// Default identity + payload used to push captured contact forms. The
// drawer's "Push contact form" panel reads these on mount so the operator
// doesn't retype the same name/email/message for every prospect, and the
// per-intent fields (referralSource, service, etc.) feed the heuristic
// mapper for sites whose dropdowns ask "How did you hear?" / "What service?"
export default async function OutreachPrefillPage() {
  const row = await prisma.outreachPrefill.findUnique({ where: { id: "default" } });
  return (
    <>
      <OutreachTopbar activeHref="/outreach/prefill" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-3xl space-y-6">
          <header>
            <h1 className="text-lg font-semibold text-white">Form prefill defaults</h1>
            <p className="mt-1 text-xs text-slate-400">
              Identity + per-intent values that auto-populate the drawer&apos;s
              &ldquo;Push contact form&rdquo; panel. The intent fields below
              also drive smart matching — set <span className="text-slate-200">Referral source</span> and
              the engine will fill any &ldquo;How did you hear about us?&rdquo;
              field on a prospect&apos;s site automatically.
            </p>
          </header>
          <OutreachPrefillForm initial={row ?? null} />
        </div>
      </div>
    </>
  );
}
