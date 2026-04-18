import type { SVGProps } from "react";

// Roofing-trade icons: shingle courses, standing-seam metal, clay tile,
// flat/membrane, gutter, skylight, ridge vent, and ice-dam. Stylized, not
// anatomically accurate — legible at 20–32 px.

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function ShingleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* three courses of shingles */}
      <path d="M3 9h18M3 14h18M3 19h18" />
      {/* offset tabs — top row */}
      <path d="M7 5v4M12 5v4M17 5v4" />
      {/* offset tabs — middle row (shifted) */}
      <path d="M5 10v4M10 10v4M15 10v4M20 10v4" />
      {/* offset tabs — bottom row */}
      <path d="M7 15v4M12 15v4M17 15v4" />
    </svg>
  );
}

export function MetalRoofIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* standing-seam vertical ribs on a pitched surface */}
      <path d="M4 21l4-18" />
      <path d="M9 21l3-18" />
      <path d="M14 21l2-18" />
      <path d="M19 21l1-18" />
      {/* eave line */}
      <path d="M3 21h18" />
    </svg>
  );
}

export function TileRoofIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* three overlapping tile courses — scalloped */}
      <path d="M3 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
      <path d="M3 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
      <path d="M3 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
    </svg>
  );
}

export function FlatRoofIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* parapet box */}
      <rect x="3" y="8" width="18" height="10" rx="1" />
      {/* membrane seams */}
      <path d="M3 12h18M3 15h18" opacity=".55" />
      {/* drain scupper */}
      <path d="M19 12v3h3" />
    </svg>
  );
}

export function GutterIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* gutter trough under an eave */}
      <path d="M3 8c6 4 12 4 18 0" opacity=".55" />
      <path d="M3 10h18v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z" />
      {/* downspout */}
      <path d="M17 17v5" />
      {/* water drops */}
      <path d="M7 19v1M10 19v1M13 19v1" />
    </svg>
  );
}

export function SkylightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* roof slope */}
      <path d="M3 20L12 4l9 16" />
      {/* skylight pane (tilted rectangle on slope) */}
      <path d="M9 16l2-4 6 0 1 4z" />
      {/* mullion */}
      <path d="M12 12l1.5 4" opacity=".6" />
    </svg>
  );
}

export function RidgeVentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* peaked roof with ridge vent cap */}
      <path d="M3 18l9-10 9 10" />
      <path d="M8 10h8v-2H8z" />
      {/* vent slots */}
      <path d="M9 9h1M11 9h1M13 9h1M15 9h1" />
    </svg>
  );
}

export function IceDamIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* roof line */}
      <path d="M3 14l9-9 9 9" />
      {/* eave with icicles */}
      <path d="M4 14h16" />
      <path d="M6 14v3M10 14v4M14 14v3M18 14v5" />
      {/* snowflake hint */}
      <path d="M5 5l0 3M4 6l2 1M6 6l-2 1" opacity=".55" />
    </svg>
  );
}

export function HammerBadgeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* shield outline */}
      <path d="M12 3l8 3v5c0 4.5-3.2 8.5-8 10-4.8-1.5-8-5.5-8-10V6l8-3z" />
      {/* hammer inside */}
      <path d="M9 11l2-2 4 4-2 2z" />
      <path d="M11 9l3-3 2 2-3 3" />
    </svg>
  );
}
