import React from "react";
import { ChevronDown, Maximize2, Monitor } from "lucide-react";

export function TopBar() {
  return (
    <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-separator bg-panel px-6">
      <div className="flex items-baseline gap-2">
        <span className="text-[22px] font-bold tracking-tight text-white">Savee</span>
        <span className="text-[15px] font-light text-gray-500">Animator</span>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-gray-400">
        <span className="text-gray-200">Demo mode</span>
        <span className="text-gray-700">•</span>
        <span>Sign in to save your work</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-[10px] bg-surface p-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-surface-2 text-white">
            <Monitor className="h-4 w-4" />
          </span>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-[10px] text-gray-400 transition-colors hover:bg-surface hover:text-white">
          <Maximize2 className="h-4 w-4" />
        </button>
        <button className="flex items-center gap-1 rounded-full pl-1 pr-2 transition-colors hover:bg-surface">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-[12px] font-semibold text-white">
            R
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
