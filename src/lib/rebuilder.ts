import { getAnthropic, MODEL } from "./anthropic";
import type { ScrapeResult } from "./scraper";

export type RebuildInput = {
  site: ScrapeResult | {
    url: string;
    title: string | null;
    description: string | null;
    textContent: string | null;
    headings: unknown;
    images: unknown;
    palette: string[];
    fonts: string[];
  };
  direction?: string;
};

export type RebuildOutput = {
  html: string;
  notes: string;
  model: string;
};

const SYSTEM = `You are a senior product designer and front-end engineer.
You take a scraped website and produce an IMPROVED single-file rebuild in modern HTML + inline <style>.

Rules:
- Output one complete, standalone HTML document (<!doctype html>…</html>).
- Use Tailwind via CDN (<script src="https://cdn.tailwindcss.com"></script>) AND a small <style> block for custom touches (fonts, gradients).
- Keep the brand's core content — headlines, services, proof points — but rewrite copy to be sharper and benefit-led.
- Modernize the layout: clear hero, services grid, trust/social-proof, CTA, FAQ if relevant, footer.
- Use a refined palette derived from the source (or upgrade it tastefully). Accessible contrast.
- ONLY use image URLs that were scraped from the source website. Do NOT use Unsplash, Pexels, or any stock-photo service. If no suitable image exists in the scrape, omit imagery rather than filling with placeholders.
- Responsive + mobile-first. No JavaScript beyond Tailwind.
- Do NOT include explanation text inside the HTML — put design notes in a separate field.

Return ONLY JSON matching:
{"html":"<!doctype html>...</html>","notes":"<concise bullet-style rationale>"}`;

export async function rebuildSite(input: RebuildInput): Promise<RebuildOutput> {
  const client = getAnthropic();
  if (!client) {
    return {
      html: fallbackHtml(input),
      notes:
        "ANTHROPIC_API_KEY not set — returned a template fallback. Add the key to .env and try again for a real AI rebuild.",
      model: "fallback",
    };
  }

  const userPrompt = [
    `Source URL: ${input.site.url}`,
    `Title: ${input.site.title ?? ""}`,
    `Description: ${input.site.description ?? ""}`,
    `Palette: ${input.site.palette.join(", ")}`,
    `Fonts: ${input.site.fonts.join(", ")}`,
    `Headings: ${JSON.stringify(input.site.headings).slice(0, 4000)}`,
    `Images (first 12): ${JSON.stringify((input.site as any).images?.slice?.(0, 12) ?? []).slice(0, 3000)}`,
    `Body text (truncated): ${(input.site.textContent ?? "").slice(0, 8000)}`,
    input.direction
      ? `\nSpecial direction from user: ${input.direction}`
      : "",
    `\nProduce the improved rebuild now. Return JSON only.`,
  ].join("\n");

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = resp.content
    .map((c) => ("text" in c ? c.text : ""))
    .join("\n")
    .trim();

  const parsed = extractJson(text);
  if (!parsed || typeof parsed.html !== "string") {
    return {
      html: text.includes("<html") ? text : fallbackHtml(input),
      notes:
        parsed?.notes ??
        "Model did not return valid JSON; raw output used if HTML was present.",
      model: MODEL,
    };
  }

  return {
    html: parsed.html,
    notes: parsed.notes ?? "",
    model: MODEL,
  };
}

function extractJson(text: string): any | null {
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function fallbackHtml(input: RebuildInput): string {
  const title = input.site.title ?? "Rebuilt Site";
  const desc = input.site.description ?? "";
  const accent = input.site.palette[0] ?? "#0b1a2b";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body{font-family:Inter,system-ui,sans-serif}</style>
</head>
<body class="bg-slate-50 text-slate-900">
  <header class="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
    <div class="font-bold">${escapeHtml(title)}</div>
    <nav class="space-x-6 text-sm text-slate-600">
      <a href="#services">Services</a><a href="#about">About</a><a href="#contact">Contact</a>
    </nav>
  </header>
  <section class="max-w-6xl mx-auto px-6 py-20">
    <h1 class="text-5xl font-extrabold tracking-tight">${escapeHtml(title)}</h1>
    <p class="mt-4 max-w-2xl text-lg text-slate-600">${escapeHtml(desc)}</p>
    <a href="#contact" class="mt-8 inline-block rounded-full px-6 py-3 font-semibold text-white" style="background:${accent}">Get a free quote</a>
  </section>
  <section id="services" class="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
    ${["Fast Response", "Licensed & Insured", "Upfront Pricing"]
      .map(
        (s) =>
          `<div class="rounded-xl bg-white p-6 shadow-sm border border-slate-200"><div class="font-semibold">${s}</div><p class="mt-2 text-sm text-slate-600">We treat your property like our own.</p></div>`
      )
      .join("")}
  </section>
  <footer class="py-12 text-center text-sm text-slate-500">© ${new Date().getFullYear()} ${escapeHtml(title)}</footer>
</body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}
