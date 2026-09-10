import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ASPECTS, useAnimator } from "../store";
import { TEMPLATES_BY_ID } from "../templates";
import { composeScene } from "../scene";
import { createImageLoader, drawScene } from "../renderers/canvasRenderer";
import { onFrame } from "../usePlayback";

/** Predefined export resolution for the selected aspect (always even for H.264). */
export function canvasSize(aspectId: string) {
  const a = ASPECTS.find((x) => x.id === aspectId) ?? ASPECTS[1];
  return { width: a.width, height: a.height };
}

const PAD = 56;

/**
 * The preview draws straight to a 2D canvas from the playback loop — the same
 * renderer the exporter uses, so what you see is what you get. React only owns
 * the container size and the safe-area overlay; the playhead never enters the
 * render path.
 */
export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // React-rendered chrome only. Everything animated is drawn imperatively.
  const aspect = useAnimator((s) => s.canvas.aspect);
  const safeArea = useAnimator((s) => s.canvas.safeArea);

  const { width, height } = canvasSize(aspect);
  const scale = Math.min((box.w - PAD * 2) / width, (box.h - PAD * 2) / height) || 0;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const dirty = { current: true };
    const markDirty = () => {
      dirty.current = true;
    };

    const loader = createImageLoader(markDirty);
    // Any store change — a param, an asset, a seek, a playback tick — needs a
    // repaint; when nothing changes the loop costs one no-op call per frame.
    const unsubscribe = useAnimator.subscribe(markDirty);
    document.fonts?.ready.then(markDirty);

    const stop = onFrame(() => {
      if (!dirty.current) return;
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      dirty.current = false;

      const s = useAnimator.getState();
      const size = canvasSize(s.canvas.aspect);
      const host = containerRef.current;
      const displayScale =
        Math.min(
          ((host?.clientWidth ?? 0) - PAD * 2) / size.width,
          ((host?.clientHeight ?? 0) - PAD * 2) / size.height,
        ) || 0;

      // Draw at what the screen actually shows, capped at export resolution.
      const pixelScale = Math.min(displayScale * (window.devicePixelRatio || 1), 1);
      const bw = Math.max(1, Math.round(size.width * pixelScale));
      const bh = Math.max(1, Math.round(size.height * pixelScale));
      if (cv.width !== bw || cv.height !== bh) {
        cv.width = bw;
        cv.height = bh;
      }

      const layers = composeScene({
        template: TEMPLATES_BY_ID[s.selectedId],
        params: s.paramsByTemplate[s.selectedId],
        raw: s.time,
        duration: s.durationByTemplate[s.selectedId],
        width: size.width,
        height: size.height,
        assets: s.assets,
        text: s.text,
      });

      loader.ensure(layers.map((l) => l.src));

      ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
      drawScene(ctx, layers, size.width, size.height, s.canvas.background, loader.cache);
    });

    return () => {
      stop();
      unsubscribe();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-stage"
    >
      <div className="relative" style={{ width: width * scale, height: height * scale }}>
        <canvas
          ref={canvasRef}
          className="absolute left-0 top-0 h-full w-full"
          style={{ background: "transparent" }}
        />
        {safeArea && (
          <div
            className="pointer-events-none absolute border border-dashed border-white/30"
            style={{ inset: `${height * scale * 0.06}px ${width * scale * 0.06}px` }}
          />
        )}
      </div>
    </div>
  );
}
