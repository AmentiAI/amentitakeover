/**
 * Probe one explicit URL with the deepScrapeSite logic and dump every form
 * candidate (not just the picked one) so we can debug why a form might be
 * missed or scored too low.
 *
 * Run: tsx scripts/probe-one.ts https://www.calcagnilaw.com/
 */
import { deepScrapeSite } from "../src/lib/deep-scraper";
import { scrapeSite } from "../src/lib/scraper";

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: tsx scripts/probe-one.ts <url>");
    process.exit(1);
  }

  console.log(`\n=== deepScrapeSite ${url} ===`);
  const t0 = Date.now();
  const deep = await deepScrapeSite(url);
  console.log(`Took ${Date.now() - t0}ms`);
  console.log(`pages crawled: ${deep.pages.length}`);
  console.log(`emails: ${deep.emails.join(", ") || "(none)"}`);
  console.log(`phones: ${deep.phones.join(", ") || "(none)"}`);
  console.log(
    `picked contactForm: ${
      deep.contactForm
        ? `${deep.contactForm.method} ${deep.contactForm.action} (${deep.contactForm.fields.length} fields, score=${deep.contactForm.score}, page=${deep.contactForm.pageKind} ${deep.contactForm.pageUrl})`
        : "(NONE)"
    }`,
  );

  // Now individually re-scrape each crawled page to dump every form on it.
  console.log("\n=== per-page form dump ===");
  for (const p of deep.pages) {
    try {
      const sub = await scrapeSite(p.url);
      console.log(`\n--- ${p.kind} :: ${p.url} (${sub.forms.length} forms) ---`);
      for (const f of sub.forms) {
        console.log(
          `  ${f.method} ${f.action} (score=${f.score}, fields=${f.fields.length}, hasEmail=${f.hasEmailField}, hasMsg=${f.hasMessageField})`,
        );
        for (const field of f.fields) {
          const tag = field.required ? " *" : "";
          console.log(`    - ${field.name} (${field.type})${tag}${field.label ? ` :: ${field.label}` : ""}${field.placeholder ? ` [${field.placeholder}]` : ""}`);
        }
      }
    } catch (err) {
      console.log(`  ERROR: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
