import type { Layer, Template } from "../types";
import { clamp, mapClamp } from "../easing";
import { gauss, num, pick, str, wrap } from "./_shared";

// Vertical filmstrip à la "Stories" — a column of thumbs scrolls past a fixed
// selector frame; the framed item blooms.
export const stack: Template = {
  id: "stack",
  name: "Stories",
  group: "Stack",
  blurb: "Vertical filmstrip with a selector frame",
  defaultDuration: 10,
  params: [
    {
      type: "segmented",
      key: "direction",
      label: "Direction",
      options: [
        { label: "Up", value: "up" },
        { label: "Down", value: "down" },
      ],
      default: "down",
    },
    { type: "slider", key: "count", label: "Count", min: 4, max: 16, step: 1, default: 8 },
    { type: "slider", key: "thumbSize", label: "Thumb Size", min: 40, max: 160, default: 100 },
    { type: "slider", key: "gap", label: "Gap", min: 0, max: 60, default: 14 },
    { type: "slider", key: "bigScale", label: "Selected Scale", min: 100, max: 200, default: 132, unit: "%" },
    { type: "slider", key: "cornerRadius", label: "Corner Radius", min: 0, max: 40, step: 0.5, default: 6 },
    { type: "slider", key: "selectorPad", label: "Selector Pad", min: 0, max: 24, step: 0.5, default: 6 },
    { type: "slider", key: "selectorStroke", label: "Selector Stroke", min: 0, max: 8, step: 0.5, default: 2 },
    { type: "slider", key: "dim", label: "Dim Amount", min: 0, max: 90, default: 50, unit: "%" },
    { type: "slider", key: "speed", label: "Speed", min: 0, max: 220, default: 70, unit: "px/s" },
    { type: "toggle", key: "selector", label: "Show Selector", default: true },
  ],
  render: ({ raw, width, height, assets, params }) => {
    const cx = width / 2;
    const cy = height / 2;
    const dir = str(params.direction, "down") === "down" ? 1 : -1;

    const count = Math.round(num(params.count, 8));
    const aspectWH = 3 / 4;
    const thumbW = (num(params.thumbSize, 100) / 100) * width * 0.34;
    const thumbH = thumbW / aspectWH;
    const gap = num(params.gap);
    const spacing = thumbH + gap;
    const totalSpan = count * spacing;

    const bigScale = num(params.bigScale, 132) / 100;
    const radius = num(params.cornerRadius, 6);
    const dim = num(params.dim, 50) / 100;
    const focusW = spacing * 0.62;
    const scroll = raw * num(params.speed, 70) * dir;

    const layers: Layer[] = [];
    for (let i = 0; i < count; i++) {
      const y = cy + wrap(i * spacing - scroll, totalSpan);
      const d = Math.abs(y - cy);
      const focus = gauss(d, focusW);
      const scale = 1 + (bigScale - 1) * focus;
      const opacity = 1 - dim * (1 - focus);
      layers.push({
        id: `s${i}`,
        type: "image",
        src: pick(assets, i),
        x: cx,
        y,
        w: thumbW,
        h: thumbH,
        scale,
        opacity: clamp(opacity, 0, 1),
        radius,
        brightness: mapClamp(focus, 0, 1, 0.7, 1),
        z: Math.round(focus * 100),
        shadow: 0.4 * focus,
      });
    }

    if (params.selector !== false) {
      const pad = num(params.selectorPad, 6);
      const stroke = num(params.selectorStroke, 2);
      const w = thumbW * bigScale + pad * 2;
      const h = thumbH * bigScale + pad * 2;
      // outline drawn as a slightly larger translucent frame behind nothing —
      // represented with a rect that has no fill but a bright ring via shadow.
      layers.push({
        id: "selector",
        type: "rect",
        x: cx,
        y: cy,
        w,
        h,
        radius: radius + pad,
        fill: "rgba(255,255,255,0.04)",
        ring: stroke,
        ringColor: "rgba(255,255,255,0.9)",
        z: 200,
      });
    }
    return layers;
  },
};
