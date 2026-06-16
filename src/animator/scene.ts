import type { Asset, Layer, ParamValues, Template } from "./types";
import type { TextOverlay } from "./store";

export interface ComposeArgs {
  template: Template;
  params: ParamValues;
  raw: number; // un-looped seconds
  duration: number;
  width: number;
  height: number;
  assets: Asset[];
  text: TextOverlay;
}

/** Build the full layer list for a given playhead time. */
export function composeScene(args: ComposeArgs): Layer[] {
  const { template, params, raw, duration, width, height, assets, text } = args;
  const t = duration > 0 ? ((raw % duration) + duration) % duration : 0;

  const layers = template.render({
    t,
    raw,
    duration,
    width,
    height,
    assets,
    params,
  });

  if (text.show && (text.headline || text.subhead)) {
    layers.push(...textLayers(text, width, height));
  }
  return layers.sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
}

function textLayers(text: TextOverlay, width: number, height: number): Layer[] {
  const out: Layer[] = [];
  const headSize = (text.size / 100) * width;
  const subSize = headSize * 0.42;
  const family = text.font === "serif" ? "Georgia, serif" : "var(--font-sans)";

  const headlineY = (() => {
    switch (text.position) {
      case "top":
        return height * 0.16;
      case "center":
        return height * 0.46;
      case "bottom":
        return height * 0.8;
      default:
        return height * 0.32; // split
    }
  })();
  const subheadY = (() => {
    switch (text.position) {
      case "top":
        return height * 0.16 + headSize * 0.9;
      case "center":
        return height * 0.46 + headSize * 0.85;
      case "bottom":
        return height * 0.8 + headSize * 0.85;
      default:
        return height * 0.68; // split
    }
  })();

  if (text.headline) {
    out.push({
      id: "text-headline",
      type: "text",
      text: text.headline,
      x: width / 2,
      y: headlineY,
      w: width * 0.92,
      h: headSize * 1.4,
      color: text.color,
      fontSize: headSize,
      fontFamily: family,
      fontWeight: text.font === "serif" ? 500 : 700,
      letterSpacing: text.font === "serif" ? 0 : -headSize * 0.02,
      align: "center",
      uppercase: text.font !== "serif",
      z: 500,
      shadow: 0.35,
    });
  }
  if (text.subhead) {
    out.push({
      id: "text-subhead",
      type: "text",
      text: text.subhead,
      x: width / 2,
      y: subheadY,
      w: width * 0.9,
      h: subSize * 1.6,
      color: text.color,
      fontSize: subSize,
      fontFamily: family,
      fontWeight: 400,
      italic: text.font === "serif",
      align: "center",
      z: 500,
      shadow: 0.3,
    });
  }
  return out;
}
