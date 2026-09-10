import { useEffect } from "react";
import { useAnimator } from "./store";

type FrameListener = (time: number) => void;

const frameListeners = new Set<FrameListener>();

/**
 * Subscribe to the playback loop. Consumers that need per-frame updates (the
 * preview, the timeline playhead) use this instead of subscribing to `time` in
 * React, so a frame costs no render.
 */
export function onFrame(fn: FrameListener) {
  frameListeners.add(fn);
  return () => {
    frameListeners.delete(fn);
  };
}

/**
 * Single rAF loop that advances the playhead while `playing`. Reads/writes the
 * store imperatively to avoid re-subscribing every frame.
 */
export function usePlayback() {
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const s = useAnimator.getState();
      if (s.playing) {
        const duration = s.durationByTemplate[s.selectedId] ?? 8;
        let next = s.time + dt;
        if (next >= duration) {
          next = s.loop ? next % duration : duration;
          if (!s.loop && next >= duration) s.pause();
        }
        s.setTime(next);
      }
      for (const fn of frameListeners) fn(useAnimator.getState().time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}
