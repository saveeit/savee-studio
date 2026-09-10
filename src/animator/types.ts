// ---------------------------------------------------------------------------
// Core scene model
//
// Everything renders deterministically from a single playhead time `t`.
// A template is a pure function (ctx) => Layer[]. The same Layer[] is consumed
// by both the live DOM renderer (crisp preview) and the Canvas renderer (export).
// ---------------------------------------------------------------------------

export type AspectId = "9:16" | "3:4" | "1:1" | "4:3" | "16:9";

export interface Asset {
  id: string;
  name: string;
  src: string; // object URL, data URI, or remote URL
  /** intrinsic aspect (w/h) when known, used for cover-fitting */
  aspect?: number;
}

export type LayerType = "image" | "text" | "rect";

export interface Layer {
  id: string;
  type: LayerType;
  /** center x/y in canvas pixels */
  x: number;
  y: number;
  /** unscaled box size in canvas pixels */
  w: number;
  h: number;
  rotation?: number; // degrees
  scale?: number; // multiplier on w/h, default 1
  opacity?: number; // 0..1, default 1
  radius?: number; // corner radius px
  blur?: number; // gaussian blur px
  brightness?: number; // 1 = normal
  z?: number; // paint order, higher = front

  // image
  src?: string;

  // rect
  fill?: string;
  /** stroke ring width in px (rect outline / selector frame) */
  ring?: number;
  ringColor?: string;

  // text
  text?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  letterSpacing?: number; // px
  lineHeight?: number; // multiplier
  align?: "left" | "center" | "right";
  italic?: boolean;
  uppercase?: boolean;

  // soft drop shadow strength (0..1)
  shadow?: number;
}

// --- Control schema (drives the auto-generated controls panel) ---

export interface SliderParam {
  type: "slider";
  key: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
  unit?: string;
  /** display value transform (e.g. ms) */
  format?: (v: number) => string;
}

export interface SegmentedParam {
  type: "segmented";
  key: string;
  label: string;
  options: { label: string; value: string | number }[];
  default: string | number;
}

export interface ToggleParam {
  type: "toggle";
  key: string;
  label: string;
  default: boolean;
}

export interface ColorParam {
  type: "color";
  key: string;
  label: string;
  default: string;
}

export type Param = SliderParam | SegmentedParam | ToggleParam | ColorParam;

export type ParamValues = Record<string, number | string | boolean>;

export interface RenderContext {
  t: number; // seconds, looped into [0, duration)
  raw: number; // raw seconds (un-looped)
  duration: number;
  width: number;
  height: number;
  assets: Asset[];
  params: ParamValues;
}

export interface Template {
  id: string;
  name: string;
  group: string;
  /** short tagline shown in the list */
  blurb?: string;
  defaultDuration: number;
  params: Param[];
  render: (ctx: RenderContext) => Layer[];
}

export function defaults(params: Param[]): ParamValues {
  const v: ParamValues = {};
  for (const p of params) v[p.key] = p.default;
  return v;
}
