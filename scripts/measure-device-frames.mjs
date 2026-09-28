/**
 * Measures where the screen sits in each device image and writes src/data/deviceFrames.ts.
 *
 *   node scripts/measure-device-frames.mjs
 *
 * Reads public/devices/laptop.png, tablet.png, and phone.png. Each must be a front-facing PNG with
 * a transparent background AND a transparent (cut-out) screen: the screen is found as the largest
 * see-through area enclosed by the device. Swap in any device images and re-run; no dependencies.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES = { desktop: "laptop.png", tablet: "tablet.png", mobile: "phone.png" };
// Pixels with less alpha than this count as see-through.
const SEE_THROUGH = 24;

/** Decodes an 8-bit, non-interlaced PNG into its size and per-pixel alpha. */
function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let width, height, depth, colorType, interlace, transparency;
  const data = [];
  for (let pos = 8; pos < buffer.length;) {
    const length = buffer.readUInt32BE(pos);
    const type = buffer.toString("latin1", pos + 4, pos + 8);
    const chunk = buffer.subarray(pos + 8, pos + 8 + length);
    if (type === "IHDR") {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      [depth, colorType] = [chunk[8], chunk[9]];
      interlace = chunk[12];
    } else if (type === "tRNS") transparency = chunk;
    else if (type === "IDAT") data.push(chunk);
    else if (type === "IEND") break;
    pos += 12 + length;
  }
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (depth !== 8 || interlace !== 0 || !channels) {
    throw new Error("only 8-bit, non-interlaced PNGs are supported; re-export the image");
  }

  // Undo the per-row filters.
  const raw = inflateSync(Buffer.concat(data));
  const stride = width * channels;
  const pixels = Buffer.alloc(stride * height);
  let previous = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const row = pixels.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? row[i - channels] : 0;
      const b = previous[i];
      const c = i >= channels ? previous[i - channels] : 0;
      let predictor = 0;
      if (filter === 1) predictor = a;
      else if (filter === 2) predictor = b;
      else if (filter === 3) predictor = (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)];
        predictor = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      row[i] = (line[i] + predictor) & 0xff;
    }
    previous = row;
  }

  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < alpha.length; i++) {
    if (colorType === 6) alpha[i] = pixels[i * 4 + 3];
    else if (colorType === 4) alpha[i] = pixels[i * 2 + 1];
    else if (colorType === 3) alpha[i] = transparency?.[pixels[i]] ?? 255;
    else alpha[i] = 255;
  }
  return { width, height, alpha };
}

/** The screen: the largest see-through region that doesn't touch the image edge. */
function findScreen({ width, height, alpha }) {
  const clear = (i) => alpha[i] < SEE_THROUGH;
  const region = new Int32Array(width * height); // 0 unvisited, -1 outside, n = hole n
  const queue = new Int32Array(width * height);

  const fill = (starts, label) => {
    let head = 0;
    let tail = 0;
    for (const i of starts) {
      if (clear(i) && region[i] === 0) {
        region[i] = label;
        queue[tail++] = i;
      }
    }
    const box = { minX: width, minY: height, maxX: 0, maxY: 0, count: 0 };
    while (head < tail) {
      const i = queue[head++];
      const x = i % width;
      const y = (i - x) / width;
      box.count++;
      box.minX = Math.min(box.minX, x);
      box.maxX = Math.max(box.maxX, x);
      box.minY = Math.min(box.minY, y);
      box.maxY = Math.max(box.maxY, y);
      for (const n of [
        x > 0 && i - 1,
        x < width - 1 && i + 1,
        y > 0 && i - width,
        y < height - 1 && i + width,
      ]) {
        if (n !== false && region[n] === 0 && clear(n)) {
          region[n] = label;
          queue[tail++] = n;
        }
      }
    }
    return box;
  };

  const edges = [];
  for (let x = 0; x < width; x++) edges.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) edges.push(y * width, y * width + width - 1);
  fill(edges, -1);

  let best = null;
  let label = 0;
  for (let i = 0; i < region.length; i++) {
    if (region[i] !== 0 || !clear(i)) continue;
    const box = fill([i], ++label);
    if (!best || box.count > best.count) best = { ...box, label };
  }
  if (!best) throw new Error("no transparent screen found; cut the screen out of the image");

  // Corner radius from how far the corner's curve reaches along the diagonal.
  let inset = 0;
  while (region[(best.minY + inset) * width + best.minX + inset] !== best.label) inset++;
  const radius = inset / (1 - Math.SQRT1_2);

  const pct = (value, of) => Math.round((value / of) * 100000) / 1000;
  return {
    top: pct(best.minY, height),
    left: pct(best.minX, width),
    width: pct(best.maxX - best.minX + 1, width),
    height: pct(best.maxY - best.minY + 1, height),
    radius: pct(radius, width),
  };
}

const frames = {};
for (const [device, file] of Object.entries(IMAGES)) {
  const image = decodePng(readFileSync(path.join(ROOT, "public", "devices", file)));
  frames[device] = {
    src: `/devices/${file}`,
    naturalWidth: image.width,
    naturalHeight: image.height,
    screen: findScreen(image),
  };
  console.log(`${file}  ${image.width} × ${image.height}  screen`, frames[device].screen);
}

const output = `// Generated by scripts/measure-device-frames.mjs from the images in public/devices/.
// Re-run it after replacing an image; hand edits are overwritten.
import type { Device } from "@/lib/projects";

export type DeviceFrame = {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  /** The screen's box as % of the image; radius is % of the image width. */
  screen: { top: number; left: number; width: number; height: number; radius: number };
};

export const DEVICE_FRAMES: Record<Device, DeviceFrame> = ${JSON.stringify(frames, null, 2)};
`;
writeFileSync(path.join(ROOT, "src", "data", "deviceFrames.ts"), output);
console.log("wrote src/data/deviceFrames.ts");
