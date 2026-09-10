import React from "react";
import { Repeat, RotateCcw } from "lucide-react";
import { ColorInput, Segmented, Slider, Toggle } from "./controls";
import {
  useAnimator,
  useCurrentDuration,
  useCurrentParams,
  useCurrentTemplate,
} from "../store";
import { DURATION_MAX, DURATION_MIN, loopFit } from "../loopFit";
import { canvasSize } from "./CanvasStage";

export function ControlsPanel() {
  const template = useCurrentTemplate();
  const params = useCurrentParams();
  const duration = useCurrentDuration();
  const setParam = useAnimator((s) => s.setParam);
  const setDuration = useAnimator((s) => s.setDuration);
  const resetParams = useAnimator((s) => s.resetParams);
  const aspect = useAnimator((s) => s.canvas.aspect);

  const { width, height } = canvasSize(aspect);
  const fit = loopFit(template, params, duration, width, height);

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
            min={DURATION_MIN}
            max={DURATION_MAX}
            step={0.1}
            unit="s"
            onChange={setDuration}
          />

          {fit && !fit.seamless && (
            <div className="mt-1 rounded-[10px] border border-line bg-surface px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[12px] text-gray-200">
                <Repeat className="h-3.5 w-3.5 shrink-0 text-brand-2" aria-hidden />
                The loop cuts when it repeats
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-gray-500">
                This one only lines back up after a whole cycle, so speed × duration has to
                land on one.
              </p>
              {fit.duration == null && fit.speed == null ? (
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-gray-500">
                  Nothing within the sliders reaches it — shorten the cycle first, with fewer
                  items or a smaller thumb size.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {fit.duration != null && (
                    <button
                      onClick={() => setDuration(fit.duration!)}
                      className="rounded-[7px] bg-surface-2 px-2.5 py-1.5 font-mono text-[11.5px] text-gray-100 transition-colors hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {fit.duration}s
                    </button>
                  )}
                  {fit.speed != null && (
                    <button
                      onClick={() => setParam(fit.speedKey, fit.speed!)}
                      className="rounded-[7px] bg-surface-2 px-2.5 py-1.5 font-mono text-[11.5px] text-gray-100 transition-colors hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {fit.speed}
                      {fit.speedUnit}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
