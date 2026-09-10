import React, { useEffect } from "react";
import { usePlayback } from "../usePlayback";
import { useAnimator } from "../store";
import { SaveeWordmark } from "./railIcons";
import { TemplateDropdown } from "./TemplateDropdown";
import { ControlsPanel } from "./ControlsPanel";
import { CanvasStage } from "./CanvasStage";
import { SettingsPanel } from "./SettingsPanel";
import { Timeline } from "./Timeline";

const FLOATING_PANEL =
  "z-20 flex flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl";

/** Space toggles playback anywhere outside a text input. */
function useSpacebarPlayback() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable=true]")) return;
      e.preventDefault();
      useAnimator.getState().togglePlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/**
 * Floating-panel shell: the stage runs full-bleed underneath, and the
 * chrome floats above it — brand + template + controls on the left,
 * canvas/text/asset settings on the right, transport along the bottom.
 */
export function Animator() {
  usePlayback();
  useSpacebarPlayback();
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-stage text-gray-100">
      {/* Stage between the panels, above the timeline */}
      <div className="absolute inset-y-0 left-[316px] right-[336px] pb-[72px]">
        <CanvasStage />
      </div>

      {/* Left: brand, template picker, template controls */}
      <div className={`absolute bottom-4 left-4 top-4 w-[300px] ${FLOATING_PANEL}`}>
        <div className="flex items-center justify-between px-6 pb-1 pt-5">
          <SaveeWordmark className="h-[17px] w-auto text-white" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500">
            Motion
          </span>
        </div>
        <div className="px-6 pb-4 pt-3">
          <TemplateDropdown />
        </div>
        <ControlsPanel />
      </div>

      {/* Right: canvas / background / text / assets */}
      <div className={`absolute bottom-4 right-4 top-4 w-[320px] ${FLOATING_PANEL}`}>
        <SettingsPanel />
      </div>

      {/* Bottom: floating transport */}
      <div className="absolute bottom-4 left-[332px] right-[352px] z-20">
        <Timeline />
      </div>
    </div>
  );
}
