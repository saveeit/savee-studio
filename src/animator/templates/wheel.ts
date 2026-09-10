import type { Layer, Template } from "../types";
import { TAU, clamp, mapClamp } from "../easing";
import { num, pick, bool } from "./_shared";

// Images arranged around a circle, slowly rotating with fake depth.
export const wheel: Template = {
  id: "wheel",
  name: "Orbit",
  group: "Orbit",
  blurb: "Radial ring of thumbs with depth",
  defaultDuration: 12,
  params: [
    { type: "slider", key: "count", label: "Count", min: 3, max: 16, step: 1, default: 8 },
    { type: "slider", key: "radius", label: "Radius", min: 20, max: 90, default: 60, unit: "%" },
    { type: "slider", key: "thumbSize", label: "Thumb Size", min: 40, max: 180, default: 100 },
    { type: "slider", key: "cornerRadius", label: "Corner Radius", min: 0, max: 40, step: 0.5, default: 8 },
    { type: "slider", key: "rotateSpeed", label: "Rotate Speed", min: -60, max: 60, default: 18, unit: "°/s" },
    { type: "slider", key: "tilt", label: "Tilt", min: 0, max: 80, default: 35, unit: "%" },
    { type: "slider", key: "depth", label: "Depth Scale", min: 0, max: 80, default: 45, unit: "%" },
    { type: "toggle", key: "faceCenter", label: "Face Center", default: false },
  ],
  // Each card carries a different image, so the ring only repeats after a whole
  // revolution — not after one card-step.
  loopCycle: () => ({ span: 360, speedKey: "rotateSpeed" }),
  render: ({ raw, width, height, assets, params }) => {
    const cx = width / 2;
    const cy = height / 2;
    const count = Math.round(num(params.count, 8));
    const R = (num(params.radius, 60) / 100) * Math.min(width, height) * 0.5;
    const aspectWH = 3 / 4;
    const thumbW = (num(params.thumbSize, 100) / 100) * width * 0.18;
    const thumbH = thumbW / aspectWH;
    const radius = num(params.cornerRadius, 8);
    const rot = (raw * num(params.rotateSpeed, 18) * Math.PI) / 180;
    const tilt = num(params.tilt, 35) / 100; // vertical squish
    const depth = num(params.depth, 45) / 100;
    const faceCenter = bool(params.faceCenter);

    const layers: Layer[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + rot;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R * (1 - tilt);
      // front (sin large) → bigger & brighter
      const front = (Math.sin(a) + 1) / 2;
      const scale = 1 + depth * (front - 0.5) * 2 * 0.5;
      layers.push({
        id: `w${i}`,
        type: "image",
        src: pick(assets, i),
        x,
        y,
        w: thumbW,
        h: thumbH,
        scale: Math.max(0.3, scale),
        opacity: mapClamp(front, 0, 1, 0.55, 1),
        rotation: faceCenter ? (a * 180) / Math.PI + 90 : 0,
        radius,
        brightness: mapClamp(front, 0, 1, 0.65, 1),
        z: Math.round(front * 100),
        shadow: 0.3 * front,
      });
    }
    return layers;
  },
};
