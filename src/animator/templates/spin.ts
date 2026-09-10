import type { Layer, Template } from "../types";
import { TAU, clamp } from "../easing";
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
  render: ({ raw, duration, width, height, assets, params }) => {
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

    // Rotation is driven off the loop phase so it returns to where it started
    // instead of cutting at the wrap.
    const loopPhase = duration > 0 ? raw / duration : 0;
    const drift = rotate * Math.sin(TAU * loopPhase);

    const layers: Layer[] = [];

    if (!cycle || assets.length <= 1) {
      // Single image: breathe in and back out across the loop so the seam is
      // invisible rather than snapping from full zoom back to none.
      layers.push({
        id: "hero",
        type: "image",
        src: pick(assets, 0),
        x: cx,
        y: cy,
        w,
        h,
        scale: 1 + zoom * (1 - Math.cos(TAU * loopPhase)) / 2,
        rotation: drift,
        radius,
        z: 1,
        shadow: 0.45,
      });
      return layers;
    }

    // Fit a whole number of slides into the loop. Otherwise the wrap lands in
    // the middle of a slide and cuts.
    const slides = Math.max(1, Math.round(duration / (num(params.hold, 2.5) + num(params.crossfade, 0.8))));
    const slideDur = duration / slides;
    const fade = Math.min(num(params.crossfade, 0.8), slideDur * 0.6);
    const hold = slideDur - fade;

    const slideIndex = Math.floor(raw / slideDur);
    const within = raw - slideIndex * slideDur;
    const cur = ((slideIndex % slides) + slides) % slides;
    const next = (cur + 1) % slides;

    // A slide is on screen from its pre-roll (while the previous one fades out)
    // until it has faded out itself, so its zoom is one straight ramp over that
    // whole life, addressed by the slide's own local time. Because both roles
    // read the same ramp, the handoff carries the same value *and* the same
    // speed across — an eased curve would flatten to zero at each end and read
    // as a pause.
    const life = slideDur + fade;
    const zoomAt = (local: number) => 1 + zoom * clamp((local + fade) / life);

    const curOpacity = within > hold ? 1 - (within - hold) / fade : 1;
    layers.push({
      id: `hero-${cur}`,
      type: "image",
      src: pick(assets, cur),
      x: cx,
      y: cy,
      w,
      h,
      scale: zoomAt(within),
      rotation: drift,
      opacity: clamp(curOpacity),
      radius,
      z: 1,
      shadow: 0.45,
    });

    if (slides > 1 && within > hold) {
      const p = (within - hold) / fade;
      layers.push({
        id: `hero-${next}`,
        type: "image",
        src: pick(assets, next),
        x: cx,
        y: cy,
        w,
        h,
        scale: zoomAt(within - slideDur),
        rotation: drift,
        opacity: clamp(p),
        radius,
        z: 2,
        shadow: 0.45,
      });
    }
    return layers;
  },
};
