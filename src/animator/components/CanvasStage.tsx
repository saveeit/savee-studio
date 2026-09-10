import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ASPECTS, useAnimator } from "../store";
import { TEMPLATES_BY_ID } from "../templates";
import { composeScene } from "../scene";
import { DomRenderer } from "../renderers/DomRenderer";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type TextPart = "headline" | "subhead";

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
  const setTextOffset = useAnimator((s) => s.setTextOffset);

  const [dragPart, setDragPart] = useState<TextPart | null>(null);
  const dragRef = useRef<{
    part: TextPart;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

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

        {/* Drag handles over the text layers (screen-space, above the scaled stage). */}
        {scale > 0 &&
          layers
            .filter((l) => l.type === "text")
            .map((l) => {
              const part: TextPart = l.id === "text-headline" ? "headline" : "subhead";
              return (
                <div
                  key={l.id}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    dragRef.current = {
                      part,
                      startX: e.clientX,
                      startY: e.clientY,
                      originX: l.x,
                      originY: l.y,
                    };
                    setDragPart(part);
                  }}
                  onPointerMove={(e) => {
                    const d = dragRef.current;
                    if (!d || d.part !== part) return;
                    setTextOffset(part, {
                      x: clamp01((d.originX + (e.clientX - d.startX) / scale) / width),
                      y: clamp01((d.originY + (e.clientY - d.startY) / scale) / height),
                    });
                  }}
                  onPointerUp={() => {
                    dragRef.current = null;
                    setDragPart(null);
                  }}
                  onPointerCancel={() => {
                    dragRef.current = null;
                    setDragPart(null);
                  }}
                  className={cn(
                    "absolute cursor-move touch-none rounded-[4px] border",
                    dragPart === part
                      ? "border-accent"
                      : "border-transparent hover:border-accent/60",
                  )}
                  style={{
                    left: (l.x - l.w / 2) * scale,
                    top: (l.y - l.h / 2) * scale,
                    width: l.w * scale,
                    height: l.h * scale,
                    zIndex: 600,
                  }}
                />
              );
            })}
      </div>
    </div>
  );
}
