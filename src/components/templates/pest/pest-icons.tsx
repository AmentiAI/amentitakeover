import type { SVGProps } from "react";

// Silhouette-style pest icons matched roughly to lucide's 24x24 / stroke-1.5
// sensibility. Each icon is stylized (not anatomical) — legible at 20–32 px
// sizes on a dark pest-template background.

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

export function AntIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* three body segments */}
      <ellipse cx="6" cy="12" rx="2" ry="1.6" />
      <circle cx="11" cy="12" r="1.5" />
      <ellipse cx="17" cy="12" rx="2.8" ry="2" />
      {/* legs */}
      <path d="M10.5 11l-1.5-3M11.5 13l-1 3M12 11l1.5-3M12 13l1 3M11 12h-4M12 12h4" />
      {/* antennae */}
      <path d="M18 11l2-2M19 12l2-1" />
    </svg>
  );
}

export function TermiteIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* elongated body */}
      <rect x="4" y="10" width="13" height="4" rx="2" />
      {/* head */}
      <circle cx="19" cy="12" r="2" />
      {/* wings (subtle) */}
      <path d="M9 10c-1-3 1-5 3-5M13 10c-1-3 1-5 3-5" opacity=".6" />
      {/* legs */}
      <path d="M7 14v2M10 14v2M13 14v2M7 10V8M10 10V8M13 10V8" />
      {/* pincers */}
      <path d="M20.5 11l1.5-1M20.5 13l1.5 1" />
    </svg>
  );
}

export function RodentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* body (teardrop-ish) */}
      <path d="M4 14c0-3 3-5 7-5s7 2 7 5c0 2-3 3-7 3s-7-1-7-3z" />
      {/* head */}
      <circle cx="18" cy="11" r="2.5" />
      {/* ear */}
      <circle cx="17" cy="8.5" r="1.3" />
      {/* eye */}
      <circle cx="19" cy="11" r=".5" fill="currentColor" stroke="none" />
      {/* tail */}
      <path d="M5 14c-1.5 0-3 1-3 3" />
      {/* feet */}
      <path d="M8 17v1.5M12 17v1.5M15 17v1.5" />
    </svg>
  );
}

export function WaspIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* head */}
      <circle cx="5" cy="12" r="1.8" />
      {/* thorax */}
      <circle cx="9" cy="12" r="1.8" />
      {/* striped abdomen */}
      <ellipse cx="15" cy="12" rx="4" ry="2.4" />
      <path d="M13 10.5v3M15 10v4M17 10.5v3" />
      {/* stinger */}
      <path d="M19 12l2 0" />
      {/* wings */}
      <path d="M9 10c2-3 5-3 7-1M9 14c2 3 5 3 7 1" opacity=".6" />
    </svg>
  );
}

export function MosquitoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* body */}
      <ellipse cx="12" cy="12" rx="4" ry="1.3" />
      {/* proboscis */}
      <path d="M8 12l-4 1" />
      {/* wings */}
      <path d="M10 10c-2-3-1-6 1-6M14 10c2-3 1-6-1-6" opacity=".65" />
      {/* long legs */}
      <path d="M9 13l-3 6M11 13l-1 6M13 13l1 6M15 13l3 6" />
      {/* antennae */}
      <path d="M7.5 11.5L4 9M8 12.5l-4 3" />
    </svg>
  );
}

export function CockroachIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* shell */}
      <ellipse cx="12" cy="12.5" rx="6" ry="4" />
      {/* head */}
      <ellipse cx="17" cy="12.5" rx="1.6" ry="1.3" />
      {/* center line */}
      <path d="M7 12.5h10" opacity=".5" />
      {/* legs */}
      <path d="M8 16l-2 3M11 16l-1 3M14 16l1 3M8 9l-2-3M11 9l-1-3M14 9l1-3" />
      {/* antennae */}
      <path d="M18 11.5l3-3M18 13.5l3 3" />
    </svg>
  );
}

export function SpiderIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="9" r="1.4" />
      {/* 8 legs */}
      <path d="M9 11L4 8M9 12L3 12M9 13L4 16M10 15l-2 5M14 15l2 5M15 11l5-3M15 12l6 0M15 13l5 3" />
    </svg>
  );
}

export function BedBugIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* flat oval body */}
      <ellipse cx="12" cy="12" rx="6" ry="4.5" />
      {/* segment lines */}
      <path d="M6 10c2 2 10 2 12 0M6 14c2-2 10-2 12 0" opacity=".5" />
      {/* antennae */}
      <path d="M6 10l-2-2M6 14l-2 2" />
      {/* legs */}
      <path d="M18 10l2-2M18 14l2 2M12 7.5V5M12 16.5V19" />
    </svg>
  );
}

export function HouseShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12l9-8 9 8" />
      <path d="M5 11v9h14v-9" />
      <path d="M9 20v-5h6v5" />
      {/* shield aura */}
      <path d="M12 3v2M3 12h2M19 12h2" opacity=".55" />
    </svg>
  );
}
