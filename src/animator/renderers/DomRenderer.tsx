import React from "react";
import type { Layer } from "../types";

/**
 * Renders a layer list as absolutely-positioned DOM at canvas-pixel
 * coordinates. The parent scales this box to fit the viewport.
 */
export function DomRenderer({
  layers,
  width,
  height,
}: {
  layers: Layer[];
  width: number;
  height: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
      }}
    >
      {layers.map((l) => (
        <LayerView key={l.id} layer={l} />
      ))}
    </div>
  );
}

function LayerView({ layer: l }: { layer: Layer }) {
  const scale = l.scale ?? 1;
  const common: React.CSSProperties = {
    position: "absolute",
    left: l.x,
    top: l.y,
    width: l.w,
    height: l.h,
    transform: `translate(-50%, -50%) rotate(${l.rotation ?? 0}deg) scale(${scale})`,
    transformOrigin: "center",
    opacity: l.opacity ?? 1,
    zIndex: l.z ?? 0,
    willChange: "transform, opacity",
  };

  if (l.type === "text") {
    return (
      <div
        style={{
          ...common,
          display: "flex",
          alignItems: "center",
          justifyContent:
            l.align === "left" ? "flex-start" : l.align === "right" ? "flex-end" : "center",
          color: l.color ?? "#fff",
          fontFamily: l.fontFamily,
          fontSize: l.fontSize,
          fontWeight: l.fontWeight,
          fontStyle: l.italic ? "italic" : "normal",
          letterSpacing: l.letterSpacing,
          lineHeight: l.lineHeight ?? 1,
          textAlign: l.align ?? "center",
          textTransform: l.uppercase ? "uppercase" : "none",
          textShadow: l.shadow ? `0 2px ${24 * l.shadow}px rgba(0,0,0,${0.5 * l.shadow})` : undefined,
          whiteSpace: "pre-wrap",
          pointerEvents: "none",
        }}
      >
        {l.text}
      </div>
    );
  }

  const filter = buildFilter(l);
  const boxShadow = l.shadow
    ? `0 ${10 * l.shadow}px ${40 * l.shadow}px rgba(0,0,0,${0.55 * l.shadow})`
    : undefined;

  if (l.type === "rect") {
    return (
      <div
        style={{
          ...common,
          background: l.fill ?? "transparent",
          borderRadius: l.radius ?? 0,
          border: l.ring ? `${l.ring}px solid ${l.ringColor ?? "#fff"}` : undefined,
          boxShadow,
          filter,
        }}
      />
    );
  }

  // image
  return (
    <div
      style={{
        ...common,
        borderRadius: l.radius ?? 0,
        backgroundImage: l.src ? `url("${l.src}")` : undefined,
        backgroundColor: l.src ? undefined : "#17171a",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow,
        filter,
      }}
    />
  );
}

function buildFilter(l: Layer): string | undefined {
  const parts: string[] = [];
  if (l.blur) parts.push(`blur(${l.blur}px)`);
  if (l.brightness != null && l.brightness !== 1) parts.push(`brightness(${l.brightness})`);
  return parts.length ? parts.join(" ") : undefined;
}
