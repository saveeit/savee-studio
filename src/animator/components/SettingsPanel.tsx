import React, { useRef, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Upload, X } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import { ASPECTS, useAnimator } from "../store";
import { ColorInput, Segmented, Slider, TextField, Toggle } from "./controls";
import { FONTS, fontById } from "../fonts";
import type { Asset } from "../types";

const FONT_CATEGORIES = ["Sans Serif", "Display", "Serif"] as const;

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 pb-3 pt-5 text-[15px] font-medium text-white"
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  );
}

function SortableAsset({
  asset,
  index,
  onRemove,
}: {
  asset: Asset;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: asset.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 rounded-[10px] bg-panel p-1.5 hover:bg-surface"
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none text-gray-600 hover:text-gray-300 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-4 text-right text-[12px] tabular-nums text-gray-600">{index + 1}</span>
      <img
        src={asset.src}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-10 w-8 shrink-0 rounded-[6px] object-cover ring-1 ring-white/10"
      />
      <span className="min-w-0 flex-1 truncate text-[13px] text-gray-200">{asset.name}</span>
      <button
        onClick={onRemove}
        className="shrink-0 rounded p-1 text-gray-500 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
        title="Remove"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

let uploadSeq = 0;

/**
 * Each section subscribes only to the store slice it renders. Keeping them as
 * separate components means editing text or canvas settings does not re-render
 * the asset list (and its per-row `useSortable` hooks).
 */
function CanvasSection() {
  const aspect = useAnimator((s) => s.canvas.aspect);
  const safeArea = useAnimator((s) => s.canvas.safeArea);
  const setCanvas = useAnimator((s) => s.setCanvas);

  return (
    <Section title="Canvas">
      <div className="mb-2 text-[13px] text-muted">Aspect</div>
      <div className="grid grid-cols-5 gap-1 rounded-[10px] bg-surface p-1">
        {ASPECTS.map((a) => (
          <div key={a.id} className="group relative">
            <button
              onClick={() => setCanvas({ aspect: a.id })}
              className={cn(
                "w-full rounded-[7px] py-2 text-[12px] font-medium transition-colors",
                aspect === a.id
                  ? "bg-surface-2 text-white"
                  : "text-gray-400 hover:text-gray-200",
              )}
            >
              {a.id}
            </button>
            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-card px-2 py-1 font-mono text-[11px] text-gray-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {a.width} × {a.height}
            </span>
          </div>
        ))}
      </div>
      <Toggle label="Safe Area" value={safeArea} onChange={(v) => setCanvas({ safeArea: v })} />
    </Section>
  );
}

function BackgroundSection() {
  const background = useAnimator((s) => s.canvas.background);
  const setCanvas = useAnimator((s) => s.setCanvas);
  return (
    <Section title="Background">
      <ColorInput
        label="Color"
        value={background}
        onChange={(v) => setCanvas({ background: v })}
      />
    </Section>
  );
}

function TextSection() {
  const text = useAnimator((s) => s.text);
  const setText = useAnimator((s) => s.setText);
  const clearTextOffsets = useAnimator((s) => s.clearTextOffsets);
  return (
    <Section title="Text">
      <Toggle label="Show Text" value={text.show} onChange={(v) => setText({ show: v })} />
      <TextField
        label="Headline"
        value={text.headline}
        placeholder="Headline"
        onChange={(v) => setText({ headline: v })}
      />
      <TextField
        label="Subhead"
        value={text.subhead}
        placeholder="Subhead"
        onChange={(v) => setText({ subhead: v })}
      />
      <div className="py-3">
        <div className="mb-2.5 text-[13px] text-muted">Typeface</div>
        <div className="relative">
          <select
            value={text.font}
            onChange={(e) => setText({ font: e.target.value })}
            style={{ fontFamily: fontById(text.font).family }}
            className="w-full appearance-none rounded-[10px] border border-line bg-surface px-3 py-2.5 text-[13px] text-white outline-none transition-colors hover:border-gray-600"
          >
            {FONT_CATEGORIES.map((cat) => (
              <optgroup key={cat} label={cat}>
                {FONTS.filter((f) => f.category === cat).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      <Segmented
        label="Position"
        value={text.position}
        options={[
          { label: "Top", value: "top" },
          { label: "Center", value: "center" },
          { label: "Bottom", value: "bottom" },
          { label: "Split", value: "split" },
        ]}
        onChange={(v) => setText({ position: v as never })}
      />
      {(text.offsets.headline || text.offsets.subhead) && (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-muted">Custom placement</span>
          <button
            onClick={clearTextOffsets}
            className="text-[12px] font-medium text-gray-400 transition-colors hover:text-white"
          >
            Reset
          </button>
        </div>
      )}
      <ColorInput label="Color" value={text.color} onChange={(v) => setText({ color: v })} />
      <Slider
        label="Size"
        value={text.size}
        min={3}
        max={18}
        step={0.5}
        unit="%"
        onChange={(v) => setText({ size: v })}
      />
    </Section>
  );
}

function AssetsSection() {
  const assets = useAnimator((s) => s.assets);
  const addAssets = useAnimator((s) => s.addAssets);
  const removeAsset = useAnimator((s) => s.removeAsset);
  const clearAssets = useAnimator((s) => s.clearAssets);
  const reorderAssets = useAnimator((s) => s.reorderAssets);

  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) reorderAssets(String(active.id), String(over.id));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!picked.length) return;

    const next: Asset[] = picked.map((f) => ({
      id: `up-${uploadSeq++}-${f.name}`,
      name: f.name.replace(/\.[^.]+$/, ""),
      src: URL.createObjectURL(f),
    }));
    addAssets(next);
  };

  return (
    <Section title="Assets">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mb-4 flex cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed py-6 text-center transition-colors",
          dragOver ? "border-brand bg-brand/10" : "border-line hover:border-gray-600",
        )}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="mb-2 h-4 w-4 text-gray-400" />
        <div className="text-[13px] text-gray-200">Drop images or click to upload</div>
        <div className="text-[12px] text-gray-500">from your computer</div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[12px] text-muted">{assets.length} Assets · drag to reorder</span>
        {assets.length > 0 && (
          <button onClick={clearAssets} className="text-[12px] text-gray-500 hover:text-danger">
            Clear all
          </button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={assets.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-0.5">
            {assets.map((a, i) => (
              <SortableAsset
                key={a.id}
                asset={a}
                index={i}
                onRemove={() => removeAsset(a.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {assets.length === 0 && (
        <div className="flex items-center justify-center gap-1.5 rounded-[10px] border border-line py-4 text-[12px] text-gray-500">
          <Plus className="h-3.5 w-3.5" /> Add your inspo to begin
        </div>
      )}
    </Section>
  );
}

export function SettingsPanel() {
  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col border-l border-separator bg-panel">
      <div className="scroll-thin flex-1 overflow-y-auto">
        <CanvasSection />
        <BackgroundSection />
        <TextSection />
        <AssetsSection />
      </div>
    </div>
  );
}
