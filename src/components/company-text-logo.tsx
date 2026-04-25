// Compact brand mark for nav / footer slots when the scrape didn't return a
// usable logo URL. Renders the company's initial(s) inside a styled square,
// followed by the wordmark — accepts a tone (light/dark) and an accent color
// so each template (roofing/pest/site) can dial in its own palette without
// re-implementing the layout.

import { SafeImg } from "@/components/safe-img";

type Tone = "light" | "dark";

type Props = {
  name: string;
  logoUrl?: string | null;
  // Hex or CSS color for the badge background when no image is available.
  // Defaults to a neutral slate that works against both light and dark chrome.
  accent?: string;
  tone?: Tone;
  // Wordmark size class — caller can override for compact / hero placements.
  className?: string;
};

export function CompanyTextLogo({
  name,
  logoUrl,
  accent = "#475569",
  tone = "light",
  className = "",
}: Props) {
  if (logoUrl) {
    return (
      <SafeImg
        src={logoUrl}
        alt={name}
        className="h-8 w-auto max-h-10 object-contain"
      />
    );
  }
  const initials = makeInitials(name);
  const text = tone === "light" ? "text-white" : "text-slate-900";
  return (
    <span className={`inline-flex items-center gap-2 ${text} ${className}`}>
      <span
        aria-hidden
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[12px] font-black tracking-tight text-white shadow-sm"
        style={{ background: accent }}
      >
        {initials}
      </span>
      <span className="font-bold tracking-tight">{name}</span>
    </span>
  );
}

function makeInitials(name: string): string {
  const cleaned = name.replace(/[^a-z0-9& ]+/gi, " ").trim();
  if (!cleaned) return "•";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
