import React from "react";

/**
 * Static shell painted while the animator chunk downloads. Mirrors the real
 * layout so the first paint does not shift when the app mounts.
 */
export function AnimatorSkeleton() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-gray-100">
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-separator bg-panel px-6">
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] font-bold tracking-tight text-white">Savee</span>
          <span className="text-[15px] font-light text-gray-500">Animator</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="h-full w-[272px] shrink-0 border-r border-separator bg-panel" />
        <div className="h-full w-[296px] shrink-0 border-r border-separator bg-panel" />
        <div className="flex h-full w-full items-center justify-center bg-stage">
          <div className="h-[60%] w-[26%] rounded-[4px] bg-surface/40" />
        </div>
        <div className="h-full w-[320px] shrink-0 border-l border-separator bg-panel" />
      </div>

      <div className="h-[64px] shrink-0 border-t border-separator bg-panel" />
    </div>
  );
}
