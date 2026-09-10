import type { ParamValues, Template } from "./types";

export const DURATION_MIN = 2;
export const DURATION_MAX = 30;

export interface LoopFit {
  /** true when speed × duration already lands on a whole cycle */
  seamless: boolean;
  /** how far off a whole cycle we are, as a fraction of one cycle (0..0.5) */
  offBy: number;
  /** nearest duration that closes the loop, or null if outside the slider */
  duration: number | null;
  /** nearest speed that closes the loop, or null if outside its slider */
  speed: number | null;
  speedKey: string;
  speedUnit: string;
}

const round2 = (v: number) => Math.round(v * 100) / 100;

/**
 * A scrolling or rotating template only repeats after a whole cycle, so the
 * loop cuts unless speed × duration is a multiple of it. Reports whether it
 * does, and the nearest duration and speed that would.
 */
export function loopFit(
  template: Template,
  params: ParamValues,
  duration: number,
  width: number,
  height: number,
): LoopFit | null {
  const cycle = template.loopCycle?.({ params, width, height });
  if (!cycle || !(cycle.span > 0)) return null;

  const param = template.params.find(
    (p) => p.key === cycle.speedKey && p.type === "slider",
  );
  if (!param || param.type !== "slider") return null;

  const speed = typeof params[cycle.speedKey] === "number" ? (params[cycle.speedKey] as number) : 0;
  const travel = Math.abs(speed) * duration;
  if (travel === 0) {
    // Nothing moves, so nothing can cut.
    return {
      seamless: true,
      offBy: 0,
      duration: null,
      speed: null,
      speedKey: cycle.speedKey,
      speedUnit: param.unit ?? "",
    };
  }

  const exact = travel / cycle.span;
  const cycles = Math.max(1, Math.round(exact));
  const offBy = Math.abs(exact - cycles) / 1;

  const fitDuration = round2((cycles * cycle.span) / Math.abs(speed));
  const fitSpeedMag = round2((cycles * cycle.span) / duration);
  const fitSpeed = speed < 0 ? -fitSpeedMag : fitSpeedMag;

  const inDuration = fitDuration >= DURATION_MIN && fitDuration <= DURATION_MAX;
  const inSpeed = fitSpeed >= param.min && fitSpeed <= param.max;

  return {
    // A frame at 60fps moves travel/(duration*60); anything under a tenth of
    // that is invisible, so call it closed.
    seamless: Math.abs(exact - cycles) * cycle.span < Math.abs(speed) / 600,
    offBy,
    duration: inDuration && Math.abs(fitDuration - duration) > 0.01 ? fitDuration : null,
    speed: inSpeed && Math.abs(fitSpeed - speed) > 0.01 ? fitSpeed : null,
    speedKey: cycle.speedKey,
    speedUnit: param.unit ?? "",
  };
}
