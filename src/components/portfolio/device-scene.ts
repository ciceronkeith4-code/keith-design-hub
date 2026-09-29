import { DEVICE_FRAMES } from "@/data/deviceFrames";
import type { Device } from "@/data/projects";

/**
 * Lays out a project's devices as one scene, in scene units (1 unit = 1px at scale 1).
 *
 * Sizes keep true relative scale: the tablet's screen is 72% of the monitor screen's width and the
 * phone stands 45% of the tablet's height. The hero device is in front; the others sit behind it
 * to the sides, raised slightly and smaller, as if further back. Each is slid as close as it can
 * go while the hero covers no more than COVERAGE of its screen.
 */

export type SceneDevice = {
  device: Device;
  x: number;
  y: number;
  width: number;
  height: number;
  hero: boolean;
};

export type Scene = {
  width: number;
  height: number;
  /** y of the floor line the devices stand on. */
  floor: number;
  devices: SceneDevice[];
};

/** Width of the desktop monitor image at true scale; everything else is sized from it. */
const DESKTOP_WIDTH = 640;
/** How much of a background screen the hero may cover (the hard limit is 15%). */
const COVERAGE = 0.08;
/** Background devices are drawn at most this size, relative to true scale. */
const MAX_DEPTH = 0.82;
/** ...and small enough that the hero stays the tallest device. */
const HERO_LEAD = 0.8;
/** Background devices stand a little higher, further back on the floor (fraction of hero height). */
const RAISE = 0.03;
/** Room under the floor line for the shared shadow (fraction of hero height). */
const SHADOW_ROOM = 0.07;

const heightAt = (device: Device, width: number) =>
  (width * DEVICE_FRAMES[device].naturalHeight) / DEVICE_FRAMES[device].naturalWidth;

/** Each device's image width at true relative scale. */
function trueWidths(): Record<Device, number> {
  const { desktop, tablet, mobile } = DEVICE_FRAMES;
  const desktopScreen = (DESKTOP_WIDTH * desktop.screen.width) / 100;
  const tabletWidth = (0.72 * desktopScreen) / (tablet.screen.width / 100);
  const phoneHeight = 0.45 * heightAt("tablet", tabletWidth);
  return {
    desktop: DESKTOP_WIDTH,
    tablet: tabletWidth,
    mobile: (phoneHeight * mobile.naturalWidth) / mobile.naturalHeight,
  };
}

/** The screen's rectangle within a placed device, in scene units. */
export function screenRect(d: SceneDevice) {
  const s = DEVICE_FRAMES[d.device].screen;
  return {
    x: d.x + (d.width * s.left) / 100,
    y: d.y + (d.height * s.top) / 100,
    width: (d.width * s.width) / 100,
    height: (d.height * s.height) / 100,
  };
}

/** Share of `back`'s screen hidden behind `front` (its whole image box, to be safe). */
export function coverage(back: SceneDevice, front: SceneDevice) {
  const s = screenRect(back);
  const w = Math.min(s.x + s.width, front.x + front.width) - Math.max(s.x, front.x);
  const h = Math.min(s.y + s.height, front.y + front.height) - Math.max(s.y, front.y);
  return w > 0 && h > 0 ? (w * h) / (s.width * s.height) : 0;
}

export function layoutScene(devices: Device[], heroDevice: Device): Scene {
  const base = trueWidths();
  const hero = devices.includes(heroDevice) ? heroDevice : devices[0];
  // Tallest first: it takes the left side, the next one the right.
  const others = devices
    .filter((d) => d !== hero)
    .sort((a, b) => heightAt(b, base[b]) - heightAt(a, base[a]));

  const heroHeight = heightAt(hero, base[hero]);
  const depth = others.length
    ? Math.min(MAX_DEPTH, (HERO_LEAD * heroHeight) / heightAt(others[0], base[others[0]]))
    : 1;

  const front: SceneDevice = {
    device: hero,
    x: 0,
    y: -heroHeight,
    width: base[hero],
    height: heroHeight,
    hero: true,
  };
  const placed: SceneDevice[] = [];

  others.forEach((device, i) => {
    const width = base[device] * depth;
    const height = heightAt(device, width);
    const back: SceneDevice = {
      device,
      x: 0,
      y: -heroHeight * RAISE - height,
      width,
      height,
      hero: false,
    };
    const left = others.length === 2 ? i === 0 : heightAt(device, base[device]) > heroHeight;
    // Binary search for the closest spot where the hero covers at most COVERAGE of this screen.
    let [near, far] = left ? [front.x, front.x - width] : [front.x, front.x + front.width];
    for (let step = 0; step < 40; step++) {
      const mid = (near + far) / 2;
      if (coverage({ ...back, x: mid }, front) > COVERAGE) near = mid;
      else far = mid;
    }
    placed.push({ ...back, x: far });
  });

  // Two background devices must not overlap each other behind a narrow hero.
  if (placed.length === 2) {
    const [left, right] = placed;
    const gap = left.x + left.width - right.x;
    if (gap > 0) right.x += gap;
  }

  // Background first so the hero draws on top.
  const all = [...placed, front];
  const minX = Math.min(...all.map((d) => d.x));
  const maxX = Math.max(...all.map((d) => d.x + d.width));
  const minY = Math.min(...all.map((d) => d.y));
  return {
    width: maxX - minX,
    height: -minY + heroHeight * SHADOW_ROOM,
    floor: -minY,
    devices: all.map((d) => ({ ...d, x: d.x - minX, y: d.y - minY })),
  };
}
