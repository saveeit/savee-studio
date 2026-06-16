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
- **Two renderers** consume the same `Layer[]`:
  - `renderers/DomRenderer.tsx` — crisp live preview (absolutely-positioned DOM).
  - `renderers/canvasRenderer.ts` — draws to a 2D canvas for **video export**
    (`exporter.ts`). Exports **MP4 (H.264)** by default via deterministic,
    frame-by-frame **WebCodecs** encoding (30fps), falling back to a real-time
    `MediaRecorder` WebM where WebCodecs is unavailable. The selected **aspect
    ratio sets the output resolution** (predefined in `store.ts`: 1:1→1080², 9:16→
    1080×1920, 3:4→1080×1440, 4:3→1440×1080, 16:9→1920×1080).
- **State** lives in a single zustand store (`src/animator/store.ts`):
  selection, per-template params, canvas settings, text overlay, assets, playback.

### Placeholder assets

The starter assets are bundled images in the repo (no network calls):

- `public/assets/*.jpg` — downscaled (long side 1200px), served same-origin so
  canvas export never hits CORS tainting.
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

## Roadmap / next steps

- Real Savee inspo picker (currently generated gradient placeholders + uploads).
- More templates (3D, parallax, spin, wheel variants) and per-layer keyframing.
- A "Save as custom" preset library (the Custom tab + button are stubbed).
- Per-asset focal point / cropping; audio track + waveform.
