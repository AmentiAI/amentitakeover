import { getOpenAI, callOpenAI } from "@/lib/openai";

/**
 * Build an image-generation brief from scraped business context.
 *
 * A site needs distinct art for each section and for every service card.
 * This brief produces prompts for:
 *   - 1 landscape hero (home page)
 *   - 3 landscape section banners (about, services, contact/CTA)
 *   - 6 square service-card images (one per service, matched by title)
 *   - 6 square gallery images (work detail shots)
 * = 16 unique visuals per site.
 */

export type BusinessContext = {
  name: string;
  category: string | null;
  industry: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  headings: string[];
  palette: string[];
  textContent: string | null;
  serviceTitles: string[];
};

export type ImageBrief = {
  styleDirection: string;
  heroPrompt: string;
  aboutBannerPrompt: string;
  servicesBannerPrompt: string;
  ctaBannerPrompt: string;
  serviceCardPrompts: string[];
  galleryPrompts: string[];
};

const SYSTEM = `You write compact image-generation prompts for small-business marketing websites.

You'll get scraped context about the business, including real page copy and the list of actual services. Return JSON ONLY, matching:
{
  "styleDirection": "<one sentence: consistent visual style — lens, lighting, palette, mood>",
  "heroPrompt": "<landscape 3:2 hero image prompt — wide, atmospheric, flagship shot>",
  "aboutBannerPrompt": "<landscape 3:2 about-section banner — narrative, human, environmental>",
  "servicesBannerPrompt": "<landscape 3:2 services-section banner — showing the breadth of work>",
  "ctaBannerPrompt": "<landscape 3:2 contact/CTA banner — warm inviting, finished-result or exterior context>",
  "serviceCardPrompts": ["<square, service 1>", "<square, service 2>", ..., "<square, service N>"],
  "galleryPrompts": ["<square>", "<square>", "<square>", "<square>", "<square>", "<square>"]
}

CRITICAL RULES:
- Every image MUST feel like the same brand (same lighting, palette, mood) but depict something DIFFERENT.
- Photorealistic, documentary / editorial commercial photography. Ultra-sharp detail. Real texture.
- The serviceCardPrompts array MUST have one entry per service in the provided service list, in the same order. Each image should depict the SPECIFIC service, not a generic shot.
- Use the provided real page copy to make images feel tied to the business's actual work (e.g., if they mention "custom cedar decks", show a cedar deck; if "mid-century homes", use that aesthetic).
- NEVER include text, words, numbers, logos, signs, storefront text, price tags, license plates, screens, banners, or readable letters of any kind.
- NEVER include human faces clearly visible — from behind / over shoulder / hands working is fine.
- Match the business's trade literally: roofing = roof install close-ups; electrician = panels/EV chargers/breakers; salon = scissors/products/chairs; restaurant = food/kitchen; etc. Never generic stock.
- Cover range: wide establishing hero, narrative about-banner, breadth-of-work services banner, warm CTA banner, then per-service close-ups, then gallery details (tools, process, finished results).
- Incorporate the brand palette subtly where natural (not literal color swatches).
- 80-140 words per prompt, no markdown, no bullet lists — plain imperative description.`;

export async function buildImageBrief(ctx: BusinessContext): Promise<ImageBrief> {
  if (!getOpenAI()) return fallbackBrief(ctx);

  const serviceList = ctx.serviceTitles.length
    ? ctx.serviceTitles.map((t, i) => `  ${i + 1}. ${t}`).join("\n")
    : "  (none — infer from trade)";

  const body = ctx.textContent?.slice(0, 2400) ?? "";
  const userInput = [
    `Business name: ${ctx.name}`,
    `Category: ${ctx.category ?? ctx.industry ?? "local service business"}`,
    `Location: ${[ctx.city, ctx.state].filter(Boolean).join(", ") || "unknown"}`,
    `Description: ${ctx.description ?? "(none)"}`,
    `Palette (hex): ${ctx.palette.slice(0, 5).join(", ") || "(none)"}`,
    `Services to illustrate (in order):\n${serviceList}`,
    `Scraped headings:\n${ctx.headings.slice(0, 20).map((h) => `- ${h}`).join("\n") || "(none)"}`,
    `Scraped page copy excerpt:\n${body || "(none)"}`,
  ].join("\n\n");

  try {
    const { text } = await callOpenAI({
      system: SYSTEM,
      user: userInput,
      maxTokens: 3200,
      jsonMode: true,
    });
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return fallbackBrief(ctx);
    const parsed = JSON.parse(match[0]) as Partial<ImageBrief>;
    const style = str(parsed.styleDirection);
    const hero = str(parsed.heroPrompt);
    const aboutBanner = str(parsed.aboutBannerPrompt);
    const servicesBanner = str(parsed.servicesBannerPrompt);
    const ctaBanner = str(parsed.ctaBannerPrompt);
    const serviceCards = Array.isArray(parsed.serviceCardPrompts)
      ? parsed.serviceCardPrompts.filter((p): p is string => typeof p === "string" && p.length > 10)
      : [];
    const gallery = Array.isArray(parsed.galleryPrompts)
      ? parsed.galleryPrompts.filter((p): p is string => typeof p === "string" && p.length > 10)
      : [];

    if (!hero || gallery.length === 0) return fallbackBrief(ctx);
    const fb = fallbackBrief(ctx);

    return {
      styleDirection: style || fb.styleDirection,
      heroPrompt: withStyle(hero, style),
      aboutBannerPrompt: withStyle(aboutBanner || fb.aboutBannerPrompt, style),
      servicesBannerPrompt: withStyle(servicesBanner || fb.servicesBannerPrompt, style),
      ctaBannerPrompt: withStyle(ctaBanner || fb.ctaBannerPrompt, style),
      serviceCardPrompts: padServiceCards(
        serviceCards.map((p) => withStyle(p, style)),
        ctx,
        fb.serviceCardPrompts,
      ),
      galleryPrompts: gallery.slice(0, 6).map((p) => withStyle(p, style)),
    };
  } catch {
    return fallbackBrief(ctx);
  }
}

function padServiceCards(fromLLM: string[], ctx: BusinessContext, fallback: string[]): string[] {
  const count = Math.max(ctx.serviceTitles.length, 6);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(fromLLM[i] ?? fallback[i] ?? fallback[i % fallback.length] ?? "");
  }
  return out.filter(Boolean);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
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
    "Photorealistic commercial editorial photography, 35mm lens, soft natural light, warm highlights, shallow depth of field, no text, no logos, no visible faces, ultra-sharp detail.";
  const set = tradeImages(trade, loc);
  const brand = briefContext(ctx);
  const serviceCards = (ctx.serviceTitles.length ? ctx.serviceTitles : new Array(6).fill("")).map(
    (title, i) =>
      title
        ? `Photorealistic square image depicting ${ctx.name}'s "${title}" service in ${loc}. Show the specific work, tools, and finished result a real ${trade} would produce. ${brand} No text or logos, editorial composition. ${style}`
        : `${ctx.name} — ${set.gallery[i % set.gallery.length]}. ${brand} ${style}`,
  );
  return {
    styleDirection: style,
    heroPrompt: `${ctx.name} in ${loc}: ${set.hero} ${brand} ${style}`,
    aboutBannerPrompt: `${ctx.name} — ${set.aboutBanner} ${brand} ${style}`,
    servicesBannerPrompt: `${ctx.name} — ${set.servicesBanner} ${brand} ${style}`,
    ctaBannerPrompt: `${ctx.name} — ${set.ctaBanner} ${brand} ${style}`,
    serviceCardPrompts: serviceCards,
    galleryPrompts: set.gallery.slice(0, 6).map((g) => `${ctx.name} — ${g} ${brand} ${style}`),
  };
}

function briefContext(ctx: BusinessContext): string {
  const bits: string[] = [];
  if (ctx.description) {
    const d = ctx.description.replace(/\s+/g, " ").trim().slice(0, 180);
    if (d) bits.push(`Business context: ${d}`);
  }
  if (ctx.serviceTitles.length) {
    bits.push(`Services offered: ${ctx.serviceTitles.slice(0, 6).join(", ")}.`);
  }
  if (ctx.palette.length) {
    bits.push(`Accent colors: ${ctx.palette.slice(0, 3).join(", ")} (use subtly, no color swatches).`);
  }
  return bits.join(" ");
}

type TradeImages = {
  hero: string;
  aboutBanner: string;
  servicesBanner: string;
  ctaBanner: string;
  gallery: string[];
};

function tradeImages(trade: string, loc: string): TradeImages {
  if (/locksmith|security|safe/.test(trade)) {
    return {
      hero: `Wide cinematic shot of a modern matte-black front door with brushed hardware on a home exterior in ${loc} at golden hour, soft shadow across the threshold.`,
      aboutBanner: `A clean organized workbench in a small hardware workshop, drawers of hinges and door hardware open, warm natural window light.`,
      servicesBanner: `An overhead flatlay of various locksets, deadbolts, and smart-entry pads arranged on linen, each category clearly separated.`,
      ctaBanner: `The inviting front porch of a craftsman home at dusk with a keypad entry glowing softly, warm lights in the windows.`,
      gallery: [
        "a neat row of brass and nickel door handles on a clean workbench, wood grain beneath",
        "a close-up of a polished deadbolt installed on a stained oak door, morning light",
        "a modern keypad entry pad glowing softly on a residential front door at dusk",
        "a service van interior with custom-built drawers of cut keys and hardware, organized",
        "key cutting machine producing a fresh brass key, copper shavings catching light",
        "a restored antique mortise lock on a weathered craftsman door, close-up",
      ],
    };
  }
  if (/plumb|hvac|heating|cooling|ac |a\/c|boiler/.test(trade)) {
    return {
      hero: `Wide cinematic shot of a freshly installed tankless water heater on a clean utility room wall in a ${loc} home, copper supply lines gleaming.`,
      aboutBanner: `A service van parked in front of a suburban home at dawn, tailgate open showing organized tools, soft warm light.`,
      servicesBanner: `A mechanical room with a new high-efficiency furnace and a row of PEX manifolds installed along one wall, labeled loops.`,
      ctaBanner: `A warmly lit modern kitchen with a running faucet and steam from a kettle, inviting domestic comfort.`,
      gallery: [
        "gloved hands tightening a pipe wrench on a chrome fitting, water droplets on the copper",
        "a modern thermostat mounted on a wall, warm indoor light behind it",
        "a pressure gauge and tool roll on a neat workbench, organized plumbing parts",
        "a rooftop HVAC condenser unit in crisp daylight with tidy refrigerant lines",
        "a technician's gloved hand holding refrigerant gauges against a clean AC unit",
        "a freshly installed sump pump with PVC piping in a clean basement utility room",
      ],
    };
  }
  if (/roof/.test(trade)) {
    return {
      hero: `Wide cinematic aerial shot of a freshly installed architectural shingle roof on a craftsman home in ${loc}, neat ridge cap, morning light, gutters in frame.`,
      aboutBanner: `A crew's boots and tool belts resting on a clean work truck tailgate with the first light of a jobsite morning behind them.`,
      servicesBanner: `A suburban rooftop overview showing neat shingle lines, flashing around a chimney, and a freshly sealed valley, blue sky above.`,
      ctaBanner: `A warmly lit craftsman home at dusk with a freshly finished roof and soft porch lights glowing, landscaped front yard.`,
      gallery: [
        "gloved hands nailing shingles on decking with synthetic underlayment visible",
        "a worker's boots on a steep roof pitch, tool belt slung across the waist, city skyline in distance",
        "clean new metal flashing around a brick chimney against a blue sky",
        "a seamless aluminum gutter run fastened along a fascia at golden hour",
        "a drone-perspective overhead of a crisply finished gable with ridge vent detail",
        "a stack of architectural shingles on a clean jobsite tarp, morning dew",
      ],
    };
  }
  if (/electric/.test(trade)) {
    return {
      hero: `Wide cinematic shot of a newly installed modern electrical panel inside a clean utility room in a ${loc} home, copper bus bars visible, neat wire routing.`,
      aboutBanner: `A service van interior with custom drawers of tools, breakers, and wire spools in an organized kit, warm lighting.`,
      servicesBanner: `A commercial wall with neatly bundled conduit runs, labeled junction boxes, and a new sub-panel installed clean.`,
      ctaBanner: `A modern home exterior at dusk with a Level 2 EV charger mounted on the garage wall, car silhouette nearby, landscape lighting.`,
      gallery: [
        "hands working with wire strippers on stranded copper, circuit breaker on a workbench",
        "a Level 2 EV charger mounted on an exterior garage wall at dusk, car silhouette nearby",
        "a voltmeter on an outlet during a diagnostic, hand steady on the probe",
        "under-cabinet LED strip lighting installed in a modern kitchen, warm glow",
        "a clean recessed can light install with exposed junction box, insulation around it",
        "a neatly wired smart thermostat hub behind a freshly painted wall plate",
      ],
    };
  }
  if (/salon|barber|hair/.test(trade)) {
    return {
      hero: `Wide cinematic shot of an immaculate modern salon interior in ${loc} with a row of styling chairs, golden-hour sidelight through tall windows.`,
      aboutBanner: `A close overhead of a marble counter with amber product bottles, fresh flowers, and brushed-gold shears, soft ambient light.`,
      servicesBanner: `A backwash area with soft towels and brushed brass fixtures, plants in the corner, clean morning light.`,
      ctaBanner: `A warmly lit reception area with a leather bench, plant shadows on a textured wall, welcoming end-of-day glow.`,
      gallery: [
        "close-up of scissors cutting a fresh fringe, soft focus hands",
        "a neat lineup of amber hair product bottles on a marble counter",
        "clean sweep of a freshly cut floor, reflections in a polished mirror",
        "a blowout in progress from behind, shiny hair catching window light",
        "a color bowl with freshly mixed gloss on a brushed metal tray",
        "a clean styling station with hot tools hung in an organized rail",
      ],
    };
  }
  if (/restaurant|cafe|kitchen|food/.test(trade)) {
    return {
      hero: `Wide cinematic shot of a cozy bistro dining room in ${loc} at golden hour, warm edison bulbs, empty tables set with linen, soft music-hour atmosphere.`,
      aboutBanner: `A chef's station with mise en place in ceramic bowls, wooden boards, and a simmering sauté pan, warm overhead light.`,
      servicesBanner: `A wood-fired oven glowing orange against dark brick, a pizza peel and stacked plates nearby, dramatic shadow play.`,
      ctaBanner: `The storefront of a small restaurant at dusk with warm interior light spilling out to a sidewalk, string lights above the entry.`,
      gallery: [
        "chef's hands plating a seasonal dish with tweezers, herb garnish mid-fall",
        "steam rising from a bubbling sauté pan on a gas range",
        "a matte ceramic bowl of soup with a spoon resting on the rim, marble counter",
        "fresh produce — citrus, herbs, tomatoes — on a wooden prep board",
        "a pour of natural wine into a stemless glass on a candlelit table",
        "a clean pass line with tickets clipped above, soft heat lamp glow",
      ],
    };
  }
  if (/landscap|lawn|garden/.test(trade)) {
    return {
      hero: `Wide cinematic shot of a pristine suburban backyard in ${loc} at dusk, freshly cut lawn striping, mature trees, soft golden landscape lighting.`,
      aboutBanner: `A crew's trailer parked beside a freshly finished front yard at dawn, mowers and tools organized neatly on the ramp.`,
      servicesBanner: `A designed planting bed of perennials, mulch, and ornamental grasses framing a stone walkway, crisp edges.`,
      ctaBanner: `A pristine front yard at golden hour with new sod, landscape lighting glowing along a walkway up to a clean-lined home.`,
      gallery: [
        "gloved hands trimming boxwood with shears, leaves mid-fall",
        "a zero-turn mower on a green lawn, crisp stripes behind it",
        "a stone path winding through a planted bed of perennials, dew on leaves",
        "a paver patio with ambient landscape lighting glowing as dusk falls",
        "a freshly edged bed line between mulch and turf, crisp morning light",
        "an irrigation spray catching sunlight over a flower bed",
      ],
    };
  }
  if (/paint|drywall|stucco/.test(trade)) {
    return {
      hero: `Wide cinematic shot of a freshly painted craftsman exterior in ${loc}, clean trim lines, late afternoon sidelight.`,
      aboutBanner: `A tidy interior job site with labeled paint cans, rolled canvas drop cloths, and an extension pole leaning against a freshly primed wall.`,
      servicesBanner: `Cabinet doors sprayed with a flawless satin finish, drying on racks in an organized spray room, soft overhead light.`,
      ctaBanner: `A warmly lit living room at dusk with freshly painted walls reflecting light, soft furniture and plants in frame.`,
      gallery: [
        "a taped-off door frame with crisp primer edges, masking tape catching light",
        "a roller cutting a clean line along a ceiling, soft ladder shadow",
        "a smooth freshly skimmed drywall wall awaiting primer, soft overhead light",
        "an exterior stucco patch blended seamlessly into a sunlit wall",
        "a spray booth with cabinet doors mid-coat, uniform finish",
        "a color swatch fan open on a drop cloth next to a sash brush",
      ],
    };
  }
  if (/auto|mechanic|tire|collision|detail/.test(trade)) {
    return {
      hero: `Wide cinematic shot of a bright modern auto shop in ${loc} with a car on a lift, clean epoxy floor, tool cabinets along the wall.`,
      aboutBanner: `A row of labeled tool cabinets and a parts counter in a spotless service bay, warm overhead shop lights.`,
      servicesBanner: `An alignment rack with laser heads attached to wheels, gauges glowing, organized scanner tablet nearby.`,
      ctaBanner: `A freshly detailed car under warm shop lighting at dusk, paint gleaming, wheels polished, parking lot beyond.`,
      gallery: [
        "gloved hands turning a torque wrench on a freshly mounted alloy wheel",
        "a diagnostic tablet hooked into an OBD port, engine bay in soft focus",
        "brake rotors and pads laid out on a clean shop towel, organized kit",
        "a detailer polishing a black hood with a dual-action buffer, reflections pristine",
        "a tire balance machine spinning up with a new tire mounted",
        "an oil drain pan beneath a freshly changed filter, clean shop floor",
      ],
    };
  }
  if (/clean|janitor|maid/.test(trade)) {
    return {
      hero: `Wide cinematic shot of a spotless modern living room in ${loc} at golden hour, vacuum lines visible on the rug, soft window light.`,
      aboutBanner: `A caddy of branded-color cleaning supplies on a freshly mopped tile floor, sunlight streaming across.`,
      servicesBanner: `A gleaming stainless steel kitchen after deep clean, no streaks, ambient morning light.`,
      ctaBanner: `A freshly cleaned and styled bedroom at dusk with folded throws, polished nightstand, warm lamp glow.`,
      gallery: [
        "gloved hands wiping a marble countertop, microfiber cloth mid-stroke",
        "a sparkling glass shower enclosure reflecting natural light, squeegee resting",
        "vacuum stripes on thick plush carpet in a sunlit bedroom",
        "a commercial lobby floor being buffed, warm overhead light across polished stone",
        "freshly polished stainless steel appliances, reflective surfaces crisp",
        "neatly folded and stacked linens on a made bed, soft morning light",
      ],
    };
  }
  if (/dent|dental|orthodont/.test(trade)) {
    return {
      hero: `Wide cinematic shot of a bright, modern dental operatory in ${loc} with ergonomic chair and large window, soft morning light.`,
      aboutBanner: `A sleek waiting room with linen sofas, muted textures, a curated bookshelf and plant in the corner.`,
      servicesBanner: `A tray of pristine dental instruments neatly arranged on sterile blue cloth, clinical key light.`,
      ctaBanner: `A welcoming practice entrance at dusk with soft interior light visible through glass, landscape lighting on a stone path.`,
      gallery: [
        "a modern intraoral scanner wand resting on a clean counter, soft clinical light",
        "a dentist's gloved hands preparing a composite resin, shallow depth of field",
        "a digital x-ray panel glowing softly on a wall-mounted monitor, clinical tones",
        "a clean sterilization station with autoclave pouches neatly stacked",
        "a set of clear aligners on a matte tray, soft key light",
        "a mirror and explorer on sterile cloth, clinic overhead light softened",
      ],
    };
  }
  return {
    hero: `Wide cinematic establishing shot of a clean, professional workspace for a ${trade} business in ${loc}, warm natural light, editorial composition.`,
    aboutBanner: `A behind-the-scenes environment for a ${trade} business — organized tools, materials, and workspace, warm depth of field.`,
    servicesBanner: `The breadth of a ${trade} business shown through neatly arranged equipment and materials, clean flatlay composition.`,
    ctaBanner: `The finished result of work from a ${trade} business, inviting environmental framing at dusk.`,
    gallery: [
      `a professional tool laid out on a workbench relating to ${trade}`,
      `a close-up of hands at work in the trade of ${trade}`,
      `the finished result of a ${trade} job, neat and polished`,
      `an establishing interior shot of a ${trade} business, empty, clean`,
      `a detail shot of materials used in ${trade} work, organized`,
      `a sign-off moment on a finished ${trade} job, environmental framing`,
    ],
  };
}
