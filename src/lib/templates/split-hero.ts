// Splits a hero/CTA headline on the first colon, em-dash, or hyphen so the
// fragment before the divider can be styled differently from the fragment
// after. Lives outside the section files so both server pages and the
// client-rendered section components can call it.
export function splitHero(title: string): { before: string; after: string } {
  const m = title.match(/^(.{4,40}?)[:—-]\s+(.+)$/);
  if (m) return { before: m[1].trim(), after: m[2].trim() };
  return { before: "", after: title };
}
