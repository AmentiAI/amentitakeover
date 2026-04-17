import { getOpenAI, callOpenAI } from "@/lib/openai";

/**
 * Build an image-generation brief from scraped business context. The brief
 * is a compact JSON shape the site-image generator uses to render:
 *   - one landscape hero
 *   - N square gallery images
 *
 * Uses OpenAI to read the scrape (name, category, description, headings,
 * palette) and produce a style direction + 5 visual prompts that all look
 * like they belong to the same brand. Falls back to a deterministic
 * template-based brief if OpenAI isn't configured.
 */

export type BusinessContext = {
  name: string;
  category: string | null;
  industry: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  headings: string[]; // flattened strings
  palette: string[]; // hex codes
};

export type ImageBrief = {
  styleDirection: string;
  heroPrompt: string;
  galleryPrompts: string[];
};

const SYSTEM = `You write compact image-generation prompts for small-business marketing websites.

You'll get scraped context about the business. Return JSON ONLY, matching:
{
  "styleDirection": "<one sentence: consistent visual style — lens, lighting, palette, mood>",
  "heroPrompt": "<landscape 3:2 hero image prompt — wide, atmospheric, on-brand>",
  "galleryPrompts": ["<square image>", "<square image>", "<square image>", "<square image>"]
}

Rules for every prompt:
- Photorealistic. Documentary / editorial look unless the brand reads as artisan/craft/luxury.
- NEVER include text, words, logos, signs, storefront text, price tags, license plates, screens, banners.
- NEVER include human faces clearly visible — from behind / over shoulder / hands working is fine.
- Match the business's trade: show the WORK (roofing = roof install close-ups; electrician = panels/wiring/EV chargers; salon = scissors/products/chairs; restaurant = food/kitchen). Never generic stock ideas.
- Compose differently each frame: mix wide establishing, close-up detail, process/in-progress, finished result.
- Incorporate the brand palette subtly where natural (not literal color swatches).
- 60-100 words per prompt, no markdown.`;

export async function buildImageBrief(ctx: BusinessContext): Promise<ImageBrief> {
  if (!getOpenAI()) return fallbackBrief(ctx);

  const userInput = [
    `Business name: ${ctx.name}`,
    `Category: ${ctx.category ?? ctx.industry ?? "local service business"}`,
    `Location: ${[ctx.city, ctx.state].filter(Boolean).join(", ") || "unknown"}`,
    `Description: ${ctx.description ?? "(none)"}`,
    `Palette (hex): ${ctx.palette.slice(0, 5).join(", ") || "(none)"}`,
    `Headings:\n${ctx.headings.slice(0, 15).map((h) => `- ${h}`).join("\n")}`,
  ].join("\n");

  try {
    const { text } = await callOpenAI({
      system: SYSTEM,
      user: userInput,
      maxTokens: 1200,
      jsonMode: true,
    });
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallbackBrief(ctx);
    const parsed = JSON.parse(match[0]) as Partial<ImageBrief>;
    const hero = typeof parsed.heroPrompt === "string" ? parsed.heroPrompt.trim() : "";
    const style =
      typeof parsed.styleDirection === "string" ? parsed.styleDirection.trim() : "";
    const gallery = Array.isArray(parsed.galleryPrompts)
      ? parsed.galleryPrompts.filter((p): p is string => typeof p === "string" && p.length > 10)
      : [];
    if (!hero || gallery.length === 0) return fallbackBrief(ctx);
    return {
      styleDirection: style || "Documentary editorial photography, soft natural light, on-brand palette.",
      heroPrompt: withStyle(hero, style),
      galleryPrompts: gallery.slice(0, 6).map((p) => withStyle(p, style)),
    };
  } catch {
    return fallbackBrief(ctx);
  }
}

function withStyle(prompt: string, style: string): string {
  if (!style) return prompt;
  if (prompt.toLowerCase().includes(style.slice(0, 12).toLowerCase())) return prompt;
  return `${prompt} Style: ${style}`;
}

function fallbackBrief(ctx: BusinessContext): ImageBrief {
  const trade = (ctx.category ?? ctx.industry ?? "local business").toLowerCase();
  const loc = [ctx.city, ctx.state].filter(Boolean).join(", ") || "a quiet neighborhood";
  const style =
    "Photorealistic documentary editorial, soft natural light, warm highlights, shallow depth of field, no text, no logos, no visible faces.";
  const subjects = tradeSubjects(trade);
  return {
    styleDirection: style,
    heroPrompt: `Wide atmospheric landscape shot of ${subjects.hero} in ${loc}. Cinematic early-morning light, sky mood, no signage, no text, no faces. ${style}`,
    galleryPrompts: subjects.gallery.map(
      (sub) => `Close-up editorial photograph of ${sub}. Hands-on process in the frame, textured surfaces, clean composition, no text. ${style}`,
    ),
  };
}

function tradeSubjects(trade: string): { hero: string; gallery: string[] } {
  if (/locksmith|security|safe/.test(trade)) {
    // gpt-image-1 safety filter flags "locksmith" and "lock-picking" imagery.
    // Describe the hardware/work environment instead of the act itself.
    return {
      hero: "a modern matte-black smart door handle on a sleek front door at golden hour, soft shadow across the threshold",
      gallery: [
        "a neat row of brass and nickel door handles on a clean workbench, wood grain beneath",
        "a close-up of a polished deadbolt installed on a stained oak door, morning light",
        "a modern keypad entry pad glowing softly on a residential front door at dusk",
        "a tidy hardware workshop with organized drawers of hinges and door hardware, warm light",
      ],
    };
  }
  if (/plumb|hvac|heating|cooling|ac |a\/c|boiler/.test(trade)) {
    return {
      hero: "a freshly installed tankless water heater on a clean utility room wall, copper supply lines gleaming",
      gallery: [
        "gloved hands tightening a pipe wrench on a chrome fitting, water droplets on the copper",
        "a brand-new high-efficiency furnace installed in a clean basement, ductwork overhead",
        "a modern thermostat mounted on a wall, warm indoor light behind it",
        "a pressure gauge and tool roll on a neat workbench, organized plumbing parts",
      ],
    };
  }
  if (/roof/.test(trade)) {
    return {
      hero: "a freshly installed asphalt shingle roof on a craftsman home, neat ridge cap, gutters in frame",
      gallery: [
        "gloved hands nailing shingles on decking with synthetic underlayment visible",
        "a worker's boots on a steep roof pitch, tool belt slung across the waist, city skyline in distance",
        "clean new metal flashing around a brick chimney against a blue sky",
        "a rolled bundle of architectural shingles on a fresh deck, hammer resting nearby",
      ],
    };
  }
  if (/electric/.test(trade)) {
    return {
      hero: "a newly installed modern electrical panel inside a clean utility room, copper bus bars visible",
      gallery: [
        "hands working with wire strippers on stranded copper, circuit breaker on a workbench",
        "a Level 2 EV charger mounted on an exterior garage wall at dusk, car silhouette nearby",
        "neatly bundled conduit runs down a commercial wall, warm ambient lighting",
        "a voltmeter on an outlet during a diagnostic, hand steady on the probe",
      ],
    };
  }
  if (/salon|barber|hair/.test(trade)) {
    return {
      hero: "an immaculate modern salon interior with a row of styling chairs, golden-hour sidelight",
      gallery: [
        "close-up of scissors cutting a fresh fringe, soft focus hands",
        "a neat lineup of amber hair product bottles on a marble counter",
        "clean sweep of a freshly cut floor, reflections in a polished mirror",
        "a leather styling chair and tool caddy in warm natural light",
      ],
    };
  }
  if (/restaurant|cafe|kitchen|food/.test(trade)) {
    return {
      hero: "a cozy bistro dining room at golden hour, warm edison bulbs, empty tables set with linen",
      gallery: [
        "chef's hands plating a seasonal dish with tweezers, herb garnish mid-fall",
        "steam rising from a bubbling sauté pan on a gas range",
        "a matte ceramic bowl of soup with a spoon resting on the rim, marble counter",
        "fresh produce — citrus, herbs, tomatoes — on a wooden prep board",
      ],
    };
  }
  if (/landscap|lawn|garden/.test(trade)) {
    return {
      hero: "a pristine suburban backyard at dusk, freshly cut lawn striping, mature trees, soft golden light",
      gallery: [
        "gloved hands trimming boxwood with shears, leaves mid-fall",
        "a zero-turn mower on a green lawn, crisp stripes behind it",
        "a stone path winding through a planted bed of perennials, dew on leaves",
        "a leaf blower lifting autumn leaves against warm afternoon light",
      ],
    };
  }
  return {
    hero: `a clean, professional workspace for ${trade}, warm natural light`,
    gallery: [
      `a professional tool laid out on a workbench relating to ${trade}`,
      `a close-up of hands at work in the trade of ${trade}`,
      `the finished result of a ${trade} job, neat and polished`,
      `an establishing interior shot of a ${trade} business, empty, clean`,
    ],
  };
}
