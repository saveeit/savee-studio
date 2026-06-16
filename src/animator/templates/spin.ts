import type { Layer, Template } from "../types";
import { clamp, easeInOutSine } from "../easing";
import { num, pick, bool } from "./_shared";

// Single hero image: slow zoom/rotate (Ken Burns) with optional crossfade
// through the asset list.
export const spin: Template = {
  id: "spin",
  name: "Hero",
  group: "Spin",
  blurb: "Single image, zoom + crossfade",
  defaultDuration: 9,
  params: [
    { type: "slider", key: "size", label: "Size", min: 40, max: 100, default: 80, unit: "%" },
    { type: "slider", key: "cornerRadius", label: "Corner Radius", min: 0, max: 60, step: 0.5, default: 10 },
    { type: "slider", key: "zoom", label: "Zoom", min: 0, max: 40, default: 12, unit: "%" },
    { type: "slider", key: "rotate", label: "Rotate", min: -30, max: 30, default: 0, unit: "°" },
    { type: "slider", key: "hold", label: "Hold Per Slide", min: 1, max: 6, step: 0.5, default: 2.5, unit: "s" },
    { type: "slider", key: "crossfade", label: "Crossfade", min: 0.1, max: 2, step: 0.1, default: 0.8, unit: "s" },
    { type: "toggle", key: "cycle", label: "Cycle Assets", default: true },
  ],
  render: ({ raw, width, height, assets, params }) => {
    const cx = width / 2;
    const cy = height / 2;
    const sizeF = num(params.size, 80) / 100;
    const aspectWH = 3 / 4;
    let w = width * sizeF;
    let h = w / aspectWH;
    if (h > height * sizeF) {
      h = height * sizeF;
      w = h * aspectWH;
    }
    const radius = num(params.cornerRadius, 10);
    const zoom = num(params.zoom, 12) / 100;
    const rotate = num(params.rotate, 0);
    const cycle = bool(params.cycle, true);

    const hold = num(params.hold, 2.5);
    const fade = num(params.crossfade, 0.8);
    const slideDur = hold + fade;

    const layers: Layer[] = [];

    if (!cycle || assets.length <= 1) {
      const phase = (raw % slideDur) / slideDur;
      const z = 1 + zoom * easeInOutSine(phase);
      layers.push({
        id: "hero",
        type: "image",
        src: pick(assets, 0),
        x: cx,
        y: cy,
        w,
        h,
        scale: z,
        rotation: rotate * Math.sin(raw * 0.3),
        radius,
        z: 1,
        shadow: 0.45,
      });
      return layers;
    }

    // crossfade between consecutive slides
    const slideIndex = Math.floor(raw / slideDur);
    const within = raw - slideIndex * slideDur;
    const cur = slideIndex;
    const next = slideIndex + 1;

    const baseZoom = (local: number) => 1 + zoom * easeInOutSine(clamp(local / slideDur));

    // current slide fades out during the fade window at the end
    const curOpacity = within > hold ? 1 - (within - hold) / fade : 1;
    layers.push({
      id: `hero-${cur}`,
      type: "image",
      src: pick(assets, cur),
      x: cx,
      y: cy,
      w,
      h,
      scale: baseZoom(within),
      rotation: rotate * Math.sin((raw + cur) * 0.3),
      opacity: clamp(curOpacity),
      radius,
      z: 1,
      shadow: 0.45,
    });

    if (within > hold) {
      const nOpacity = (within - hold) / fade;
      layers.push({
        id: `hero-${next}`,
        type: "image",
        src: pick(assets, next),
        x: cx,
        y: cy,
        w,
        h,
        scale: 1 + zoom * 0.15 + zoom * 0.15 * (within - hold),
        rotation: rotate * Math.sin((raw + next) * 0.3),
        opacity: clamp(nOpacity),
        radius,
        z: 2,
        shadow: 0.45,
      });
    }
    return layers;
  },
};
