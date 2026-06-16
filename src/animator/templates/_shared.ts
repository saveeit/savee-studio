import type { Asset } from "../types";

/** cyclic asset pick → image src, undefined when no assets present */
export function pick(assets: Asset[], i: number): string | undefined {
  if (!assets.length) return undefined;
  return assets[((i % assets.length) + assets.length) % assets.length].src;
}

/** gaussian falloff, 1 at d=0 → 0 as |d| grows past `width` */
export function gauss(d: number, width: number) {
  const x = d / (width || 1);
  return Math.exp(-(x * x));
}

/** wrap value into [-half, half) */
export function wrap(v: number, span: number) {
  const half = span / 2;
  return ((((v + half) % span) + span) % span) - half;
}

export const num = (v: unknown, fallback = 0) =>
  typeof v === "number" ? v : fallback;

export const bool = (v: unknown, fallback = false) =>
  typeof v === "boolean" ? v : fallback;

export const str = (v: unknown, fallback = "") =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : fallback;
