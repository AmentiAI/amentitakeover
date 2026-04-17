/**
 * Brand color picker. Takes the raw hex soup scraped from a site and tries to
 * pick colors that actually look like brand colors.
 *
 * Input `hexes` should be ordered by frequency (most-used first). The scraper
 * provides this ordering. Position in the list is used as a usage signal —
 * a color the site uses 40 times is much more likely to be the brand color
 * than one that appears once.
 *
 * Returns null when nothing usable is found so callers can fall back to a
 * pinned default palette.
 */

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

export type PickedPalette = {
  base: string;
  accent: string;
  trust: string;
};

// Known CMS-default palettes we should NOT interpret as brand colors.
// Each of these is enumerated in the CMS stylesheet regardless of whether
// the site actually uses the color. Without filtering, a random Gutenberg
// "pale pink" outranks the site's real navy.
const CMS_DEFAULT_HEXES = new Set<string>([
  // WordPress Gutenberg default color palette (block editor)
  "#f78da7", "#cf2e2e", "#ff6900", "#fcb900", "#7bdcb5",
  "#00d084", "#8ed1fc", "#0693e3", "#9b51e0", "#abb8c3",
  "#32373c",
  // Wix editor default theme swatches (common Thunderbird blue family)
  "#116dff", "#ff4040", "#7fccf7", "#3899ec", "#0f2ccf",
  "#2f5dff", "#597dff", "#acbeff", "#d5dfff", "#eaefff", "#f5f7ff",
]);

export function pickBrandPalette(hexes: string[]): PickedPalette | null {
  // Parse + preserve order (order == frequency rank from the scraper).
  const parsed = hexes
    .map((hex, rank) => ({ hex, rank, rgb: parseHex(hex) }))
    .filter((x): x is { hex: string; rank: number; rgb: RGB } => x.rgb != null)
    .map(({ rgb, rank, hex }) => ({
      rgb,
      hsl: rgbToHsl(rgb),
      hex: rgbToHex(rgb).toLowerCase(),
      rank,
    }))
    .filter(({ hex }) => !CMS_DEFAULT_HEXES.has(hex));

  const usable = parsed.filter(({ hsl }) => isUsableBrand(hsl));
  if (usable.length === 0) return null;

  // Score each candidate: combine frequency rank (usage) + saturation
  // (brandness) + mid-lightness preference. Colors the site uses a lot
  // should win even if a one-off neon is more saturated.
  const scored = usable
    .map((c) => {
      // rank 0 → 1.0, rank 10 → ~0.45, rank 30+ → small — smooth decay.
      const freq = 1 / Math.sqrt(1 + c.rank);
      const sat = c.hsl.s; // 0..1
      const midLight = 1 - Math.abs(c.hsl.l - 0.5) * 2; // peaks at 0.5
      return {
        ...c,
        score: freq * 1.6 + sat * 0.9 + midLight * 0.25,
      };
    })
    .sort((a, b) => b.score - a.score);

  const accentPick = scored[0];
  const accent = rgbToHex(hslToRgb(clampLightness(accentPick.hsl, 0.36, 0.58)));

  // Base: a dark, low-saturation cousin of the accent — not pure black.
  const baseHsl: HSL = {
    h: accentPick.hsl.h,
    s: Math.min(accentPick.hsl.s, 0.32),
    l: 0.11,
  };
  const base = rgbToHex(hslToRgb(baseHsl));

  // Trust: pick the next usable hue at least 35° off the accent, else
  // complement the accent hue.
  const second = scored
    .slice(1)
    .find((c) => hueDistance(c.hsl.h, accentPick.hsl.h) >= 35);
  const trustHsl: HSL = second
    ? clampLightness(second.hsl, 0.32, 0.55)
    : { h: (accentPick.hsl.h + 180) % 360, s: 0.45, l: 0.42 };
  const trust = rgbToHex(hslToRgb(trustHsl));

  return { base, accent, trust };
}

function isUsableBrand(hsl: HSL): boolean {
  // Loosened vs prior: dark navies (l≈0.10) and muted greens (s≈0.12) should
  // survive — those are often real brand colors.
  if (hsl.s < 0.12) return false;
  if (hsl.l < 0.08 || hsl.l > 0.92) return false;
  return true;
}

function clampLightness(hsl: HSL, min: number, max: number): HSL {
  return { h: hsl.h, s: hsl.s, l: Math.max(min, Math.min(max, hsl.l)) };
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function parseHex(input: string): RGB | null {
  const raw = input.trim().replace(/^#/, "");
  const full =
    raw.length === 3
      ? raw.split("").map((c) => c + c).join("")
      : raw.length === 6
        ? raw
        : null;
  if (!full || !/^[0-9a-f]{6}$/i.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const pad = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${pad(r)}${pad(g)}${pad(b)}`;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case R:
        h = (G - B) / d + (G < B ? 6 : 0);
        break;
      case G:
        h = (B - R) / d + 2;
        break;
      default:
        h = (R - G) / d + 4;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const Hp = (((h % 360) + 360) % 360) / 60;
  const X = C * (1 - Math.abs((Hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (Hp < 1) [r1, g1, b1] = [C, X, 0];
  else if (Hp < 2) [r1, g1, b1] = [X, C, 0];
  else if (Hp < 3) [r1, g1, b1] = [0, C, X];
  else if (Hp < 4) [r1, g1, b1] = [0, X, C];
  else if (Hp < 5) [r1, g1, b1] = [X, 0, C];
  else[r1, g1, b1] = [C, 0, X];
  const m = l - C / 2;
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}
