import React from "react";
import { ChevronDown, PanelLeft, PanelRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAnimator } from "../store";

export function TopBar() {
  const panels = useAnimator((s) => s.panels);
  const togglePanel = useAnimator((s) => s.togglePanel);

  return (
    <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-separator bg-panel px-4 xl:px-6">
      <div className="flex items-center gap-3">
        <PanelToggle
          side="templates"
          open={panels.templates}
          onToggle={() => togglePanel("templates")}
        />
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] font-bold tracking-tight text-white">Savee</span>
          <span className="hidden text-[15px] font-light text-gray-500 sm:inline">Animator</span>
        </div>
      </div>

      <div className="hidden items-center gap-2 text-[13px] text-gray-400 lg:flex">
        <span className="text-gray-200">Demo mode</span>
        <span className="text-gray-700">•</span>
        <span>Sign in to save your work</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1 rounded-full pl-1 pr-2 transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Account"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-[12px] font-semibold text-white">
            R
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" aria-hidden />
        </button>
        <PanelToggle
          side="settings"
          open={panels.settings}
          onToggle={() => togglePanel("settings")}
        />
      </div>
    </div>
  );
}

function PanelToggle({
  side,
  open,
  onToggle,
}: {
  side: "templates" | "settings";
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = side === "templates" ? PanelLeft : PanelRight;
  const label = side === "templates" ? "Templates panel" : "Settings panel";
  return (
    <button
      onClick={onToggle}
      aria-pressed={open}
      aria-label={`${open ? "Hide" : "Show"} ${label}`}
      title={`${open ? "Hide" : "Show"} ${label}`}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-[10px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        open ? "bg-surface text-white" : "text-gray-500 hover:bg-surface hover:text-gray-300",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
