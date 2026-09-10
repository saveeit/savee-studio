import React, { useEffect, useRef } from "react";
import { Pause, Play, Repeat } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAnimator } from "../store";
import { onFrame } from "../usePlayback";
import { ExportButton } from "./ExportButton";

function fmt(t: number) {
  return `${t.toFixed(1)}s`;
}

export function Timeline() {
  const playing = useAnimator((s) => s.playing);
  const loop = useAnimator((s) => s.loop);
  const duration = useAnimator((s) => s.durationByTemplate[s.selectedId]);
  const fps = useAnimator((s) => s.canvas.fps);
  const togglePlay = useAnimator((s) => s.togglePlay);
  const setLoop = useAnimator((s) => s.setLoop);
  const setTime = useAnimator((s) => s.setTime);
  const pause = useAnimator((s) => s.pause);

  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);

  const totalFrames = Math.max(1, Math.round(duration * fps));

  // The playhead moves 60×/s. Writing it straight to the DOM keeps the whole
  // timeline (and the export button under it) out of the frame loop.
  useEffect(() => {
    let lastPct = -1;
    let lastFrame = -1;
    return onFrame((time) => {
      const looped = duration > 0 ? ((time % duration) + duration) % duration : 0;
      const pct = duration > 0 ? (looped / duration) * 100 : 0;
      if (pct !== lastPct) {
        lastPct = pct;
        if (fillRef.current) fillRef.current.style.width = `${pct}%`;
        if (headRef.current) headRef.current.style.left = `${pct}%`;
        if (clockRef.current) clockRef.current.textContent = fmt(looped);
      }
      const frame = Math.min(totalFrames, Math.round(looped * fps));
      if (frame !== lastFrame) {
        lastFrame = frame;
        if (frameRef.current) frameRef.current.textContent = String(frame).padStart(4, "0");
      }
    });
  }, [duration, fps, totalFrames]);

  const seek = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    setTime(frac * duration);
  };

  const onDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    pause();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    seek(e.clientX);
  };
  const onMove = (e: React.PointerEvent) => {
    if (draggingRef.current) seek(e.clientX);
  };
  const onUp = () => {
    draggingRef.current = false;
  };

  return (
    <div className="flex h-[64px] shrink-0 items-center gap-4 border-t border-separator bg-panel px-6">
      <button
        onClick={togglePlay}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-white transition-colors hover:bg-gray-600"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>

      <button
        onClick={() => setLoop(!loop)}
        title="Loop"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors",
          loop ? "bg-brand/15 text-brand-2" : "text-gray-500 hover:bg-surface hover:text-gray-300",
        )}
      >
        <Repeat className="h-4 w-4" />
      </button>

      <div
        ref={trackRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="group relative h-9 flex-1 cursor-pointer"
      >
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-2" />
        <div
          ref={fillRef}
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-300"
          style={{ width: "0%" }}
        />
        <div
          ref={headRef}
          className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
          style={{ left: "0%" }}
        />
      </div>

      <div className="shrink-0 text-right font-mono text-[12px] leading-tight text-gray-400">
        <div className="tabular-nums text-gray-200">
          <span ref={clockRef}>{fmt(0)}</span>{" "}
          <span className="text-gray-600">/ {fmt(duration)}</span>
        </div>
        <div className="tabular-nums text-[11px] text-gray-600">
          <span ref={frameRef}>0000</span> / {String(totalFrames).padStart(4, "0")} f
        </div>
      </div>

      <ExportButton />
    </div>
  );
}
