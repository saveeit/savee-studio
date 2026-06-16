import React, { useLayoutEffect, useRef, useState } from "react";
import { ASPECTS, useAnimator } from "../store";
import { TEMPLATES_BY_ID } from "../templates";
import { composeScene } from "../scene";
import { DomRenderer } from "../renderers/DomRenderer";

/** Predefined export resolution for the selected aspect (always even for H.264). */
export function canvasSize(aspectId: string) {
  const a = ASPECTS.find((x) => x.id === aspectId) ?? ASPECTS[1];
  return { width: a.width, height: a.height };
}

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const aspect = useAnimator((s) => s.canvas.aspect);
  const background = useAnimator((s) => s.canvas.background);
  const safeArea = useAnimator((s) => s.canvas.safeArea);
  const time = useAnimator((s) => s.time);
  const selectedId = useAnimator((s) => s.selectedId);
  const params = useAnimator((s) => s.paramsByTemplate[s.selectedId]);
  const duration = useAnimator((s) => s.durationByTemplate[s.selectedId]);
  const assets = useAnimator((s) => s.assets);
  const text = useAnimator((s) => s.text);

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

  const { width, height } = canvasSize(aspect);
  const template = TEMPLATES_BY_ID[selectedId];
  const layers = composeScene({
    template,
    params,
    raw: time,
    duration,
    width,
    height,
    assets,
    text,
  });

  const pad = 56;
  const scale = Math.min((box.w - pad * 2) / width, (box.h - pad * 2) / height) || 0;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-stage"
    >
      <div
        className="relative"
        style={{ width: width * scale, height: height * scale }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left overflow-hidden"
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            background,
          }}
        >
          <DomRenderer layers={layers} width={width} height={height} />

          {safeArea && (
            <div
              className="pointer-events-none absolute border border-dashed border-white/30"
              style={{ inset: `${height * 0.06}px ${width * 0.06}px` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
