// Builds the sidebar thumbnails from whatever is in public/assets.
//
// The list renders each asset in a 32x40 box, so handing it the full-size file
// means decoding ~4.6MB of bitmap per image to paint a few thousand pixels.
// These are generated rather than committed: a second copy of every asset in
// git is a copy that can go stale, and it did — dropping in a new image without
// remembering to make its thumbnail left a broken image in the sidebar.
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const SRC = "public/assets";
const OUT = join(SRC, "thumbs");
const LONG_SIDE = 160;
const QUALITY = 50; // a 32x40 box hides far more than this

const SOURCES = /\.(avif|webp|jpe?g|png)$/i;

const files = (await readdir(SRC, { withFileTypes: true }))
  .filter((e) => e.isFile() && SOURCES.test(e.name))
  .map((e) => e.name)
  .sort();

if (!files.length) {
  console.error(`No source images in ${SRC}`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });

let from = 0;
let to = 0;
for (const name of files) {
  const input = join(SRC, name);
  const buf = await sharp(input)
    .resize({ width: LONG_SIDE, height: LONG_SIDE, fit: "inside", withoutEnlargement: true })
    .avif({ quality: QUALITY, effort: 6 })
    .toBuffer();
  await writeFile(join(OUT, `${parse(name).name}.avif`), buf);
  from += (await stat(input)).size;
  to += buf.length;
}

const kb = (b) => `${Math.round(b / 1024)} KB`;
console.log(`thumbs: ${files.length} images, ${kb(from)} → ${kb(to)}`);
