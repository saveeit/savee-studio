import React, { useEffect } from "react";
import { usePlayback } from "../usePlayback";
import { useAnimator } from "../store";
import { TopBar } from "./TopBar";
import { TemplatePanel } from "./TemplatePanel";
import { ControlsPanel } from "./ControlsPanel";
import { CanvasStage } from "./CanvasStage";
import { SettingsPanel } from "./SettingsPanel";
import { Timeline } from "./Timeline";

/**
 * Panels are fixed-width, so on a narrow window they crowd the stage out. Below
 * these widths they start closed; the user's own toggling wins from then on.
 */
const HIDE_SETTINGS_BELOW = 1180;
const HIDE_TEMPLATES_BELOW = 1000;

function useAutoCollapse() {
  const setPanels = useAnimator((s) => s.setPanels);
  useEffect(() => {
    const apply = () => {
      // Once the user has taken a side, width stops overruling them.
      if (useAnimator.getState().panelsTouched) return;
      setPanels({
        templates: window.innerWidth >= HIDE_TEMPLATES_BELOW,
        settings: window.innerWidth >= HIDE_SETTINGS_BELOW,
      });
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [setPanels]);
}

export function Animator() {
  usePlayback();
  useAutoCollapse();
  const panels = useAnimator((s) => s.panels);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-gray-100">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        {panels.templates && <TemplatePanel />}
        <ControlsPanel />
        <CanvasStage />
        {panels.settings && <SettingsPanel />}
      </div>
      <Timeline />
    </div>
  );
}
