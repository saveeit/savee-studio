// Easing + small math helpers shared by templates.

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** map x from [a,b] to [0,1], clamped */
export const norm = (x: number, a: number, b: number) => clamp((x - a) / (b - a || 1));

/** map x from [inMin,inMax] to [outMin,outMax], clamped */
export function mapClamp(x: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return lerp(outMin, outMax, norm(x, inMin, inMax));
}

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const easeInCubic = (t: number) => t * t * t;

export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export const easeInOutExpo = (t: number) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
};

export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** smooth 0..1 pulse that rises and falls once across [0,1] */
export const pulse = (t: number) => Math.sin(clamp(t) * Math.PI);

/** triangle wave 0..1..0 */
export const triangle = (t: number) => 1 - Math.abs(((t % 1) * 2) - 1);

export const TAU = Math.PI * 2;
