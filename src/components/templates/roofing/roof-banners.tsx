// Layered animated SVG banners for the roofing template's banner slots.
// Each banner is a full-panel decorative background (absolute-positioned,
// preserveAspectRatio="xMidYMid slice") designed to sit BENEATH the
// ridge/storm canvas overlays inside <RoofingBanner />. All animations use
// native SMIL so these render without JS and can live in server components.

type SvgProps = { className?: string };

const COMMON_SVG_PROPS = {
  preserveAspectRatio: "xMidYMid slice" as const,
  "aria-hidden": true,
};

// ---------- HOME: roof skyline with lightning + rain ----------

export function RoofSkylineBanner({ className = "" }: SvgProps) {
  return (
    <svg
      viewBox="0 0 1600 900"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      {...COMMON_SVG_PROPS}
    >
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1220" />
          <stop offset="55%" stopColor="#121c2e" />
          <stop offset="100%" stopColor="#0b1220" />
        </linearGradient>
        <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.35)" />
          <stop offset="60%" stopColor="rgba(251,191,36,0.08)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0)" />
        </radialGradient>
        <linearGradient id="back-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b2940" />
          <stop offset="100%" stopColor="#0b1220" />
        </linearGradient>
        <linearGradient id="mid-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#273349" />
          <stop offset="100%" stopColor="#0b1220" />
        </linearGradient>
        <linearGradient id="front-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e3a55" />
          <stop offset="100%" stopColor="#0b1220" />
        </linearGradient>
        <linearGradient id="lightning" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,245,200,0.98)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0.2)" />
        </linearGradient>
        <pattern id="shingle-pattern" width="26" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M0 12 L13 0 L26 12 Z"
            fill="none"
            stroke="rgba(251,191,36,0.10)"
            strokeWidth="0.7"
          />
        </pattern>
      </defs>

      <rect width="1600" height="900" fill="url(#sky-grad)" />

      {/* Atmosphere glow behind the skyline */}
      <circle cx="1200" cy="220" r="260" fill="url(#moon-glow)">
        <animate
          attributeName="r"
          values="260;280;260"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Distant storm clouds */}
      <g opacity="0.55">
        <ellipse cx="260" cy="180" rx="220" ry="32" fill="#1a2336" />
        <ellipse cx="460" cy="140" rx="260" ry="38" fill="#1a2336" />
        <ellipse cx="820" cy="120" rx="320" ry="42" fill="#1a2336" />
        <ellipse cx="1260" cy="170" rx="300" ry="40" fill="#1a2336" />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 40 0; 0 0"
          dur="40s"
          repeatCount="indefinite"
        />
      </g>

      {/* Lightning flash */}
      <g>
        <path
          d="M 880 0 L 860 260 L 910 260 L 870 520 L 960 240 L 900 240 L 940 0 Z"
          fill="url(#lightning)"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values="0;0;0;0;1;0.2;0.9;0;0;0"
            keyTimes="0;0.78;0.8;0.81;0.82;0.83;0.84;0.86;0.9;1"
            dur="9s"
            repeatCount="indefinite"
          />
        </path>
        <rect width="1600" height="900" fill="rgba(255, 245, 200, 0.08)" opacity="0">
          <animate
            attributeName="opacity"
            values="0;0;0;0;0.22;0.05;0.14;0;0;0"
            keyTimes="0;0.78;0.8;0.81;0.82;0.83;0.84;0.86;0.9;1"
            dur="9s"
            repeatCount="indefinite"
          />
        </rect>
      </g>

      {/* Back skyline (far) */}
      <g>
        <path
          d="M -20 640 L 120 520 L 260 640 L 260 560 L 380 480 L 500 560 L 620 480 L 740 560 L 740 640 L 900 520 L 1060 640 L 1060 580 L 1200 500 L 1340 580 L 1500 520 L 1620 640 L 1620 900 L -20 900 Z"
          fill="url(#back-roof)"
          opacity="0.85"
        />
      </g>

      {/* Mid skyline with shingle pattern fill */}
      <g>
        <path
          d="M -20 720 L 90 620 L 210 720 L 350 600 L 500 720 L 640 600 L 780 720 L 920 590 L 1070 720 L 1210 620 L 1340 720 L 1480 600 L 1620 720 L 1620 900 L -20 900 Z"
          fill="url(#mid-roof)"
        />
        <path
          d="M -20 720 L 90 620 L 210 720 L 350 600 L 500 720 L 640 600 L 780 720 L 920 590 L 1070 720 L 1210 620 L 1340 720 L 1480 600 L 1620 720 L 1620 900 L -20 900 Z"
          fill="url(#shingle-pattern)"
        />
      </g>

      {/* Front hero house */}
      <g>
        <path
          d="M 520 900 L 520 700 L 800 460 L 1080 700 L 1080 900 Z"
          fill="url(#front-roof)"
        />
        <path
          d="M 520 700 L 800 460 L 1080 700"
          fill="url(#shingle-pattern)"
          opacity="0.9"
        />
        {/* Chimney */}
        <rect x="960" y="520" width="48" height="90" fill="#121c2e" />
        {/* Window */}
        <rect
          x="760"
          y="760"
          width="80"
          height="70"
          fill="rgba(251,191,36,0.85)"
          rx="3"
        >
          <animate
            attributeName="fill"
            values="rgba(251,191,36,0.85);rgba(251,191,36,0.55);rgba(251,191,36,0.85)"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="800" y="760" width="2" height="70" fill="#0b1220" />
        <rect x="760" y="795" width="80" height="2" fill="#0b1220" />
        {/* Ridge line accent */}
        <line
          x1="520"
          y1="700"
          x2="800"
          y2="460"
          stroke="rgba(251,191,36,0.45)"
          strokeWidth="1.5"
        />
        <line
          x1="800"
          y1="460"
          x2="1080"
          y2="700"
          stroke="rgba(251,191,36,0.45)"
          strokeWidth="1.5"
        />
      </g>

      {/* Rain streaks */}
      <g stroke="rgba(148, 197, 255, 0.35)" strokeWidth="1" strokeLinecap="round">
        {Array.from({ length: 60 }).map((_, i) => {
          const x = (i * 29) % 1600;
          const delay = ((i * 137) % 100) / 100;
          const yStart = -60 - ((i * 53) % 200);
          return (
            <line
              key={i}
              x1={x}
              y1={yStart}
              x2={x - 18}
              y2={yStart + 28}
              opacity="0.7"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; -120 900"
                dur="1.2s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </line>
          );
        })}
      </g>
    </svg>
  );
}

// ---------- SERVICES: roof material cutaway (deck → underlayment → shingles) ----------

export function MaterialCutawayBanner({ className = "" }: SvgProps) {
  return (
    <svg
      viewBox="0 0 1600 900"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      {...COMMON_SVG_PROPS}
    >
      <defs>
        <linearGradient id="cut-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1220" />
          <stop offset="100%" stopColor="#0a111d" />
        </linearGradient>
        <linearGradient id="deck-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2b1a" />
          <stop offset="100%" stopColor="#1c140c" />
        </linearGradient>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0f2338" />
        </linearGradient>
        <linearGradient id="shingle-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a4a2f" />
          <stop offset="100%" stopColor="#2a2014" />
        </linearGradient>
        <pattern id="wood-grain" width="120" height="14" patternUnits="userSpaceOnUse">
          <path
            d="M0 7 Q30 2 60 7 T120 7"
            fill="none"
            stroke="rgba(251,191,36,0.12)"
            strokeWidth="0.7"
          />
        </pattern>
        <pattern id="shield-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill="transparent" />
          <path
            d="M0 16 L16 0 L32 16 L16 32 Z"
            fill="none"
            stroke="rgba(251,191,36,0.15)"
            strokeWidth="0.7"
          />
        </pattern>
      </defs>

      <rect width="1600" height="900" fill="url(#cut-bg)" />

      {/* Ambient glow */}
      <ellipse
        cx="800"
        cy="450"
        rx="700"
        ry="360"
        fill="rgba(251,191,36,0.06)"
      />

      {/* Cutaway roof — angled cross-section with 3 labeled layers */}
      <g transform="translate(200 180)">
        {/* Deck (bottom) */}
        <g>
          <path
            d="M 0 360 L 1100 200 L 1160 230 L 60 390 Z"
            fill="url(#deck-grad)"
          />
          <path
            d="M 0 360 L 1100 200 L 1160 230 L 60 390 Z"
            fill="url(#wood-grain)"
          />
        </g>
        {/* Underlayment (ice+water shield) */}
        <g>
          <path
            d="M 0 300 L 1100 140 L 1160 170 L 60 330 Z"
            fill="url(#shield-grad)"
          />
          <path
            d="M 0 300 L 1100 140 L 1160 170 L 60 330 Z"
            fill="url(#shield-pattern)"
          />
        </g>
        {/* Shingle course */}
        <g>
          <path
            d="M 0 240 L 1100 80 L 1160 110 L 60 270 Z"
            fill="url(#shingle-grad)"
          />
          {/* Individual shingle tabs */}
          {Array.from({ length: 22 }).map((_, i) => {
            const t = i / 22;
            const x1 = t * 1100;
            const y1 = 240 - t * 160;
            const x2 = (t + 1 / 22) * 1100;
            const y2 = 240 - (t + 1 / 22) * 160;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2 - 12}
                y2={y2 + 30}
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="1.3"
              />
            );
          })}
          {/* Top edge highlight */}
          <line
            x1="0"
            y1="240"
            x2="1100"
            y2="80"
            stroke="rgba(251,191,36,0.55)"
            strokeWidth="1.8"
          />
        </g>

        {/* Labels + connector lines */}
        <g fontFamily="ui-sans-serif, system-ui" fontWeight="700">
          {/* Shingles */}
          <g>
            <line
              x1="820"
              y1="170"
              x2="820"
              y2="40"
              stroke="rgba(251,191,36,0.5)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <circle cx="820" cy="170" r="5" fill="#fbbf24" />
            <text x="836" y="38" fill="#fbbf24" fontSize="14" letterSpacing="2">
              SHINGLES
            </text>
            <text x="836" y="58" fill="rgba(226,232,240,0.65)" fontSize="11" letterSpacing="1">
              Architectural asphalt · 25–50 yr rated
            </text>
          </g>
          {/* Ice+water shield */}
          <g>
            <line
              x1="540"
              y1="240"
              x2="540"
              y2="450"
              stroke="rgba(148,197,255,0.5)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <circle cx="540" cy="240" r="5" fill="rgb(148,197,255)" />
            <text x="556" y="460" fill="rgb(148,197,255)" fontSize="14" letterSpacing="2">
              ICE + WATER SHIELD
            </text>
            <text x="556" y="480" fill="rgba(226,232,240,0.65)" fontSize="11" letterSpacing="1">
              Self-adhering, waterproof underlayment
            </text>
          </g>
          {/* Deck */}
          <g>
            <line
              x1="260"
              y1="360"
              x2="260"
              y2="540"
              stroke="rgba(251,146,60,0.5)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <circle cx="260" cy="360" r="5" fill="rgb(251,146,60)" />
            <text x="276" y="560" fill="rgb(251,146,60)" fontSize="14" letterSpacing="2">
              DECK
            </text>
            <text x="276" y="580" fill="rgba(226,232,240,0.65)" fontSize="11" letterSpacing="1">
              Structural OSB — inspected for hold
            </text>
          </g>
        </g>

        {/* Moving water droplet that rolls off the shingle surface */}
        <g>
          <circle r="5" fill="rgba(148,197,255,0.95)">
            <animateMotion
              dur="4.5s"
              repeatCount="indefinite"
              path="M 40 230 L 1100 70"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="5" fill="rgba(148,197,255,0.95)">
            <animateMotion
              dur="4.5s"
              begin="1.5s"
              repeatCount="indefinite"
              path="M 40 230 L 1100 70"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="4.5s"
              begin="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>
    </svg>
  );
}

// ---------- ABOUT: crew silhouette on pitched roof at sunset ----------

export function CrewOnRidgeBanner({ className = "" }: SvgProps) {
  return (
    <svg
      viewBox="0 0 1600 900"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      {...COMMON_SVG_PROPS}
    >
      <defs>
        <linearGradient id="about-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1a0f" />
          <stop offset="40%" stopColor="#3d2416" />
          <stop offset="70%" stopColor="#1a1220" />
          <stop offset="100%" stopColor="#0b1220" />
        </linearGradient>
        <radialGradient id="about-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(251, 191, 36, 0.95)" />
          <stop offset="40%" stopColor="rgba(251, 146, 60, 0.6)" />
          <stop offset="100%" stopColor="rgba(251, 146, 60, 0)" />
        </radialGradient>
        <linearGradient id="about-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1108" />
          <stop offset="100%" stopColor="#070405" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#about-sky)" />

      {/* Setting sun */}
      <circle cx="1100" cy="520" r="320" fill="url(#about-sun)">
        <animate
          attributeName="r"
          values="320;340;320"
          dur="10s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="1100" cy="520" r="95" fill="rgba(251,191,36,0.92)" />

      {/* Distant hills */}
      <g opacity="0.7">
        <path
          d="M -20 680 Q 200 600 420 660 T 820 620 T 1200 660 T 1620 630 L 1620 900 L -20 900 Z"
          fill="#0f1422"
        />
      </g>
      <g opacity="0.9">
        <path
          d="M -20 740 Q 240 680 460 720 T 880 700 T 1260 730 T 1620 710 L 1620 900 L -20 900 Z"
          fill="#0a0f1a"
        />
      </g>

      {/* Main roof silhouette */}
      <path
        d="M -20 780 L 520 360 L 1080 780 Z"
        fill="url(#about-roof)"
      />
      {/* Roof edge shingle lines */}
      {Array.from({ length: 12 }).map((_, i) => {
        const y = 420 + i * 32;
        const leftX = 520 - (y - 360) * 0.72;
        const rightX = 520 + (y - 360) * 0.72;
        return (
          <line
            key={i}
            x1={leftX}
            y1={y}
            x2={rightX}
            y2={y}
            stroke="rgba(251,146,60,0.22)"
            strokeWidth="1"
          />
        );
      })}
      {/* Ridge highlight */}
      <line
        x1="-20"
        y1="780"
        x2="520"
        y2="360"
        stroke="rgba(251,191,36,0.5)"
        strokeWidth="2"
      />
      <line
        x1="520"
        y1="360"
        x2="1080"
        y2="780"
        stroke="rgba(251,191,36,0.5)"
        strokeWidth="2"
      />

      {/* Crew silhouettes walking the ridge */}
      <g fill="#060404">
        {/* Worker 1 — hammer raised */}
        <g transform="translate(340 600)">
          <circle cx="0" cy="-44" r="11" />
          <rect x="-10" y="-34" width="20" height="26" rx="3" />
          <rect x="-2" y="-34" width="4" height="34" transform="rotate(-18)" />
          <rect x="-10" y="-8" width="8" height="22" />
          <rect x="2" y="-8" width="8" height="22" />
          {/* Hammer */}
          <g transform="translate(10 -42) rotate(-20)">
            <rect x="-2" y="-30" width="4" height="30" fill="#3a2a18" />
            <rect x="-10" y="-38" width="20" height="10" fill="#6b6b6b" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-45;-10;-45"
              dur="1.6s"
              repeatCount="indefinite"
              additive="sum"
            />
          </g>
        </g>
        {/* Worker 2 — carrying a bundle */}
        <g transform="translate(620 540)">
          <circle cx="0" cy="-44" r="11" />
          <rect x="-10" y="-34" width="20" height="26" rx="3" />
          <rect x="-10" y="-8" width="8" height="22" />
          <rect x="2" y="-8" width="8" height="22" />
          {/* Shoulder bundle */}
          <rect x="-22" y="-40" width="26" height="14" fill="#6b4f2a" rx="2" />
          <line
            x1="-22"
            y1="-34"
            x2="4"
            y2="-34"
            stroke="rgba(251,191,36,0.3)"
          />
        </g>
        {/* Worker 3 — on knees, nailing */}
        <g transform="translate(800 460)">
          <circle cx="0" cy="-30" r="10" />
          <rect x="-12" y="-22" width="24" height="18" rx="3" transform="rotate(-15)" />
          <rect x="-14" y="-6" width="20" height="8" rx="2" />
          {/* Hammer arm */}
          <g transform="translate(8 -20)">
            <rect x="-2" y="-22" width="4" height="22" fill="#3a2a18" />
            <rect x="-8" y="-28" width="16" height="8" fill="#6b6b6b" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0;35;0"
              dur="1.2s"
              repeatCount="indefinite"
              additive="sum"
            />
          </g>
        </g>
      </g>

      {/* Sparks from nailing */}
      <g>
        {Array.from({ length: 8 }).map((_, i) => {
          const x = 800 + (Math.cos(i) * 20);
          const y = 440 + (Math.sin(i) * 8);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill="rgba(251,191,36,0.9)"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.2s"
                begin={`${(i * 0.15).toFixed(2)}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${y};${y - 20}`}
                dur="1.2s"
                begin={`${(i * 0.15).toFixed(2)}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </g>

      {/* Airborne birds */}
      <g fill="none" stroke="rgba(60,40,25,0.9)" strokeWidth="1.8" strokeLinecap="round">
        <path d="M 1240 300 q 8 -8 16 0 q 8 -8 16 0">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -200 -40; -400 20"
            dur="14s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M 1280 340 q 6 -6 12 0 q 6 -6 12 0">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -220 -30; -440 10"
            dur="16s"
            begin="2s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  );
}

// ---------- CONTACT: house with pulsing communication beacon ----------

export function BeaconHouseBanner({ className = "" }: SvgProps) {
  return (
    <svg
      viewBox="0 0 1600 900"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      {...COMMON_SVG_PROPS}
    >
      <defs>
        <linearGradient id="beacon-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1220" />
          <stop offset="60%" stopColor="#13223a" />
          <stop offset="100%" stopColor="#0b1220" />
        </linearGradient>
        <radialGradient id="beacon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.95)" />
          <stop offset="50%" stopColor="rgba(251,191,36,0.25)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0)" />
        </radialGradient>
        <linearGradient id="house-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e2a40" />
          <stop offset="100%" stopColor="#0e1626" />
        </linearGradient>
        <linearGradient id="house-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e3a55" />
          <stop offset="100%" stopColor="#121c2e" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#beacon-sky)" />

      {/* Starfield */}
      <g fill="#ffffff">
        {Array.from({ length: 45 }).map((_, i) => {
          const x = (i * 173) % 1600;
          const y = (i * 97) % 500;
          const r = ((i * 11) % 3) * 0.4 + 0.6;
          const dur = 2 + ((i * 13) % 30) / 10;
          return (
            <circle key={i} cx={x} cy={y} r={r} opacity="0.7">
              <animate
                attributeName="opacity"
                values="0.3;0.9;0.3"
                dur={`${dur}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </g>

      {/* Ground line */}
      <rect x="0" y="760" width="1600" height="140" fill="#070c16" />
      <line
        x1="0"
        y1="760"
        x2="1600"
        y2="760"
        stroke="rgba(251,191,36,0.25)"
        strokeWidth="1"
      />

      {/* House centered */}
      <g transform="translate(620 360)">
        {/* Walls */}
        <rect x="60" y="220" width="320" height="180" fill="url(#house-wall)" />
        {/* Roof */}
        <path
          d="M 40 220 L 220 60 L 400 220 Z"
          fill="url(#house-roof)"
        />
        <line
          x1="40"
          y1="220"
          x2="220"
          y2="60"
          stroke="rgba(251,191,36,0.55)"
          strokeWidth="2"
        />
        <line
          x1="220"
          y1="60"
          x2="400"
          y2="220"
          stroke="rgba(251,191,36,0.55)"
          strokeWidth="2"
        />
        {/* Shingle courses */}
        {Array.from({ length: 6 }).map((_, i) => {
          const y = 90 + i * 22;
          const dx = (y - 60) * 1.125;
          return (
            <line
              key={i}
              x1={220 - dx}
              y1={y}
              x2={220 + dx}
              y2={y}
              stroke="rgba(251,191,36,0.15)"
              strokeWidth="1"
            />
          );
        })}
        {/* Door */}
        <rect x="190" y="300" width="60" height="100" fill="#0b1220" />
        <rect x="190" y="300" width="60" height="100" fill="none" stroke="rgba(251,191,36,0.35)" />
        <circle cx="240" cy="355" r="2" fill="rgba(251,191,36,0.8)" />
        {/* Windows */}
        <g>
          <rect x="100" y="280" width="60" height="60" fill="rgba(251,191,36,0.85)" rx="3">
            <animate
              attributeName="fill"
              values="rgba(251,191,36,0.85);rgba(251,191,36,0.55);rgba(251,191,36,0.85)"
              dur="5s"
              repeatCount="indefinite"
            />
          </rect>
          <line x1="130" y1="280" x2="130" y2="340" stroke="#0b1220" strokeWidth="2" />
          <line x1="100" y1="310" x2="160" y2="310" stroke="#0b1220" strokeWidth="2" />
          <rect x="280" y="280" width="60" height="60" fill="rgba(251,191,36,0.85)" rx="3">
            <animate
              attributeName="fill"
              values="rgba(251,191,36,0.85);rgba(251,191,36,0.7);rgba(251,191,36,0.85)"
              dur="7s"
              repeatCount="indefinite"
            />
          </rect>
          <line x1="310" y1="280" x2="310" y2="340" stroke="#0b1220" strokeWidth="2" />
          <line x1="280" y1="310" x2="340" y2="310" stroke="#0b1220" strokeWidth="2" />
        </g>
        {/* Chimney */}
        <rect x="300" y="100" width="34" height="80" fill="#121c2e" />
        {/* Antenna mast rising out of ridge */}
        <line
          x1="220"
          y1="60"
          x2="220"
          y2="-60"
          stroke="rgba(251,191,36,0.7)"
          strokeWidth="2"
        />
        <rect x="216" y="-70" width="8" height="14" fill="#fbbf24" />
      </g>

      {/* Beacon pulses emanating from the roof top (centered at 840, 300) */}
      <g transform="translate(840 300)">
        <circle r="18" fill="url(#beacon-glow)">
          <animate
            attributeName="r"
            values="16;24;16"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Pulse rings */}
        {[0, 0.7, 1.4, 2.1].map((delay, i) => (
          <circle
            key={i}
            r="20"
            fill="none"
            stroke="rgba(251,191,36,0.6)"
            strokeWidth="2"
          >
            <animate
              attributeName="r"
              values="20;260"
              dur="2.8s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.9;0"
              dur="2.8s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>

      {/* Signal towers flanking the house */}
      {[120, 1380].map((tx, i) => (
        <g key={i} transform={`translate(${tx} 500)`}>
          <path
            d="M -30 260 L 0 0 L 30 260 Z"
            fill="none"
            stroke="rgba(251,191,36,0.3)"
            strokeWidth="1.2"
          />
          <line x1="-18" y1="160" x2="18" y2="160" stroke="rgba(251,191,36,0.3)" />
          <line x1="-12" y1="100" x2="12" y2="100" stroke="rgba(251,191,36,0.3)" />
          <line x1="-6" y1="40" x2="6" y2="40" stroke="rgba(251,191,36,0.3)" />
          <circle r="5" cy="-6" fill="#fbbf24">
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur="1.8s"
              begin={`${i * 0.9}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </svg>
  );
}
