import React, { useRef, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { useAnimator } from "../store";
import { TEMPLATES_BY_ID } from "../templates";
import { canvasSize } from "./CanvasStage";
import { ExportCancelled, downloadBlob, exportVideo, prefetchMuxers } from "../exporter";

/** Whole seconds only, so the estimate does not flicker every frame. */
function eta(elapsedMs: number, progress: number) {
  if (progress <= 0.02) return null;
  const remaining = Math.round((elapsedMs * (1 - progress)) / progress / 1000);
  if (remaining <= 0) return "almost done";
  if (remaining < 60) return `${remaining}s left`;
  return `${Math.floor(remaining / 60)}m ${String(remaining % 60).padStart(2, "0")}s left`;
}

export function ExportButton() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = () => abortRef.current?.abort();

  const run = async () => {
    if (busy) return cancel();
    const s = useAnimator.getState();
    const template = TEMPLATES_BY_ID[s.selectedId];
    const duration = s.durationByTemplate[s.selectedId];
    const { width, height } = canvasSize(s.canvas.aspect);
    const wasPlaying = s.playing;
    s.pause();

    const controller = new AbortController();
    abortRef.current = controller;
    const startedAt = performance.now();
    setBusy(true);
    setProgress(0);
    setRemaining(null);
    setNote(null);

    try {
      const result = await exportVideo({
        template,
        params: s.paramsByTemplate[s.selectedId],
        duration,
        fps: s.canvas.fps,
        width,
        height,
        background: s.canvas.background,
        assets: s.assets,
        text: s.text,
        format: s.canvas.format,
        signal: controller.signal,
        onProgress: (p) => {
          setProgress(p);
          setRemaining(eta(performance.now() - startedAt, p));
        },
      });
      downloadBlob(result.blob, `savee-${template.id}-${Date.now()}.${result.ext}`);
      setNote(
        s.canvas.format === "mp4" && result.ext !== "mp4"
          ? "No MP4 encoder here — saved as WebM. Chrome can do MP4."
          : null,
      );
    } catch (err) {
      setNote(
        err instanceof ExportCancelled
          ? "Export cancelled."
          : `Export failed: ${(err as Error).message}`,
      );
    } finally {
      abortRef.current = null;
      setBusy(false);
      setProgress(0);
      setRemaining(null);
      if (wasPlaying) s.play();
    }
  };

  return (
    <div className="relative shrink-0">
      {note && (
        <div
          role="status"
          className="absolute bottom-full right-0 mb-2 flex w-[280px] items-start gap-2 rounded-[10px] border border-line bg-card px-3 py-2 text-[12px] leading-relaxed text-gray-200 shadow-lg"
        >
          <span className="flex-1">{note}</span>
          <button
            onClick={() => setNote(null)}
            aria-label="Dismiss"
            className="shrink-0 rounded p-0.5 text-gray-500 transition-colors hover:text-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <button
        onClick={run}
        onPointerEnter={prefetchMuxers}
        onFocus={prefetchMuxers}
        aria-label={busy ? "Cancel export" : "Export video"}
        title={busy ? "Cancel export" : undefined}
        className="group relative flex h-9 items-center gap-2 overflow-hidden rounded-[10px] bg-white px-5 text-[13px] font-semibold text-black transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {busy && (
          <span
            className="absolute inset-y-0 left-0 bg-brand/30 transition-[width] duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        )}
        <span className="relative flex items-center gap-2 tabular-nums">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin group-hover:hidden" aria-hidden />
              <X className="hidden h-4 w-4 group-hover:block" aria-hidden />
              <span className="group-hover:hidden">
                {Math.round(progress * 100)}%
                {remaining ? <span className="ml-1.5 font-normal opacity-60">{remaining}</span> : null}
              </span>
              <span className="hidden group-hover:block">Cancel</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" aria-hidden />
              Export
            </>
          )}
        </span>
      </button>
    </div>
  );
}
