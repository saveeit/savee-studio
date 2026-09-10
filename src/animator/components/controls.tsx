import React, { useRef } from "react";
import { cn } from "@/lib/cn";

// ---------------------------------------------------------------------------
// Control primitives styled to match the Savee site-builder editor:
// pure-black panels, sentence-case labels in mid-gray, taller dark rounded
// inputs (~10px radius), generous spacing, larger slider thumbs.
// ---------------------------------------------------------------------------

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = clampPct(((value - min) / (max - min || 1)) * 100);
  const display = format ? format(value) : `${round(value, step)}${unit ? unit : ""}`;

  const setFromX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - r.left) / (r.width || 1)));
    const raw = min + frac * (max - min);
    const snapped = Math.round(raw / step) * step;
    const clamped = Math.min(max, Math.max(min, snapped));
    // strip float dust from stepping (e.g. 0.30000000004)
    onChange(Number(clamped.toFixed(6)));
  };

  return (
    <div className="py-3">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[13px] text-muted">{label}</span>
        <span className="font-mono text-[12px] tabular-nums text-gray-100">{display}</span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={display}
        tabIndex={0}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromX(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
        onPointerUp={(e) => {
          dragging.current = false;
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown")
            onChange(Number(Math.max(min, value - step).toFixed(6)));
          if (e.key === "ArrowRight" || e.key === "ArrowUp")
            onChange(Number(Math.min(max, value + step).toFixed(6)));
        }}
        className="relative h-4 cursor-pointer touch-none select-none rounded-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-surface-2" />
        <div
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white"
          style={{ width: `${pct}%` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const clampPct = (p: number) => Math.min(100, Math.max(0, p));

function round(v: number, step: number) {
  const decimals = (String(step).split(".")[1] || "").length;
  return decimals ? v.toFixed(decimals) : Math.round(v);
}

export function Segmented({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: { label: string; value: string | number }[];
  onChange: (v: string | number) => void;
}) {
  const groupId = React.useId();
  return (
    <div className="py-3">
      <div id={groupId} className="mb-2.5 text-[13px] text-muted">
        {label}
      </div>
      <div role="radiogroup" aria-labelledby={groupId} className="flex gap-1 rounded-[10px] bg-surface p-1">
        {options.map((o) => (
          <button
            key={String(o.value)}
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 rounded-[7px] px-2 py-2 text-[12.5px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              value === o.value
                ? "bg-surface-2 text-white"
                : "text-gray-400 hover:text-gray-200",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[13px] text-muted">{label}</span>
      <button
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-[24px] w-[42px] rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          value ? "bg-brand" : "bg-surface-2",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-white shadow transition-all",
            value ? "left-[21px]" : "left-[3px]",
          )}
        />
      </button>
    </div>
  );
}

/** Label-left color field, matching Savee's "Text" / "BG" rows. */
export function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-14 shrink-0 text-[13px] text-muted">{label}</span>
      <label className="relative flex flex-1 cursor-pointer items-center gap-2.5 rounded-[10px] border border-line bg-surface px-3 py-2.5 focus-within:border-gray-600 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
        <span
          className="h-5 w-5 rounded-[6px] ring-1 ring-white/15"
          style={{ background: value }}
        />
        <span className="font-mono text-[12.5px] uppercase tracking-wide text-gray-100">
          {value.replace(/^#/, "")}
        </span>
        <span className="ml-auto font-mono text-[12px] text-gray-500">100%</span>
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute h-0 w-0 opacity-0"
        />
      </label>
    </div>
  );
}

/** Label-left text field, matching Savee's "Site title" row. */
export function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const id = React.useId();
  return (
    <div className="flex items-center gap-3 py-2">
      <label htmlFor={id} className="w-14 shrink-0 text-[13px] text-muted">
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-[10px] border border-line bg-surface px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-gray-500 focus:border-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </div>
  );
}

/** Styled native select, matching Savee's "Global font" / "Layout" dropdowns. */
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: { label: string; value: string | number }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-20 shrink-0 text-[13px] text-muted">{label}</span>
      <div className="relative flex-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-[10px] border border-line bg-surface px-3 py-2.5 text-[13px] text-white outline-none focus:border-gray-600"
        >
          {options.map((o) => (
            <option key={String(o.value)} value={o.value} className="bg-card">
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

/** Section heading — Savee uses larger sentence-case headings, not tiny caps. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <div className="text-[15px] font-medium text-white">{children}</div>;
}
