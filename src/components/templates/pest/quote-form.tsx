"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePestTheme } from "./use-pest-theme";

type PestKind =
  | "roaches" | "rodents" | "ants" | "termites"
  | "bedbugs" | "ticks" | "wasps" | "spiders"
  | "wildlife" | "other";

type Property = "house" | "apartment" | "condo" | "commercial" | "restaurant";

type FormState = {
  pests: Set<PestKind>;
  severity: 1 | 2 | 3 | 4 | 5;
  property: Property | null;
  sqft: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  when: "asap" | "thisweek" | "nextweek" | "flexible";
  notes: string;
};

const PEST_OPTIONS: { id: PestKind; label: string; icon: (c: string) => React.ReactNode }[] = [
  { id: "roaches", label: "Roaches", icon: (c) => (
    <svg viewBox="0 0 32 32" className="h-6 w-6"><ellipse cx="16" cy="17" rx="8" ry="5" stroke={c} strokeWidth="1.3" fill="none" /><path d="M23 14l4-3M23 20l4 3M9 14l-4-3M9 20l-4 3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><path d="M24 16 q3-2 5-5" stroke={c} strokeWidth="1" fill="none" strokeLinecap="round"/></svg>
  ) },
  { id: "rodents", label: "Mice / Rats", icon: (c) => (
    <svg viewBox="0 0 32 32" className="h-6 w-6"><ellipse cx="14" cy="18" rx="8" ry="5" stroke={c} strokeWidth="1.3" fill="none"/><circle cx="22" cy="17" r="4" stroke={c} strokeWidth="1.2" fill="none"/><circle cx="21" cy="14" r="1.5" stroke={c} strokeWidth="1" fill="none"/><circle cx="24" cy="15" r="1.2" stroke={c} strokeWidth="1" fill="none"/><circle cx="25" cy="17" r="0.8" fill={c}/><path d="M6 19 q-3 1 -3 6 q0 3 3 3" stroke={c} strokeWidth="1.2" fill="none"/></svg>
  ) },
  { id: "ants", label: "Ants", icon: (c) => (
    <svg viewBox="0 0 32 32" className="h-6 w-6"><circle cx="10" cy="16" r="3" stroke={c} strokeWidth="1.2" fill="none"/><circle cx="16" cy="16" r="3.5" stroke={c} strokeWidth="1.2" fill="none"/><circle cx="23" cy="16" r="4.5" stroke={c} strokeWidth="1.2" fill="none"/><path d="M8 13l-2-3M23 12l-1-3M12 13l-1-3M15 13l-1-3M17 13l1-3M23 12l1-3M25 12l1-3" stroke={c} strokeWidth="1" strokeLinecap="round"/><path d="M8 19l-2 3M12 19l-1 3M17 19l1 3M23 20l-1 3M25 20l1 3" stroke={c} strokeWidth="1" strokeLinecap="round"/></svg>
  ) },
  { id: "termites", label: "Termites", icon: (c) => (
    <svg viewBox="0 0 32 32" className="h-6 w-6"><ellipse cx="10" cy="16" rx="4" ry="3" stroke={c} strokeWidth="1.2" fill="none"/><ellipse cx="17" cy="16" rx="4" ry="3" stroke={c} strokeWidth="1.2" fill="none"/><ellipse cx="24" cy="16" rx="5" ry="3.5" stroke={c} strokeWidth="1.2" fill="none"/><path d="M26 13l2-2M26 19l2 2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>
  ) },
  { id: "bedbugs", label: "Bed Bugs", icon: (c) => (
    <svg viewBox="0 0 32 32" className="h-6 w-6"><ellipse cx="16" cy="18" rx="7" ry="8" stroke={c} strokeWidth="1.3" fill="none"/><line x1="9" y1="18" x2="23" y2="18" stroke={c} strokeWidth="0.8"/><line x1="9" y1="14" x2="23" y2="14" stroke={c} strokeWidth="0.8"/><line x1="9" y1="22" x2="23" y2="22" stroke={c} strokeWidth="0.8"/></svg>
  ) },
  { id: "ticks", label: "Ticks", icon: (c) => (
    <svg viewBox="0 0 32 32" className="h-6 w-6"><ellipse cx="16" cy="18" rx="8" ry="9" stroke={c} strokeWidth="1.3" fill="none"/><ellipse cx="16" cy="10" rx="3" ry="3.5" stroke={c} strokeWidth="1.2" fill="none"/><path d="M8 16l-4-2M8 19l-4 0M8 22l-4 2M24 16l4-2M24 19l4 0M24 22l4 2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>
  ) },
  { id: "wasps", label: "Wasps / Hornets", icon: (c) => (
    <svg viewBox="0 0 32 32" className="h-6 w-6"><ellipse cx="16" cy="20" rx="5" ry="7" stroke={c} strokeWidth="1.3" fill="none"/><line x1="12" y1="17" x2="20" y2="17" stroke={c} strokeWidth="0.8"/><line x1="12" y1="21" x2="20" y2="21" stroke={c} strokeWidth="0.8"/><circle cx="16" cy="11" r="3" stroke={c} strokeWidth="1.2" fill="none"/><path d="M14 8l-3-3M18 8l3-3" stroke={c} strokeWidth="1.2" strokeLinecap="round"/><ellipse cx="8" cy="17" rx="6" ry="3" stroke={c} strokeWidth="1" fill="none" opacity="0.8"/><ellipse cx="24" cy="17" rx="6" ry="3" stroke={c} strokeWidth="1" fill="none" opacity="0.8"/></svg>
  ) },
  { id: "spiders", label: "Spiders", icon: (c) => (
    <svg viewBox="0 0 32 32" className="h-6 w-6"><circle cx="16" cy="16" r="4" stroke={c} strokeWidth="1.2" fill="none"/><path d="M12 14l-5-3-2-5M12 18l-5 0-4-3M12 20l-5 3-2 4M20 14l5-3 2-5M20 18l5 0 4-3M20 20l5 3 2 4M14 12l-2-5M18 12l2-5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></svg>
  ) },
  { id: "wildlife", label: "Wildlife", icon: (c) => (
    <svg viewBox="0 0 32 32" className="h-6 w-6"><path d="M16 5 q-10 0 -10 11 q0 8 5 11 l10 0 q5-3 5-11 q0-11-10-11z" stroke={c} strokeWidth="1.3" fill="none"/><path d="M9 8l-2-5 5 3M23 8l2-5 -5 3" stroke={c} strokeWidth="1.2" fill="none" strokeLinejoin="round"/><circle cx="13" cy="15" r="1.2" fill={c}/><circle cx="19" cy="15" r="1.2" fill={c}/><path d="M14 20 q2 2 4 0" stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
  ) },
  { id: "other", label: "Something else", icon: (c) => (
    <svg viewBox="0 0 32 32" className="h-6 w-6"><circle cx="16" cy="16" r="10" stroke={c} strokeWidth="1.3" fill="none"/><text x="16" y="21" textAnchor="middle" fontSize="13" fontWeight="bold" fill={c}>?</text></svg>
  ) },
];

const PROPERTY_OPTIONS: { id: Property; label: string; icon: string }[] = [
  { id: "house", label: "Single-family home", icon: "🏠" },
  { id: "apartment", label: "Apartment unit", icon: "🏢" },
  { id: "condo", label: "Condo / townhouse", icon: "🏘️" },
  { id: "commercial", label: "Commercial property", icon: "🏬" },
  { id: "restaurant", label: "Restaurant / food service", icon: "🍽️" },
];

const SEVERITY_LABELS = [
  "Just saw one",
  "Noticed a few",
  "Ongoing problem",
  "Seeing them daily",
  "Total infestation",
];

function TicketBgCanvas({
  approved,
  businessName,
  state,
}: {
  approved: boolean;
  businessName: string;
  state: string | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = usePestTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const approvedRef = useRef(approved);
  approvedRef.current = approved;
  const headerLeft = `WORK ORDER · ${businessName.toUpperCase()}`.slice(0, 60);
  const headerRight = state ? `${state.toUpperCase()} LICENSED` : "LICENSED · INSURED";

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    let approvedT = -1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver((e) => (visible = e[0]?.isIntersecting ?? false));
    io.observe(canvas);

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const isLight = themeRef.current === "light";

      ctx.fillStyle = isLight ? "#fbf6e7" : "#0d1114";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = isLight ? "rgba(60, 50, 20, 0.09)" : "rgba(160, 180, 200, 0.05)";
      ctx.lineWidth = 1;
      const g = 26;
      for (let x = 0; x < w; x += g) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += g) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.fillStyle = isLight ? "rgba(90, 60, 30, 0.08)" : "rgba(220, 240, 250, 0.03)";
      for (let i = 0; i < (w * h) / 2500; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random(), 0.4);
      }

      if (approvedRef.current) {
        if (approvedT < 0) approvedT = t;
        const age = (t - approvedT) / 1000;
        const scale = age < 0.3 ? 1.8 - age * 3 : Math.max(0.94, 1.06 - (age - 0.3) * 0.4);
        const rot = -0.16;
        const cx = w - Math.min(w * 0.28, 140);
        const cy = h - Math.min(h * 0.25, 100);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.scale(scale, scale);
        ctx.globalAlpha = Math.min(1, age * 3);

        const red = isLight ? "#c23a2b" : "#f26353";
        ctx.strokeStyle = red;
        ctx.lineWidth = 4;
        ctx.strokeRect(-85, -36, 170, 72);
        ctx.lineWidth = 2;
        ctx.strokeRect(-78, -30, 156, 60);

        ctx.font = "bold 28px ui-sans-serif, system-ui";
        ctx.fillStyle = red;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("APPROVED", 0, -5);
        ctx.font = "bold 11px ui-monospace, Menlo, monospace";
        ctx.fillText(`ORDER #${1000 + Math.floor(Math.random() * 8999)}`, 0, 18);

        if (age < 0.8) {
          for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `${red}${Math.round((1 - age / 0.8) * 140).toString(16).padStart(2, "0")}`;
            ctx.beginPath();
            ctx.arc((Math.random() - 0.5) * 190, (Math.random() - 0.5) * 90, Math.random() * 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      } else {
        approvedT = -1;
      }

      ctx.strokeStyle = isLight ? "rgba(60, 40, 15, 0.25)" : "rgba(200, 220, 235, 0.18)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 48);
      ctx.lineTo(w, 48);
      ctx.stroke();

      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.fillStyle = isLight ? "rgba(80, 50, 15, 0.7)" : "rgba(200, 220, 235, 0.55)";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(headerLeft, 14, 14);
      ctx.textAlign = "right";
      ctx.fillText(headerRight, w - 14, 14);
      ctx.textAlign = "left";
      ctx.fillText(`DATE ${new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}`, 14, 30);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [headerLeft, headerRight]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

function StepDots({ step, total, isDark }: { step: number; total: number; isDark: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-8 rounded-full transition-all ${
            i < step
              ? isDark ? "bg-emerald-400" : "bg-emerald-600"
              : i === step
              ? isDark ? "bg-white/80" : "bg-slate-800"
              : isDark ? "bg-white/15" : "bg-slate-900/15"
          }`}
        />
      ))}
    </div>
  );
}

export function PestQuoteFormSection({
  businessName,
  state,
  phoneSpec,
}: {
  businessName: string;
  state: string | null;
  // Free-form line shown in the trust list under the headline. Pass the
  // license # / response window / SLA copy specific to this business.
  phoneSpec?: string;
}) {
  const { theme } = usePestTheme();
  const isDark = theme === "dark";
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    pests: new Set(),
    severity: 3,
    property: null,
    sqft: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    when: "thisweek",
    notes: "",
  });

  const togglePest = (p: PestKind) => {
    setForm((f) => {
      const s = new Set(f.pests);
      if (s.has(p)) s.delete(p);
      else s.add(p);
      return { ...f, pests: s };
    });
  };

  const canAdvance = useMemo(() => {
    if (step === 0) return form.pests.size > 0;
    if (step === 1) return true;
    if (step === 2) return form.property !== null;
    if (step === 3) return form.name.trim().length > 1 && /^[\d\s()\-+]{7,}$/.test(form.phone);
    return true;
  }, [step, form]);

  const handleSubmit = () => setSubmitted(true);

  const inputBase = isDark
    ? "bg-white/[0.04] border-white/15 text-white placeholder:text-white/35 focus:border-emerald-400/60 focus:bg-white/[0.06]"
    : "bg-white border-slate-900/15 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600/60 focus:bg-white";

  const accent = isDark ? "#34d399" : "#059669";
  const accentText = isDark ? "text-emerald-300" : "text-emerald-700";

  const trustItems = [
    { h: "Same-day callback during business hours", d: "Mon–Sat 7am–6pm" },
    { h: "On-site inspection in 24–48 hours", d: "Weekends available" },
    { h: "Flat-rate pricing, written warranty", d: "No surprise add-ons" },
    { h: phoneSpec || "Licensed · insured · pet-safe", d: state ? `${state} licensed` : "Local crew" },
  ];

  return (
    <section
      className="relative w-full overflow-hidden py-14 sm:py-20 lg:py-28"
      style={{ backgroundColor: isDark ? "#0a1612" : "#f1ead5", transition: "background-color 350ms ease" }}
    >
      <style>{`
        @keyframes pest-quote-glow {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.015); }
        }
        @keyframes pest-quote-rim {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pest-quote-stamp-bob {
          0%, 100% { transform: rotate(-8deg) translateY(0); }
          50% { transform: rotate(-8deg) translateY(-4px); }
        }
      `}</style>
      {/* Section-level radial spotlight pulling the eye toward the form on
          the right. */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            isDark
              ? "radial-gradient(ellipse at 75% 50%, rgba(52, 211, 153, 0.12) 0%, transparent 55%)"
              : "radial-gradient(ellipse at 75% 50%, rgba(16, 185, 129, 0.10) 0%, transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] ${isDark ? "text-white/45" : "text-slate-500"}`}>
          <span>15</span>
          <span className={`h-px w-8 ${isDark ? "bg-white/20" : "bg-slate-900/20"}`} />
          <span>Free Inspection</span>
        </div>

        <div className="mt-5 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className={`text-balance text-[clamp(1.6rem,4.8vw,3rem)] font-semibold leading-[1.1] tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Tell us what&apos;s bothering you.
              <br />
              <span className={accentText}>We&apos;ll write you a plan — for free.</span>
            </h2>
            <p className={`mt-4 max-w-lg text-sm sm:text-base ${isDark ? "text-white/70" : "text-slate-700"}`}>
              No card required, no high-pressure follow-up. Four questions, one real quote with line-item pricing and a written warranty — usually back to you within 2 business hours.
            </p>

            <ul className="mt-8 space-y-3">
              {trustItems.map((x) => (
                <li key={x.h} className="flex gap-3">
                  <span
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${accent}25`, color: accent }}
                  >
                    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
                      <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" />
                    </svg>
                  </span>
                  <div>
                    <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {x.h}
                    </div>
                    <div className={`text-sm ${isDark ? "text-white/55" : "text-slate-600"}`}>
                      {x.d}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            {/* Glow halo behind the card — slow pulse pulls the eye in
                without the card itself moving. */}
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-4 rounded-3xl"
                aria-hidden
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(52, 211, 153, 0.32) 0%, rgba(52, 211, 153, 0.12) 35%, transparent 70%)",
                  filter: "blur(24px)",
                  animation: "pest-quote-glow 4.5s ease-in-out infinite",
                }}
              />
              {/* Floating "FREE" stamp — the angled corner badge that screams
                  "no cost to you". Slow vertical bob keeps it alive without
                  being noisy. */}
              <div
                className="pointer-events-none absolute -right-3 -top-5 z-20 sm:-right-5 sm:-top-7"
                aria-hidden
                style={{ animation: "pest-quote-stamp-bob 3.6s ease-in-out infinite" }}
              >
                <div
                  className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 shadow-xl shadow-emerald-500/40 sm:h-24 sm:w-24 ${
                    isDark
                      ? "border-emerald-300 bg-emerald-400 text-[#04130c]"
                      : "border-emerald-700 bg-emerald-500 text-white"
                  }`}
                >
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-80">
                    No-cost
                  </div>
                  <div className="text-2xl font-black uppercase leading-none tracking-tight sm:text-3xl">
                    Free
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-[0.25em] opacity-80">
                    Quote
                  </div>
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-2xl border-2 ${
                  isDark
                    ? "border-emerald-400/40 shadow-2xl shadow-emerald-500/20"
                    : "border-emerald-600/40 shadow-2xl shadow-emerald-500/20"
                }`}
              >
                {/* Animated rim sheen sweep around the inside edge of the
                    card so it always feels alive even before a user
                    interacts. */}
                <div
                  className="pointer-events-none absolute inset-0 z-[1] mix-blend-screen"
                  aria-hidden
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 35%, rgba(167, 243, 208, 0.18) 50%, transparent 65%)",
                    animation: "pest-quote-rim 6s linear infinite",
                  }}
                />
                <TicketBgCanvas approved={submitted} businessName={businessName} state={state} />

              <div className="relative p-5 pt-14 sm:p-8 sm:pt-16">
                {!submitted ? (
                  <>
                    <div className="mb-5 flex items-baseline gap-3">
                      <h3
                        className="bg-clip-text text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl"
                        style={{
                          backgroundImage: isDark
                            ? "linear-gradient(90deg, #ffffff 0%, #a7f3d0 60%, #34d399 100%)"
                            : "linear-gradient(90deg, #065f46 0%, #047857 50%, #059669 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          color: "transparent",
                        }}
                      >
                        Free Estimate
                      </h3>
                      <span className={`hidden font-mono text-[10px] uppercase tracking-[0.25em] sm:inline ${isDark ? "text-emerald-300/70" : "text-emerald-700/70"}`}>
                        · 60 sec
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className={`font-mono text-[10px] uppercase tracking-[0.25em] ${isDark ? "text-white/55" : "text-slate-600"}`}>
                        Step {step + 1} of 4 · {["Pest", "Severity", "Property", "Contact"][step]}
                      </div>
                      <StepDots step={step} total={4} isDark={isDark} />
                    </div>

                    <div className="mt-6 min-h-[320px]">
                      {step === 0 && (
                        <div>
                          <h3 className={`text-lg font-semibold sm:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
                            What&apos;s bothering you?{" "}
                            <span className={`text-sm font-normal ${isDark ? "text-white/50" : "text-slate-500"}`}>select all that apply</span>
                          </h3>
                          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                            {PEST_OPTIONS.map((o) => {
                              const on = form.pests.has(o.id);
                              return (
                                <button
                                  key={o.id}
                                  type="button"
                                  onClick={() => togglePest(o.id)}
                                  className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left transition ${
                                    on
                                      ? isDark ? "border-emerald-400/70 bg-emerald-400/10" : "border-emerald-600/70 bg-emerald-50"
                                      : isDark ? "border-white/10 bg-white/[0.03] hover:border-white/25" : "border-slate-900/10 bg-white hover:border-slate-900/30"
                                  }`}
                                >
                                  <span style={on ? { color: accent } : undefined}>
                                    {o.icon(on ? accent : isDark ? "rgba(255,255,255,0.65)" : "rgba(40,50,60,0.6)")}
                                  </span>
                                  <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {o.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {step === 1 && (
                        <div>
                          <h3 className={`text-lg font-semibold sm:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
                            How bad is it right now?
                          </h3>
                          <div className="mt-6 flex items-end gap-2 sm:gap-3">
                            {([1, 2, 3, 4, 5] as const).map((n) => {
                              const on = form.severity >= n;
                              const active = form.severity === n;
                              return (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setForm((f) => ({ ...f, severity: n }))}
                                  className={`group relative flex-1 rounded-md border px-2 py-4 transition sm:py-5 ${
                                    active
                                      ? "border-emerald-500/70"
                                      : isDark ? "border-white/10 hover:border-white/25" : "border-slate-900/10 hover:border-slate-900/30"
                                  }`}
                                  style={{
                                    background: on
                                      ? `linear-gradient(180deg, ${n >= 4 ? "#ef4444" : n >= 3 ? "#f59e0b" : "#10b981"}${isDark ? "22" : "20"} 0%, transparent 100%)`
                                      : "transparent",
                                  }}
                                >
                                  <div className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {n}
                                  </div>
                                  <div className={`font-mono text-[9px] uppercase tracking-wider ${isDark ? "text-white/50" : "text-slate-500"}`}>
                                    lv
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          <div className={`mt-5 rounded-lg border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-900/10 bg-white"}`}>
                            <div className={`font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-white/45" : "text-slate-500"}`}>
                              Triage
                            </div>
                            <div className={`mt-1 text-base font-semibold sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                              {SEVERITY_LABELS[form.severity - 1]}
                            </div>
                            <div className={`mt-1 text-sm ${isDark ? "text-white/70" : "text-slate-700"}`}>
                              {form.severity >= 4
                                ? "We'll prioritize this — same-day or next-morning visit."
                                : form.severity >= 3
                                ? "We'll slot you in within 48 hours."
                                : "Standard scheduling. Usually within 3–5 days."}
                            </div>
                          </div>
                        </div>
                      )}

                      {step === 2 && (
                        <div>
                          <h3 className={`text-lg font-semibold sm:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
                            What kind of property?
                          </h3>
                          <div className="mt-5 grid gap-2 sm:grid-cols-2 sm:gap-3">
                            {PROPERTY_OPTIONS.map((o) => {
                              const on = form.property === o.id;
                              return (
                                <button
                                  key={o.id}
                                  type="button"
                                  onClick={() => setForm((f) => ({ ...f, property: o.id }))}
                                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                                    on
                                      ? isDark ? "border-emerald-400/70 bg-emerald-400/10" : "border-emerald-600/70 bg-emerald-50"
                                      : isDark ? "border-white/10 bg-white/[0.03] hover:border-white/25" : "border-slate-900/10 bg-white hover:border-slate-900/30"
                                  }`}
                                >
                                  <span className="text-2xl">{o.icon}</span>
                                  <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {o.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <label className="mt-5 block">
                            <span className={`font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-white/55" : "text-slate-600"}`}>
                              Approx. square footage (optional)
                            </span>
                            <input
                              inputMode="numeric"
                              value={form.sqft}
                              onChange={(e) => setForm((f) => ({ ...f, sqft: e.target.value.replace(/[^\d,]/g, "") }))}
                              placeholder="e.g. 2,400"
                              className={`mt-1 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition ${inputBase}`}
                            />
                          </label>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="space-y-3">
                          <h3 className={`text-lg font-semibold sm:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
                            How do we reach you?
                          </h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block">
                              <span className={`font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-white/55" : "text-slate-600"}`}>
                                Name
                              </span>
                              <input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="Jane Doe"
                                className={`mt-1 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition ${inputBase}`}
                              />
                            </label>
                            <label className="block">
                              <span className={`font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-white/55" : "text-slate-600"}`}>
                                Phone
                              </span>
                              <input
                                inputMode="tel"
                                value={form.phone}
                                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                placeholder="(555) 555-0199"
                                className={`mt-1 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition ${inputBase}`}
                              />
                            </label>
                            <label className="block sm:col-span-2">
                              <span className={`font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-white/55" : "text-slate-600"}`}>
                                Email (optional)
                              </span>
                              <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                placeholder="jane@example.com"
                                className={`mt-1 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition ${inputBase}`}
                              />
                            </label>
                            <label className="block sm:col-span-2">
                              <span className={`font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-white/55" : "text-slate-600"}`}>
                                Service address (town is enough for now)
                              </span>
                              <input
                                value={form.address}
                                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                                placeholder="123 Main St, Anytown"
                                className={`mt-1 w-full rounded-md border px-3 py-2.5 text-sm outline-none transition ${inputBase}`}
                              />
                            </label>
                          </div>

                          <div>
                            <span className={`font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-white/55" : "text-slate-600"}`}>
                              Preferred timing
                            </span>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {[
                                { id: "asap", label: "ASAP" },
                                { id: "thisweek", label: "This week" },
                                { id: "nextweek", label: "Next week" },
                                { id: "flexible", label: "Flexible" },
                              ].map((t) => {
                                const on = form.when === t.id;
                                return (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, when: t.id as FormState["when"] }))}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                      on
                                        ? isDark ? "border-emerald-400/70 bg-emerald-400/15 text-emerald-200" : "border-emerald-600/70 bg-emerald-500/15 text-emerald-700"
                                        : isDark ? "border-white/15 text-white/75 hover:border-white/30" : "border-slate-900/15 text-slate-700 hover:border-slate-900/30"
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t pt-5" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                      <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                          step === 0
                            ? isDark ? "border-white/10 text-white/30" : "border-slate-900/10 text-slate-400"
                            : isDark ? "border-white/20 text-white hover:bg-white/10" : "border-slate-900/20 text-slate-900 hover:bg-slate-900/5"
                        }`}
                      >
                        ← Back
                      </button>
                      {step < 3 ? (
                        <button
                          type="button"
                          disabled={!canAdvance}
                          onClick={() => setStep((s) => Math.min(3, s + 1))}
                          className={`rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                            canAdvance
                              ? isDark ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300" : "bg-emerald-600 text-white hover:bg-emerald-700"
                              : isDark ? "bg-white/10 text-white/40" : "bg-slate-900/10 text-slate-400"
                          }`}
                        >
                          Continue →
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAdvance}
                          onClick={handleSubmit}
                          className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                            canAdvance
                              ? isDark ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300" : "bg-emerald-600 text-white hover:bg-emerald-700"
                              : isDark ? "bg-white/10 text-white/40" : "bg-slate-900/10 text-slate-400"
                          }`}
                        >
                          Submit work order
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-10 text-center sm:py-14">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isDark ? "bg-emerald-400/20 text-emerald-300" : "bg-emerald-500/20 text-emerald-700"}`}>
                      <svg viewBox="0 0 20 20" className="h-8 w-8" fill="currentColor">
                        <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" />
                      </svg>
                    </div>
                    <h3 className={`mt-5 text-xl font-bold sm:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                      Thanks, {form.name.split(" ")[0] || "friend"}.
                    </h3>
                    <p className={`mt-2 max-w-sm text-sm ${isDark ? "text-white/70" : "text-slate-700"}`}>
                      Work order logged. We&apos;ll call you at <span className="font-semibold">{form.phone || "the number you provided"}</span> within 2 business hours.
                    </p>
                    <div className={`mt-6 rounded-lg border px-4 py-3 text-left ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-900/10 bg-white"}`}>
                      <div className={`font-mono text-[10px] uppercase tracking-[0.2em] ${isDark ? "text-white/45" : "text-slate-500"}`}>
                        Summary
                      </div>
                      <div className={`mt-1 text-sm ${isDark ? "text-white/85" : "text-slate-800"}`}>
                        <div>
                          <span className="font-semibold">Pest(s):</span>{" "}
                          {Array.from(form.pests).map((p) => PEST_OPTIONS.find((x) => x.id === p)?.label).join(", ") || "Unspecified"}
                        </div>
                        <div>
                          <span className="font-semibold">Severity:</span>{" "}
                          {form.severity}/5 — {SEVERITY_LABELS[form.severity - 1]}
                        </div>
                        <div>
                          <span className="font-semibold">Property:</span>{" "}
                          {PROPERTY_OPTIONS.find((x) => x.id === form.property)?.label || "—"}
                          {form.sqft ? ` · ${form.sqft} sqft` : ""}
                        </div>
                        <div>
                          <span className="font-semibold">Timing:</span>{" "}
                          {form.when === "asap" ? "ASAP" : form.when}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setStep(0);
                        setForm({
                          pests: new Set(),
                          severity: 3,
                          property: null,
                          sqft: "",
                          name: "",
                          phone: "",
                          email: "",
                          address: "",
                          when: "thisweek",
                          notes: "",
                        });
                      }}
                      className={`mt-6 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                        isDark ? "border-white/20 text-white/80 hover:bg-white/10" : "border-slate-900/20 text-slate-700 hover:bg-slate-900/5"
                      }`}
                    >
                      Submit another
                    </button>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
