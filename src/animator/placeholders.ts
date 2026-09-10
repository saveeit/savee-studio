import type { Asset } from "./types";
import placeholderAssets from "./placeholderAssets.json";

// Editorial-ish gradient placeholders generated as inline SVG data URIs.
// Used as a fallback when no bundled placeholder images are present.

const PALETTES: [string, string, string][] = [
  ["#3a2f2a", "#caa472", "#1a1410"],
  ["#1c2230", "#6d8bb0", "#0a0d14"],
  ["#2a1c24", "#b07a8e", "#140d11"],
  ["#1f2a23", "#7faf8e", "#0c130f"],
  ["#2b2620", "#d8c39a", "#16130e"],
  ["#21202c", "#9c93ff", "#0d0d14"],
  ["#2c211c", "#cf8f6a", "#140e0a"],
  ["#1a2630", "#5fa3c4", "#0a1014"],
  ["#2a2230", "#a98fd6", "#120e16"],
  ["#262a1c", "#b7c47a", "#11130b"],
  ["#30231f", "#e0a489", "#160f0c"],
  ["#1c2c2b", "#6fc4bd", "#0b1413"],
];

function svg(i: number, [a, b, c]: [string, string, string]) {
  const n = String(i + 1).padStart(2, "0");
  const angle = (i * 37) % 180;
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'>
  <defs>
    <linearGradient id='g' gradientTransform='rotate(${angle})'>
      <stop offset='0' stop-color='${a}'/>
      <stop offset='0.55' stop-color='${b}'/>
      <stop offset='1' stop-color='${c}'/>
    </linearGradient>
    <radialGradient id='v' cx='50%' cy='38%' r='75%'>
      <stop offset='0.55' stop-color='#000' stop-opacity='0'/>
      <stop offset='1' stop-color='#000' stop-opacity='0.45'/>
    </radialGradient>
  </defs>
  <rect width='600' height='800' fill='url(#g)'/>
  <rect width='600' height='800' fill='url(#v)'/>
  <circle cx='${120 + ((i * 90) % 360)}' cy='${200 + ((i * 130) % 360)}' r='${60 + ((i * 23) % 90)}' fill='#fff' fill-opacity='0.05'/>
  <text x='40' y='760' font-family='Inter, sans-serif' font-size='52' font-weight='700' fill='#fff' fill-opacity='0.82'>${n}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(s)}`;
}

/** Generated gradient placeholders — fallback when no real media is available. */
export function makeGradients(count = 12): Asset[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ph-${i}`,
    name: `Sample ${String(i + 1).padStart(2, "0")}`,
    src: svg(i, PALETTES[i % PALETTES.length]),
    aspect: 600 / 800,
  }));
}

/**
 * Default starter assets: bundled placeholder images served from /public/assets.
 * Falls back to generated gradients if the manifest is empty.
 */
export function makePlaceholders(): Asset[] {
  if (!placeholderAssets.length) return makeGradients();
  return placeholderAssets.map((a, i) => ({
    id: `asset-${i}`,
    name: a.name,
    src: a.file,
    // 160px variants live alongside the originals; the sidebar list shows a
    // 32x40 box, so shipping the full-size jpg there wastes bytes and decode.
    thumb: a.file.replace("/assets/", "/assets/thumbs/"),
    aspect: a.aspect,
  }));
}
