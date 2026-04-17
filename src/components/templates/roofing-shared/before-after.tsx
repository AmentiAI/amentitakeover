"use client";

import { useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

export type BeforeAfterPair = {
  before: string;
  after: string;
  location?: string;
  caption?: string;
};

export function BeforeAfterSlider({
  pair,
  accent,
  label,
}: {
  pair: BeforeAfterPair;
  accent: string;
  label?: string;
}) {
  const [pos, setPos] = useState(52);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function updateFromClientX(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, pct)));
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  }
  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={pair.before}
        alt="Before"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <img
          src={pair.after}
          alt="After"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ width: `${(100 / pos) * 100}%` }}
          draggable={false}
        />
      </div>

      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-800 shadow">
        After
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-slate-950/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow">
        Before
      </span>

      {pair.caption && (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="rounded-xl bg-white/95 px-3 py-2 text-xs font-medium text-slate-800 shadow-lg backdrop-blur">
            {pair.caption}
            {pair.location && (
              <span className="ml-1.5 text-slate-500">· {pair.location}</span>
            )}
          </div>
          {label && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow"
              style={{ background: accent }}
            >
              {label}
            </span>
          )}
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-y-0 w-[2px] bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]"
        style={{ left: `calc(${pos}% - 1px)` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-white bg-white shadow-xl"
        style={{
          left: `calc(${pos}% - 20px)`,
          background: accent,
        }}
      >
        <div className="grid h-10 w-10 place-items-center text-white">
          <MoveHorizontal className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
