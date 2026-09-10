import { create } from "zustand";
import type { AspectId, Asset, ParamValues } from "./types";
import { defaults } from "./types";
import { TEMPLATES, TEMPLATES_BY_ID } from "./templates";
import { makePlaceholders } from "./placeholders";

// Each aspect maps to a predefined export resolution (the final asset's pixels).
export const ASPECTS: { id: AspectId; w: number; h: number; width: number; height: number }[] = [
  { id: "9:16", w: 9, h: 16, width: 1080, height: 1920 },
  { id: "3:4", w: 3, h: 4, width: 1080, height: 1440 },
  { id: "1:1", w: 1, h: 1, width: 1080, height: 1080 },
  { id: "4:3", w: 4, h: 3, width: 1440, height: 1080 },
  { id: "16:9", w: 16, h: 9, width: 1920, height: 1080 },
];

// Fixed export frame rate (the FPS control was removed from the UI).
export const EXPORT_FPS = 30;

export interface TextOverlay {
  show: boolean;
  headline: string;
  subhead: string;
  color: string;
  font: "sans" | "serif";
  position: "top" | "center" | "bottom" | "split";
  size: number; // headline size as % of canvas width
}

export type ExportFormat = "mp4" | "webm";

export interface CanvasSettings {
  aspect: AspectId;
  fps: number;
  background: string;
  safeArea: boolean;
  format: ExportFormat;
}

interface AnimatorState {
  // template selection + params
  selectedId: string;
  paramsByTemplate: Record<string, ParamValues>;
  durationByTemplate: Record<string, number>;

  // composition
  canvas: CanvasSettings;
  text: TextOverlay;
  assets: Asset[];

  // playback
  time: number; // seconds (un-looped playhead 0..duration)
  playing: boolean;
  loop: boolean;

  // actions
  selectTemplate: (id: string) => void;
  setParam: (key: string, value: number | string | boolean) => void;
  resetParams: () => void;
  setDuration: (d: number) => void;

  setCanvas: (patch: Partial<CanvasSettings>) => void;
  setText: (patch: Partial<TextOverlay>) => void;

  addAssets: (assets: Asset[]) => void;
  setAssetThumb: (id: string, thumb: string) => void;
  removeAsset: (id: string) => void;
  clearAssets: () => void;
  reorderAssets: (activeId: string, overId: string) => void;

  setTime: (t: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setLoop: (v: boolean) => void;
}

function initialParams(): Record<string, ParamValues> {
  const out: Record<string, ParamValues> = {};
  for (const t of TEMPLATES) out[t.id] = defaults(t.params);
  return out;
}
function initialDurations(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of TEMPLATES) out[t.id] = t.defaultDuration;
  return out;
}

export const useAnimator = create<AnimatorState>((set, get) => ({
  selectedId: TEMPLATES[0].id,
  paramsByTemplate: initialParams(),
  durationByTemplate: initialDurations(),

  canvas: { aspect: "3:4", fps: EXPORT_FPS, background: "#0a0a0b", safeArea: false, format: "mp4" },
  text: {
    show: true,
    headline: "ON FORM",
    subhead: "A Study in Pace",
    color: "#ffffff",
    font: "serif",
    position: "split",
    size: 9,
  },
  assets: makePlaceholders(),

  time: 0,
  playing: true,
  loop: true,

  selectTemplate: (id) => {
    if (!TEMPLATES_BY_ID[id]) return;
    set({ selectedId: id, time: 0 });
  },

  setParam: (key, value) =>
    set((s) => ({
      paramsByTemplate: {
        ...s.paramsByTemplate,
        [s.selectedId]: { ...s.paramsByTemplate[s.selectedId], [key]: value },
      },
    })),

  resetParams: () =>
    set((s) => {
      const t = TEMPLATES_BY_ID[s.selectedId];
      return {
        paramsByTemplate: { ...s.paramsByTemplate, [s.selectedId]: defaults(t.params) },
        durationByTemplate: { ...s.durationByTemplate, [s.selectedId]: t.defaultDuration },
      };
    }),

  setDuration: (d) =>
    set((s) => ({
      durationByTemplate: { ...s.durationByTemplate, [s.selectedId]: Math.max(1, d) },
    })),

  setCanvas: (patch) => set((s) => ({ canvas: { ...s.canvas, ...patch } })),
  setText: (patch) => set((s) => ({ text: { ...s.text, ...patch } })),

  addAssets: (assets) => set((s) => ({ assets: [...s.assets, ...assets] })),
  setAssetThumb: (id, thumb) =>
    set((s) => ({ assets: s.assets.map((a) => (a.id === id ? { ...a, thumb } : a)) })),
  removeAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
  clearAssets: () => set({ assets: [] }),
  reorderAssets: (activeId, overId) =>
    set((s) => {
      const from = s.assets.findIndex((a) => a.id === activeId);
      const to = s.assets.findIndex((a) => a.id === overId);
      if (from < 0 || to < 0 || from === to) return {};
      const next = s.assets.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { assets: next };
    }),

  setTime: (t) => set({ time: t }),
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  togglePlay: () => set((s) => ({ playing: !s.playing })),
  setLoop: (v) => set({ loop: v }),
}));

// Expose the store for debugging / e2e verification.
if (typeof window !== "undefined") {
  (window as unknown as { __animator?: typeof useAnimator }).__animator = useAnimator;
}

// --- selectors / derived helpers ---

export const useCurrentTemplate = () =>
  useAnimator((s) => TEMPLATES_BY_ID[s.selectedId]);

export const useCurrentParams = () =>
  useAnimator((s) => s.paramsByTemplate[s.selectedId]);

export const useCurrentDuration = () =>
  useAnimator((s) => s.durationByTemplate[s.selectedId]);
