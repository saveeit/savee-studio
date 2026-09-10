import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { TEMPLATES } from "../templates";
import { useAnimator, useCurrentTemplate } from "../store";

/**
 * Template picker as a compact dropdown — templates stay out of the way
 * until you ask for them (the panel real estate goes to the controls).
 */
export function TemplateDropdown() {
  const template = useCurrentTemplate();
  const selectTemplate = useAnimator((s) => s.selectTemplate);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <div className="mb-2 text-[13px] text-muted">Template</div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-[10px] border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:border-gray-600"
      >
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-medium text-white">
            {template.name}
          </span>
          <span className="block truncate text-[11px] text-gray-500">{template.blurb}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-gray-500 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-line bg-card shadow-2xl">
          <div className="scroll-thin max-h-[320px] overflow-y-auto p-1.5">
            {TEMPLATES.map((t) => {
              const active = t.id === template.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    selectTemplate(t.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-[8px] px-3 py-2 text-left transition-colors",
                    active ? "bg-surface" : "hover:bg-surface/60",
                  )}
                >
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-[13px] font-medium",
                        active ? "text-white" : "text-gray-200",
                      )}
                    >
                      {t.name}
                    </span>
                    <span className="block truncate text-[11px] text-gray-500">{t.blurb}</span>
                  </span>
                  {active && <Check className="h-4 w-4 shrink-0 text-gray-300" />}
                </button>
              );
            })}
          </div>
          <div className="border-t border-line p-1.5">
            <button className="w-full rounded-[8px] px-3 py-2 text-left text-[13px] font-medium text-gray-300 transition-colors hover:bg-surface hover:text-white">
              Save as custom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
