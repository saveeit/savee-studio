import type { Layer, Template } from "../types";
import { clamp, easeOutCubic, norm } from "../easing";
import { num, pick, str } from "./_shared";

// Staggered grid reveal that animates in, holds, then animates out each loop.
export const grid: Template = {
  id: "grid",
  name: "Grid",
  group: "Grid",
  blurb: "Staggered grid reveal",
  defaultDuration: 7,
  params: [
    { type: "slider", key: "cols", label: "Columns", min: 1, max: 6, step: 1, default: 3 },
    { type: "slider", key: "rows", label: "Rows", min: 1, max: 6, step: 1, default: 4 },
    { type: "slider", key: "gap", label: "Gap", min: 0, max: 60, default: 14 },
    { type: "slider", key: "padding", label: "Padding", min: 0, max: 160, default: 60 },
    { type: "slider", key: "cornerRadius", label: "Corner Radius", min: 0, max: 40, step: 0.5, default: 8 },
    { type: "slider", key: "stagger", label: "Stagger", min: 0, max: 100, default: 45, unit: "%" },
    {
      type: "segmented",
      key: "reveal",
      label: "Reveal",
      options: [
        { label: "Rise", value: "rise" },
        { label: "Scale", value: "scale" },
        { label: "Fade", value: "fade" },
      ],
      default: "rise",
    },
    {
      type: "segmented",
      key: "order",
      label: "Order",
      options: [
        { label: "Rows", value: "rows" },
        { label: "Diagonal", value: "diag" },
        { label: "Center", value: "center" },
      ],
      default: "diag",
    },
  ],
  render: ({ t, duration, width, height, assets, params }) => {
    const cols = Math.round(num(params.cols, 3));
    const rows = Math.round(num(params.rows, 4));
    const gap = num(params.gap);
    const pad = num(params.padding);
    const radius = num(params.cornerRadius, 8);
    const reveal = str(params.reveal, "rise");
    const order = str(params.order, "diag");

    const innerW = width - pad * 2;
    const innerH = height - pad * 2;
    const cellW = (innerW - gap * (cols - 1)) / cols;
    const cellH = (innerH - gap * (rows - 1)) / rows;

    const n = cols * rows;
    const staggerFrac = num(params.stagger, 45) / 100;
    // reveal window: in over first 40%, out over last 25%
    const p = t / duration;

    const orderKey = (r: number, c: number) => {
      if (order === "rows") return r * cols + c;
      if (order === "center") {
        const dr = r - (rows - 1) / 2;
        const dc = c - (cols - 1) / 2;
        return Math.hypot(dr, dc);
      }
      return r + c; // diagonal
    };
    let maxKey = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) maxKey = Math.max(maxKey, orderKey(r, c));

    const layers: Layer[] = [];
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellCx = pad + c * (cellW + gap) + cellW / 2;
        const cellCy = pad + r * (cellH + gap) + cellH / 2;
        const delayUnit = maxKey > 0 ? orderKey(r, c) / maxKey : 0;
        const delay = delayUnit * staggerFrac * 0.5; // up to half the loop spent staggering in

        const inP = easeOutCubic(clamp(norm(p, delay, delay + 0.35)));
        const outP = easeOutCubic(clamp(norm(p, 0.75 + delay * 0.2, 0.97)));
        const vis = inP * (1 - outP);

        let scale = 1;
        let opacity = vis;
        let dy = 0;
        if (reveal === "scale") scale = 0.6 + 0.4 * vis;
        else if (reveal === "rise") dy = (1 - inP) * cellH * 0.6 - outP * cellH * 0.4;

        layers.push({
          id: `g${idx}`,
          type: "image",
          src: pick(assets, idx),
          x: cellCx,
          y: cellCy + dy,
          w: cellW,
          h: cellH,
          scale,
          opacity: clamp(opacity, 0, 1),
          radius,
          z: idx,
          shadow: 0.25 * vis,
        });
        idx++;
      }
    }
    return layers;
  },
};
