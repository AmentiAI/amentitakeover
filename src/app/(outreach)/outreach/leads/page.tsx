import { OutreachTopbar } from "@/components/outreach-topbar";
import { LeadFetcherForm } from "./lead-fetcher-form";
import { KNOWN_INDUSTRIES } from "@/lib/lead-fetcher";

// One-click lead generation. Fills out a form, hits Overpass via the API,
// imports up to N businesses (with websites) into ScrapedBusiness. The
// scrape happens in a separate step on /outreach/queue.
export default function LeadsPage() {
  return (
    <>
      <OutreachTopbar activeHref="/outreach/leads" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-3xl space-y-6">
          <header>
            <h1 className="text-lg font-semibold text-white">Lead generator</h1>
            <p className="mt-1 text-xs text-slate-400">
              Pulls businesses (with websites) from OpenStreetMap, drops them
              into your scrape queue. Free, no API key. Once imported, head
              to{" "}
              <a href="/outreach/queue" className="text-emerald-300 underline">
                Queue
              </a>{" "}
              and click <strong>Run all</strong> to scrape them.
            </p>
          </header>
          <LeadFetcherForm knownIndustries={KNOWN_INDUSTRIES} />
        </div>
      </div>
    </>
  );
}
