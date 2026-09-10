import React from "react";
import {
  Heart,
  LayoutGrid,
  Menu,
  MousePointer2,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

/** Savee "S" logomark (extracted from the savee.com wordmark). */
function SaveeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 17 21.5" fill="currentColor" className={className} aria-label="Savee">
      <path d="M8.74195 20.6964C3.86646 20.6964.870349 18.0544.679688 13.9143H3.81198C3.97541 16.6108 6.07268 18.1634 8.85089 18.1634 11.4657 18.1634 13.1816 17.0739 13.1816 15.1128 13.1816 13.4785 11.9015 12.6886 9.72249 12.2256L6.67191 11.5719C3.73027 10.9455 1.36062 9.2295 1.36062 6.26063 1.36062 3.01938 4.38397.731445 8.55128.731445 13.0182.731445 15.7147 3.12833 15.9326 6.7509H12.8003C12.6914 4.73534 11.1661 3.26452 8.44233 3.26452 6.1544 3.26452 4.43844 4.32678 4.43844 5.98825 4.43844 7.54078 5.63689 8.30343 7.70693 8.73923L11.0026 9.4474C13.9988 10.0739 16.2867 11.7353 16.2867 14.7859 16.2867 18.1361 13.5357 20.6964 8.74195 20.6964z" />
    </svg>
  );
}

function RailButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-[12px] text-gray-400 transition-colors hover:bg-surface hover:text-white"
    >
      {children}
    </button>
  );
}

/** Vertical icon rail mirroring the Savee desktop side nav. */
export function SideNav() {
  return (
    <div className="flex h-full w-[64px] shrink-0 flex-col items-center justify-between border-r border-separator bg-panel py-5">
      <SaveeMark className="h-[22px] w-auto text-white" />

      <div className="flex flex-col items-center gap-1.5">
        <RailButton label="Search">
          <Search className="h-5 w-5" />
        </RailButton>
        <RailButton label="Create">
          <Plus className="h-5 w-5" />
        </RailButton>
        <RailButton label="Saves">
          <Heart className="h-5 w-5" />
        </RailButton>
        <RailButton label="Boards">
          <LayoutGrid className="h-5 w-5" />
        </RailButton>
        <button
          aria-label="Account"
          title="Account"
          className="mt-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-[12px] font-semibold text-white"
        >
          R
        </button>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <RailButton label="Cursor">
          <MousePointer2 className="h-5 w-5" />
        </RailButton>
        <RailButton label="Settings">
          <SlidersHorizontal className="h-5 w-5" />
        </RailButton>
        <RailButton label="Menu">
          <Menu className="h-5 w-5" />
        </RailButton>
      </div>
    </div>
  );
}
