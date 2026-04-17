import { Topbar } from "@/components/topbar";

export default function SettingsPage() {
  const hasAi = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <>
      <Topbar title="Settings" />
      <div className="flex-1 overflow-auto bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <Section title="Workspace">
            <Row label="Name" value="Amenti Studio" />
            <Row label="Plan" value="Founder" />
          </Section>
          <Section title="Integrations">
            <Row
              label="Anthropic API"
              value={hasAi ? "Connected" : "Not connected"}
              ok={hasAi}
            />
            <Row label="Stripe" value="Not connected" />
            <Row label="Twilio" value="Not connected" />
            <Row label="Gmail" value="Not connected" />
            {!hasAi && (
              <div className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Add <code className="rounded bg-white px-1">ANTHROPIC_API_KEY=...</code>{" "}
                to your <code className="rounded bg-white px-1">.env</code> to enable
                AI rebuilds and the AI Agents chat.
              </div>
            )}
          </Section>
          <Section title="Pipelines">
            <p className="text-sm text-slate-500">
              Default pipeline and stages are managed in{" "}
              <a href="/opportunities/pipelines" className="text-brand-700 hover:underline">
                Opportunities → Pipelines
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-800">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <div className="text-sm text-slate-600">{label}</div>
      <div
        className={`text-sm font-medium ${
          ok ? "text-emerald-700" : "text-slate-700"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
