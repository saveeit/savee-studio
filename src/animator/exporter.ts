import type { Asset, ParamValues, Template } from "./types";
import type { TextOverlay } from "./store";
import { composeScene } from "./scene";
import { drawScene, preloadImages } from "./renderers/canvasRenderer";

export type ExportFormat = "mp4" | "webm";

/** Thrown when the caller aborts; distinguishes a cancel from a real failure. */
export class ExportCancelled extends Error {
  constructor() {
    super("Export cancelled");
    this.name = "ExportCancelled";
  }
}

function throwIfAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) throw new ExportCancelled();
}

export interface ExportArgs {
  template: Template;
  params: ParamValues;
  duration: number;
  fps: number;
  width: number;
  height: number;
  background: string;
  assets: Asset[];
  text: TextOverlay;
  format: ExportFormat;
  onProgress?: (p: number) => void;
  signal?: AbortSignal;
}

export interface ExportResult {
  blob: Blob;
  ext: "mp4" | "webm";
  encoder: "webcodecs" | "mediarecorder";
}

const hasWebCodecs = () => typeof window !== "undefined" && "VideoEncoder" in window;

const AVC_CODECS = ["avc1.640029", "avc1.4d0028", "avc1.42001f"]; // high → main → baseline

async function pickAvcCodec(width: number, height: number, fps: number) {
  for (const codec of AVC_CODECS) {
    try {
      const { supported } = await VideoEncoder.isConfigSupported({
        codec,
        width,
        height,
        framerate: fps,
        bitrate: 12_000_000,
      });
      if (supported) return codec;
    } catch {
      /* keep trying */
    }
  }
  return null;
}

/**
 * Deterministic, frame-by-frame export via WebCodecs. Each frame is rendered to
 * an offscreen 2D canvas, wrapped in a VideoFrame, encoded, and muxed — so the
 * output is exact regardless of how fast the machine renders.
 */
async function exportWebCodecs(args: ExportArgs): Promise<ExportResult> {
  const { duration, fps, width, height, background, assets, format } = args;
  const isMp4 = format === "mp4";

  const codec = isMp4 ? await pickAvcCodec(width, height, fps) : "vp09.00.10.08";
  if (!codec) throw new Error("No supported H.264 encoder in this browser");

  const cache = await preloadImages(assets.map((a) => a.src));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");

  // Muxers are ~130 kB of source that only matter once the user exports, so the
  // one we need is pulled in here instead of at module load.
  let muxer;
  if (isMp4) {
    const Mp4 = await import("mp4-muxer");
    muxer = new Mp4.Muxer({
      target: new Mp4.ArrayBufferTarget(),
      video: { codec: "avc", width, height, frameRate: fps },
      fastStart: "in-memory",
    });
  } else {
    const Webm = await import("webm-muxer");
    muxer = new Webm.Muxer({
      target: new Webm.ArrayBufferTarget(),
      video: { codec: "V_VP9", width, height, frameRate: fps },
    });
  }

  const encoder = new VideoEncoder({
    output: (chunk, meta) =>
      (muxer as { addVideoChunk: (c: EncodedVideoChunk, m?: unknown) => void }).addVideoChunk(
        chunk,
        meta,
      ),
    error: (e) => {
      throw e;
    },
  });
  encoder.configure({ codec, width, height, framerate: fps, bitrate: 12_000_000 });

  const total = Math.max(1, Math.round(duration * fps));
  const usPerFrame = 1_000_000 / fps;
  const gop = Math.max(1, Math.round(fps * 2));

  try {
    for (let i = 0; i < total; i++) {
      throwIfAborted(args.signal);
      const raw = i / fps;
      const layers = composeScene({ ...args, raw });
      drawScene(ctx, layers, width, height, background, cache);

      const frame = new VideoFrame(canvas, {
        timestamp: Math.round(i * usPerFrame),
        duration: Math.round(usPerFrame),
      });
      encoder.encode(frame, { keyFrame: i % gop === 0 });
      frame.close();
      args.onProgress?.((i + 1) / total);

      // backpressure: don't let the encode queue run away
      if (encoder.encodeQueueSize > 8) {
        await new Promise<void>((resolve) => {
          const id = setInterval(() => {
            if (encoder.encodeQueueSize <= 4 || args.signal?.aborted) {
              clearInterval(id);
              resolve();
            }
          }, 4);
        });
      }
    }
    await encoder.flush();
  } catch (err) {
    // A half-configured encoder holds onto hardware, so let it go either way.
    try {
      encoder.close();
    } catch {
      /* already closed */
    }
    throw err;
  }
  muxer.finalize();
  const buffer = (muxer.target as { buffer: ArrayBuffer }).buffer;
  return {
    blob: new Blob([buffer], { type: isMp4 ? "video/mp4" : "video/webm" }),
    ext: isMp4 ? "mp4" : "webm",
    encoder: "webcodecs",
  };
}

export function prefetchMuxers() {
  void import("mp4-muxer");
  void import("webm-muxer");
}

function pickRecorderMime(): string {
  const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
  }
  return "video/webm";
}

/** Real-time WebM fallback for browsers without WebCodecs. */
function exportMediaRecorder(args: ExportArgs): Promise<ExportResult> {
  const { duration, fps, width, height, background, assets } = args;
  return new Promise(async (resolve, reject) => {
    try {
      const cache = await preloadImages(assets.map((a) => a.src));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("2D context unavailable"));

      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, {
        mimeType: pickRecorderMime(),
        videoBitsPerSecond: 12_000_000,
      });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = () =>
        resolve({
          blob: new Blob(chunks, { type: "video/webm" }),
          ext: "webm",
          encoder: "mediarecorder",
        });
      recorder.start();

      const start = performance.now();
      const frame = (now: number) => {
        if (args.signal?.aborted) {
          recorder.onstop = null;
          recorder.stop();
          reject(new ExportCancelled());
          return;
        }
        const raw = (now - start) / 1000;
        const layers = composeScene({ ...args, raw });
        drawScene(ctx, layers, width, height, background, cache);
        args.onProgress?.(Math.min(1, raw / duration));
        if (raw < duration) requestAnimationFrame(frame);
        else recorder.stop();
      };
      requestAnimationFrame(frame);
    } catch (err) {
      reject(err as Error);
    }
  });
}

export async function exportVideo(args: ExportArgs): Promise<ExportResult> {
  throwIfAborted(args.signal);
  if (hasWebCodecs()) {
    try {
      return await exportWebCodecs(args);
    } catch (err) {
      if (err instanceof ExportCancelled) throw err;
      // MP4 with no H.264 support → degrade to a real-time WebM rather than fail.
      if (args.format === "webm") return exportMediaRecorder(args);
      console.warn("WebCodecs export failed, falling back to WebM:", err);
      return exportMediaRecorder({ ...args, format: "webm" });
    }
  }
  return exportMediaRecorder({ ...args, format: "webm" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
