import type { Layer, ParamValues, Template } from "../types";
import { clamp, mapClamp } from "../easing";
import { gauss, num, pick, str, wrap } from "./_shared";

const THUMB_ASPECT = 3 / 4;

/** Layout of the arrangement, kept out of `render` so it reads as one step. */
function strip(params: ParamValues, width: number) {
  const count = Math.round(num(params.count, 7));
  const thumbW = (num(params.thumbSize, 100) / 100) * width * 0.26;
  const spacing = thumbW + num(params.gap);
  return { count, thumbW, thumbH: thumbW / THUMB_ASPECT, spacing, total: count * spacing };
}

export const carousel: Template = {
  id: "carousel",
  name: "Carousel",
  group: "Carousel",
  blurb: "Horizontal reel, center item blooms",
  defaultDuration: 8,
  params: [
    {
      type: "segmented",
      key: "direction",
      label: "Direction",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
      default: "left",
    },
    { type: "slider", key: "count", label: "Count", min: 3, max: 14, step: 1, default: 7 },
    { type: "slider", key: "thumbSize", label: "Thumb Size", min: 40, max: 160, default: 100 },
    { type: "slider", key: "gap", label: "Gap", min: 0, max: 120, default: 28 },
    { type: "slider", key: "bigScale", label: "Center Scale", min: 100, max: 220, default: 150, unit: "%" },
    { type: "slider", key: "focus", label: "Focus Width", min: 10, max: 100, default: 42, unit: "%" },
    { type: "slider", key: "cornerRadius", label: "Corner Radius", min: 0, max: 48, step: 0.5, default: 8 },
    { type: "slider", key: "dim", label: "Dim Amount", min: 0, max: 90, default: 45, unit: "%" },
    { type: "slider", key: "speed", label: "Speed", min: 0, max: 300, default: 90, unit: "px/s" },
    { type: "slider", key: "drift", label: "Vertical Drift", min: 0, max: 60, default: 0 },
  ],
  render: ({ raw, width, height, assets, params }) => {
    const cx = width / 2;
    const cy = height / 2;
    const dir = str(params.direction, "left") === "left" ? -1 : 1;

    const { count, thumbW, thumbH, spacing, total } = strip(params, width);

    const bigScale = num(params.bigScale, 150) / 100;
    const focusW = (num(params.focus, 42) / 100) * width * 0.5;
    const radius = num(params.cornerRadius, 8);
    const dim = num(params.dim, 45) / 100;
    const scroll = raw * num(params.speed, 90) * dir;
    const drift = num(params.drift);

    const layers: Layer[] = [];
    for (let i = 0; i < count; i++) {
      const x = cx + wrap(i * spacing - scroll, total);
      const d = Math.abs(x - cx);
      const focus = gauss(d, focusW);
      const scale = 1 + (bigScale - 1) * focus;
      const opacity = 1 - dim * (1 - focus);
      const yDrift = drift * Math.sin((i + raw * 0.4) * 1.3);
      layers.push({
        id: `c${i}`,
        type: "image",
        src: pick(assets, i),
        x,
        y: cy + yDrift,
        w: thumbW,
        h: thumbH,
        scale,
        opacity: clamp(opacity, 0, 1),
        radius,
        brightness: mapClamp(focus, 0, 1, 0.78, 1),
        z: Math.round(focus * 100),
        shadow: 0.35 * focus,
      });
    }
    return layers;
  },
};
