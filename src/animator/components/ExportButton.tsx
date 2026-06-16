import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useAnimator } from "../store";
import { TEMPLATES_BY_ID } from "../templates";
import { canvasSize } from "./CanvasStage";
import { downloadBlob, exportVideo } from "../exporter";

export function ExportButton() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const run = async () => {
    if (busy) return;
    const s = useAnimator.getState();
    const template = TEMPLATES_BY_ID[s.selectedId];
    const duration = s.durationByTemplate[s.selectedId];
    const { width, height } = canvasSize(s.canvas.aspect);
    const wasPlaying = s.playing;
    s.pause();
    setBusy(true);
    setProgress(0);
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
        onProgress: setProgress,
      });
      downloadBlob(result.blob, `savee-${template.id}-${Date.now()}.${result.ext}`);
      if (s.canvas.format === "mp4" && result.ext !== "mp4") {
        alert("This browser can't encode MP4 — exported WebM instead. Try Chrome for MP4.");
      }
    } catch (err) {
      console.error(err);
      alert("Export failed: " + (err as Error).message);
    } finally {
      setBusy(false);
      setProgress(0);
      if (wasPlaying) s.play();
    }
  };

  return (
    <button
      onClick={run}
      disabled={busy}
      className="relative flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-[10px] bg-white px-5 text-[13px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-80"
    >
      {busy && (
        <span
          className="absolute inset-y-0 left-0 bg-brand/30"
          style={{ width: `${progress * 100}%` }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {Math.round(progress * 100)}%
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export
          </>
        )}
      </span>
    </button>
  );
}
