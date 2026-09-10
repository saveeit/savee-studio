# Savee Animator

A web-based animation studio — "After Effects for inspo." Pick a template, tweak
its controls, drop in images (bundled placeholders or uploads from your computer),
scrub the timeline, and export to MP4. Built for Savee.

## Stack

Matches the Savee `www` app conventions:

- **Next.js 15** (Pages Router) · **React 18** · **TypeScript**
- **Tailwind 3** · **zustand 5** · **lucide-react** · `clsx` + `tailwind-merge`
- **pnpm**

## Run

```bash
pnpm install
pnpm dev      # http://localhost:3100
pnpm build    # production build
pnpm type     # typecheck
```

## How it works

Everything renders deterministically from a single playhead time `t`, which is what
makes scrubbing, looping, and export all consistent.

- **Templates** (`src/animator/templates/`) are pure functions
  `(ctx) => Layer[]` — given the time, params, canvas size, and assets, they return
  a flat list of positioned layers. Each template declares its own **param schema**,
  and the controls panel is generated automatically from it.
- **Scene model** (`src/animator/scene.ts`) merges template layers with the global
  text overlay and sorts by paint order.
- **One renderer** (`renderers/canvasRenderer.ts`) draws the `Layer[]` to a 2D
  canvas, and both the preview and the export go through it — so what you see is
  what you get. The preview draws at screen resolution (capped at the export
  resolution); the export draws at full size.
- **Export** (`exporter.ts`) writes **MP4 (H.264)** by default via deterministic,
  frame-by-frame **WebCodecs** encoding (30fps), falling back to a real-time
  `MediaRecorder` WebM where WebCodecs is unavailable. The muxers are imported on
  demand, so they stay out of the initial bundle. The selected **aspect ratio sets
  the output resolution** (predefined in `store.ts`: 1:1→1080², 9:16→1080×1920,
  3:4→1080×1440, 4:3→1440×1080, 16:9→1920×1080).
- **State** lives in a single zustand store (`src/animator/store.ts`): selection,
  per-template params, canvas settings, text overlay, assets, playback. None of it
  is persisted yet, so a reload starts over.

### The playhead is not React state

The preview and the timeline subscribe to the playback loop (`usePlayback.ts`)
and write to the DOM themselves, so a frame costs no render. Nothing subscribes
to `time`; a component that needs it reads `useAnimator.getState()`.


### Placeholder assets

The starter assets are bundled images in the repo (no network calls):

- `public/assets/*.jpg` — downscaled (long side 1200px), served same-origin so
  canvas export never hits CORS tainting.
- `public/assets/thumbs/*.jpg` — 160px variants for the sidebar list, which would
  otherwise decode the full-size file into a 32×40 box.
- `src/animator/placeholderAssets.json` — the manifest (file, name, aspect).

To swap them, drop new images in `public/assets/` and update the manifest. Uploads
from the right panel still work alongside these.

### Templates included

Carousel · Stories (vertical filmstrip) · Grid · Orbit · Marquee · Hero.

## Adding a template

1. Create `src/animator/templates/yours.ts` exporting a `Template` (id, name, group,
   `defaultDuration`, `params`, `render`).
2. Register it in `src/animator/templates/index.ts`.

The controls panel, timeline, preview, and export all pick it up with no extra work.

Keep `render` a pure function of `t`. It is what makes scrubbing, looping and
export agree, and it means a template can be checked frame by frame without a
browser.

## Roadmap / next steps

- Real Savee inspo picker (currently bundled placeholders + uploads).
- More templates (3D, parallax, spin, wheel variants) and per-layer keyframing.
- A "Save as custom" preset library (the Custom tab + button are stubbed).
- Per-asset focal point / cropping. Every template currently draws at 3:4, which
  discards on average 15% of an asset and up to 43% of a landscape one —
  `Asset.aspect` is recorded but nothing reads it yet.
- Seamless loops. A template that scrolls or rotates only repeats after
  travelling a whole cycle, so the loop cuts unless `speed × duration` lands on a
  multiple of it. At factory settings Orbit jumps a third of the canvas diagonal
  when it wraps, and Carousel, Marquee and Stories each have images appear from
  nowhere. Closing it means either constraining those two controls against each
  other, or blending the tail into the head at export.
- Persistence. Nothing survives a reload today, under a top bar that reads "Sign
  in to save your work". Params, canvas and text are plain JSON and would fit in
  `localStorage`; uploads need IndexedDB, since an object URL dies with the page
  that made it.
- Cancelling an export, and an estimate of how long one will take. Today it runs
  to completion with only a percentage, and reports its outcome through
  `alert()`.
- Undo/redo, keyboard transport shortcuts, MP4/WebM and frame-rate pickers
  (`canvas.format` and `canvas.fps` exist in the store with no UI).
- A responsive layout. The three panels are 888px of fixed width with no
  breakpoints, leaving 392px of stage on a 1280px screen.
- Accessibility beyond the slider: the segmented, toggle and colour controls
  expose no role or state, and there are no focus rings.
- Audio track + waveform.
