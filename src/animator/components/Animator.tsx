import React from "react";
import { usePlayback } from "../usePlayback";
import { SideNav } from "./SideNav";
import { TemplatePanel } from "./TemplatePanel";
import { ControlsPanel } from "./ControlsPanel";
import { CanvasStage } from "./CanvasStage";
import { SettingsPanel } from "./SettingsPanel";
import { Timeline } from "./Timeline";

export function Animator() {
  usePlayback();
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-gray-100">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1">
          <TemplatePanel />
          <ControlsPanel />
          <CanvasStage />
          <SettingsPanel />
        </div>
        <Timeline />
      </div>
    </div>
  );
}
