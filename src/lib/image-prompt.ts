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
  "galleryPrompts": ["<square image>", "<square image>", "<square image>", "<square image>", "<square image>", "<square image>"]
}

You MUST return EXACTLY 6 gallery prompts. Each must depict a DIFFERENT subject / angle / moment — no two images should feel like duplicates.

Rules for every prompt:
- Photorealistic. Documentary / editorial look unless the brand reads as artisan/craft/luxury.
- NEVER include text, words, logos, signs, storefront text, price tags, license plates, screens, banners.
- NEVER include human faces clearly visible — from behind / over shoulder / hands working is fine.
- Match the business's trade: show the WORK (roofing = roof install close-ups; electrician = panels/wiring/EV chargers; salon = scissors/products/chairs; restaurant = food/kitchen). Never generic stock ideas.
- Cover a range across the 6 frames: wide establishing, tight detail, hands/process in progress, tools/equipment, finished result, environment/context. No repetition of subject or angle.
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
        "a service van interior with custom-built drawers of cut keys and hardware, organized",
        "a commercial glass door with a premium electronic access reader mounted beside it",
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
        "a rooftop HVAC condenser unit in crisp daylight with tidy refrigerant lines",
        "PEX manifold and a floor-mounted boiler in a clean mechanical room, labeled loops",
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
        "a drone-angle overview of a two-tone architectural shingle roof after install, crisp lines",
        "a seamless aluminum gutter run fastened along a fascia at golden hour",
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
        "under-cabinet LED strip lighting installed in a modern kitchen, warm glow",
        "a ceiling junction with recessed cans wired neatly into a new circuit, clean install",
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
        "a backwash basin with soft towels and brushed brass fixtures in clean light",
        "a blowout in progress from behind, shiny hair catching window light",
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
        "a barista pouring latte art into a ceramic cup, morning light through windows",
        "an open wood-fired oven glowing orange with a pizza blistering on the stone",
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
        "a paver patio with ambient landscape lighting glowing as dusk falls",
        "a freshly mulched planting bed framing a modern front walkway, crisp edges",
      ],
    };
  }
  if (/paint|drywall|stucco/.test(trade)) {
    return {
      hero: "a freshly painted craftsman exterior with clean trim lines, late afternoon sidelight",
      gallery: [
        "a taped-off door frame with crisp primer edges, masking tape catching light",
        "a roller cutting a clean line along a ceiling, soft ladder shadow",
        "an organized drop-cloth job site with labeled paint cans neatly arranged",
        "a smooth freshly skimmed drywall wall awaiting primer, soft overhead light",
        "a cabinet door sprayed with a flawless satin finish drying on racks",
        "an exterior stucco patch blended seamlessly into a sunlit wall",
      ],
    };
  }
  if (/auto|mechanic|tire|collision|detail/.test(trade)) {
    return {
      hero: "a bright modern auto shop bay with a car on a lift, clean epoxy floor, tool cabinets along the wall",
      gallery: [
        "gloved hands turning a torque wrench on a freshly mounted alloy wheel",
        "a diagnostic tablet hooked into an OBD port, engine bay in soft focus",
        "brake rotors and pads laid out on a clean shop towel, organized kit",
        "a detailer polishing a black hood with a dual-action buffer, reflections pristine",
        "an alignment rack with laser heads attached to wheels, gauges glowing",
        "a tidy parts wall of labeled bins in a well-lit shop interior",
      ],
    };
  }
  if (/clean|janitor|maid/.test(trade)) {
    return {
      hero: "a spotless modern living room at golden hour, vacuum lines visible on the rug, soft window light",
      gallery: [
        "gloved hands wiping a marble countertop, microfiber cloth mid-stroke",
        "a caddy of branded-color cleaning supplies on a freshly mopped tile floor",
        "a sparkling glass shower enclosure reflecting natural light, squeegee resting",
        "vacuum stripes on thick plush carpet in a sunlit bedroom",
        "a gleaming stainless steel kitchen after deep clean, no streaks",
        "a commercial lobby floor being buffed, warm overhead light across polished stone",
      ],
    };
  }
  if (/dent|dental|orthodont/.test(trade)) {
    return {
      hero: "a bright, modern dental operatory with ergonomic chair and large window, soft morning light",
      gallery: [
        "a tray of pristine dental instruments neatly arranged on sterile blue cloth",
        "a modern intraoral scanner wand resting on a clean counter, soft clinical light",
        "a sleek waiting room with linen sofas, muted textures, plant in the corner",
        "a dentist's gloved hands preparing a composite resin, shallow depth of field",
        "a digital x-ray panel glowing softly on a wall-mounted monitor, clinical tones",
        "a clean sterilization station with autoclave pouches neatly stacked",
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
      `a detail of the materials a ${trade} business uses, arranged tidily`,
      `an exterior establishing shot of a service vehicle for a ${trade} business at dawn`,
    ],
  };
}
