import type { Layer } from "../types";

export type ImageCache = Map<string, HTMLImageElement>;

export async function preloadImages(srcs: string[]): Promise<ImageCache> {
  const cache: ImageCache = new Map();
  await Promise.all(
    Array.from(new Set(srcs)).map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            cache.set(src, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  );
  return cache;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Draw a full scene to a 2D context (used for export). */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  layers: Layer[],
  width: number,
  height: number,
  background: string,
  cache: ImageCache,
) {
  ctx.save();
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  for (const l of layers) {
    ctx.save();
    ctx.globalAlpha = l.opacity ?? 1;
    ctx.translate(l.x, l.y);
    if (l.rotation) ctx.rotate((l.rotation * Math.PI) / 180);
    const scale = l.scale ?? 1;
    if (scale !== 1) ctx.scale(scale, scale);

    const w = l.w;
    const h = l.h;
    const r = l.radius ?? 0;

    const filters: string[] = [];
    if (l.blur) filters.push(`blur(${l.blur}px)`);
    if (l.brightness != null && l.brightness !== 1) filters.push(`brightness(${l.brightness})`);
    if (filters.length) ctx.filter = filters.join(" ");

    if (l.type === "text") {
      ctx.filter = "none";
      ctx.fillStyle = l.color ?? "#fff";
      const weight = l.fontWeight ?? 400;
      const style = l.italic ? "italic" : "normal";
      const family = (l.fontFamily ?? "sans-serif").replace("var(--font-sans)", "Inter, sans-serif");
      ctx.font = `${style} ${weight} ${l.fontSize ?? 40}px ${family}`;
      ctx.textAlign = l.align ?? "center";
      ctx.textBaseline = "middle";
      if (l.shadow) {
        ctx.shadowColor = `rgba(0,0,0,${0.5 * l.shadow})`;
        ctx.shadowBlur = 24 * l.shadow;
        ctx.shadowOffsetY = 2;
      }
      const text = l.uppercase ? (l.text ?? "").toUpperCase() : l.text ?? "";
      const tx = l.align === "left" ? -w / 2 : l.align === "right" ? w / 2 : 0;
      // letterSpacing (supported in modern canvas)
      try {
        (ctx as unknown as { letterSpacing: string }).letterSpacing = `${l.letterSpacing ?? 0}px`;
      } catch {
        /* ignore */
      }
      ctx.fillText(text, tx, 0);
      ctx.restore();
      continue;
    }

    if (l.shadow) {
      ctx.shadowColor = `rgba(0,0,0,${0.55 * l.shadow})`;
      ctx.shadowBlur = 40 * l.shadow;
      ctx.shadowOffsetY = 10 * l.shadow;
    }

    if (l.type === "rect") {
      if (l.fill) {
        ctx.fillStyle = l.fill;
        roundRect(ctx, -w / 2, -h / 2, w, h, r);
        ctx.fill();
      }
      if (l.ring) {
        ctx.shadowColor = "transparent";
        ctx.lineWidth = l.ring;
        ctx.strokeStyle = l.ringColor ?? "#fff";
        roundRect(ctx, -w / 2, -h / 2, w, h, r);
        ctx.stroke();
      }
      ctx.restore();
      continue;
    }

    // image — cover fit into w×h, clipped to rounded rect
    const img = l.src ? cache.get(l.src) : undefined;
    roundRect(ctx, -w / 2, -h / 2, w, h, r);
    if (img && img.width && img.height) {
      ctx.save();
      ctx.clip();
      const ir = img.width / img.height;
      const tr = w / h;
      let dw = w;
      let dh = h;
      if (ir > tr) dw = h * ir;
      else dh = w / ir;
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = "#17171a";
      ctx.fill();
    }
    ctx.restore();
  }
}
