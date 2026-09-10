import React from "react";
import { RotateCcw } from "lucide-react";
import { ColorInput, Segmented, Slider, Toggle } from "./controls";
import {
  useAnimator,
  useCurrentDuration,
  useCurrentParams,
  useCurrentTemplate,
} from "../store";

export function ControlsPanel() {
  const template = useCurrentTemplate();
  const params = useCurrentParams();
  const duration = useCurrentDuration();
  const setParam = useAnimator((s) => s.setParam);
  const setDuration = useAnimator((s) => s.setDuration);
  const resetParams = useAnimator((s) => s.resetParams);

  return (
    <div className="flex h-full w-[248px] shrink-0 flex-col border-r border-separator bg-panel xl:w-[296px]">
      <div className="px-4 pb-3 pt-6 xl:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-white">Customize</h2>
          <button
            onClick={resetParams}
            aria-label="Reset controls to defaults"
            title="Reset to defaults"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-gray-400 transition-colors hover:bg-surface hover:text-gray-200"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
        <div className="mt-0.5 text-[13px] text-muted">
          {template.name} <span className="text-gray-600">·</span> {template.group}
        </div>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-4 pb-8 xl:px-6">
        {template.params.map((p) => {
          switch (p.type) {
            case "slider":
              return (
                <Slider
                  key={p.key}
                  label={p.label}
                  value={params[p.key] as number}
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  unit={p.unit}
                  format={p.format}
                  onChange={(v) => setParam(p.key, v)}
                />
              );
            case "segmented":
              return (
                <Segmented
                  key={p.key}
                  label={p.label}
                  value={params[p.key] as string | number}
                  options={p.options}
                  onChange={(v) => setParam(p.key, v)}
                />
              );
            case "toggle":
              return (
                <Toggle
                  key={p.key}
                  label={p.label}
                  value={params[p.key] as boolean}
                  onChange={(v) => setParam(p.key, v)}
                />
              );
            case "color":
              return (
                <ColorInput
                  key={p.key}
                  label={p.label}
                  value={params[p.key] as string}
                  onChange={(v) => setParam(p.key, v)}
                />
              );
            default:
              return null;
          }
        })}

        <div className="mt-3 border-t border-line pt-2">
          <Slider
            label="Duration"
            value={duration}
            min={2}
            max={30}
            step={0.1}
            unit="s"
            onChange={setDuration}
          />
        </div>
      </div>
    </div>
  );
}
