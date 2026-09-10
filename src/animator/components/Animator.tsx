import React from "react";
import { usePlayback } from "../usePlayback";
import { TopBar } from "./TopBar";
import { TemplatePanel } from "./TemplatePanel";
import { ControlsPanel } from "./ControlsPanel";
import { CanvasStage } from "./CanvasStage";
import { SettingsPanel } from "./SettingsPanel";
import { Timeline } from "./Timeline";

export function Animator() {
  usePlayback();
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-gray-100">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <TemplatePanel />
        <ControlsPanel />
        <CanvasStage />
        <SettingsPanel />
      </div>
      <Timeline />
    </div>
  );
}
