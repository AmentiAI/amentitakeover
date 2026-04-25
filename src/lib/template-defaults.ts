// Local SVG fallback images used by SafeImg when a scraped or generated
// image URL fails to load. Keeps the templates visually populated instead
// of leaving empty slots when third-party CDNs hotlink-block our requests.
//
// Hero is intentionally absent — pest/roofing render canvas heroes and the
// site template falls back to its CSS palette on miss.

export const DEFAULT_BANNER_ABOUT = "/templates/defaults/banner-about.svg";
export const DEFAULT_BANNER_SERVICES = "/templates/defaults/banner-services.svg";
export const DEFAULT_BANNER_CTA = "/templates/defaults/banner-cta.svg";

export const DEFAULT_SERVICE_CARDS = [
  "/templates/defaults/service-1.svg",
  "/templates/defaults/service-2.svg",
  "/templates/defaults/service-3.svg",
];

export const DEFAULT_GALLERY = [
  "/templates/defaults/gallery-1.svg",
  "/templates/defaults/gallery-2.svg",
  "/templates/defaults/gallery-3.svg",
  "/templates/defaults/gallery-4.svg",
];

export function defaultGalleryAt(i: number): string {
  return DEFAULT_GALLERY[i % DEFAULT_GALLERY.length];
}

export function defaultServiceAt(i: number): string {
  return DEFAULT_SERVICE_CARDS[i % DEFAULT_SERVICE_CARDS.length];
}
