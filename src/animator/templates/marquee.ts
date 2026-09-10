import type { Layer, ParamValues, Template } from "../types";
import { num, pick, bool, wrap } from "./_shared";

// Multiple horizontal rows scrolling, alternating directions.
const THUMB_ASPECT = 3 / 4;

/** Shared by `render` and `loopCycle` so the two can never drift apart. */
function rowsOf(params: ParamValues, width: number, height: number) {
  const rows = Math.round(num(params.rows, 3));
  const perRow = Math.round(num(params.perRow, 6));
  const gapY = num(params.gapY, 18);
  const thumbH = (height - gapY * (rows - 1)) / rows;
  const thumbW = Math.min(
    thumbH * THUMB_ASPECT * (num(params.thumbSize, 100) / 100),
    width * 0.6,
  );
  const spacing = thumbW + num(params.gapX, 18);
  return { rows, perRow, gapY, thumbW, thumbH, spacing, total: perRow * spacing };
}

export const marquee: Template = {
  id: "marquee",
  name: "Marquee",
  group: "Marquee",
  blurb: "Infinite scrolling rows",
  defaultDuration: 10,
  params: [
    { type: "slider", key: "rows", label: "Rows", min: 1, max: 6, step: 1, default: 3 },
    { type: "slider", key: "perRow", label: "Per Row", min: 3, max: 12, step: 1, default: 6 },
    { type: "slider", key: "thumbSize", label: "Thumb Size", min: 40, max: 200, default: 100 },
    { type: "slider", key: "gapX", label: "Gap X", min: 0, max: 80, default: 18 },
    { type: "slider", key: "gapY", label: "Gap Y", min: 0, max: 80, default: 18 },
    { type: "slider", key: "cornerRadius", label: "Corner Radius", min: 0, max: 40, step: 0.5, default: 8 },
    { type: "slider", key: "speed", label: "Speed", min: 0, max: 320, default: 120, unit: "px/s" },
    { type: "toggle", key: "alternate", label: "Alternate Dir", default: true },
  ],
  loopCycle: ({ params, width, height }) => ({
    span: rowsOf(params, width, height).total,
    speedKey: "speed",
  }),
  render: ({ raw, width, height, assets, params }) => {
    const { rows, perRow, gapY, thumbW, thumbH, spacing, total } = rowsOf(params, width, height);
    const radius = num(params.cornerRadius, 8);
    const speed = num(params.speed, 120);
    const alt = bool(params.alternate, true);

    const layers: Layer[] = [];
    for (let r = 0; r < rows; r++) {
      const dir = alt && r % 2 === 1 ? -1 : 1;
      const y = thumbH / 2 + r * (thumbH + gapY);
      const scroll = raw * speed * dir;
      for (let i = 0; i < perRow; i++) {
        const x = width / 2 + wrap(i * spacing - scroll, total);
        layers.push({
          id: `m${r}-${i}`,
          type: "image",
          src: pick(assets, r * perRow + i),
          x,
          y,
          w: thumbW,
          h: thumbH,
          radius,
          z: r,
          shadow: 0.18,
        });
      }
    }
    return layers;
  },
};
