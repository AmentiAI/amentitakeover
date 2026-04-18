import { OutreachTopbar } from "@/components/outreach-topbar";

const SAMPLES = [
  "amenti scrape google --industry=Plumbing --city=\"Los Angeles, CA\" --count=50",
  "amenti audit https://example-hvac.com",
  "amenti rebuild <site-id> --direction \"dark palette, trust badges\"",
  "amenti email draft <business-id> --tone blunt",
  "amenti sync <business-id> --to crm",
];

export default function CliProxyPage() {
  return (
    <>
      <OutreachTopbar activeHref="/outreach" />
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-3xl rounded-lg border border-slate-800 bg-black p-5 font-mono text-sm text-emerald-300">
          <div className="mb-2 text-slate-400"># Amenti CLI · proxy mode</div>
          {SAMPLES.map((s, i) => (
            <div key={i} className="py-0.5">
              <span className="text-slate-500">$</span> {s}
            </div>
          ))}
          <div className="mt-3 text-slate-500">
            # Run these in a terminal against the HTTP API. A local CLI binary
            will be published soon.
          </div>
        </div>
      </div>
    </>
  );
}
