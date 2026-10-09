/**
 * Theme switch as a pixel wipe: square pixels in the new theme's background color pop in as a wave
 * spreading from the toggle, the theme flips while the screen is covered, then the pixels break apart in
 * the same wave to reveal it. Drawn on one canvas over the page; clicks pass through.
 */

// The page background of each theme (--background in styles.css).
const BACKGROUND = { light: "#ECEEEA", dark: "#0A0A0A" };
// Pixel size in CSS px.
const CELL = 28;
// Covering and uncovering each take this long (ms); WAVE is the share spent on the wave's spread.
const PHASE = 340;
const WAVE = 0.7;
// Random spread added to each pixel's start, as a share of the wave, so the front looks pixelated.
const JITTER = 0.25;
// Held fully covered while the new theme paints and the page's 200 ms color fade (styles.css) finishes.
const HOLD = 200;
// Pixels this close to full size snap to it, so a covered area reads as solid rather than a hairline grid.
const SNAP = 0.85;

let running = false;

/** Runs `apply` (which switches the theme) behind the pixel wipe. `origin` is where the wave starts. */
export function pixelThemeTransition(
  to: "light" | "dark",
  origin: { x: number; y: number },
  apply: () => void,
) {
  if (running) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    apply();
    return;
  }
  running = true;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.ceil(w * dpr);
  canvas.height = Math.ceil(h * dpr);
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = `position:fixed;inset:0;width:${w}px;height:${h}px;z-index:9999;pointer-events:none;`;
  document.body.appendChild(canvas);
  ctx.scale(dpr, dpr);
  ctx.fillStyle = BACKGROUND[to];

  // Each pixel's start, 0–1 within a phase: its distance from the origin, plus a little randomness.
  const cols = Math.ceil(w / CELL);
  const rows = Math.ceil(h / CELL);
  const far = Math.max(
    Math.hypot(origin.x, origin.y),
    Math.hypot(w - origin.x, origin.y),
    Math.hypot(origin.x, h - origin.y),
    Math.hypot(w - origin.x, h - origin.y),
  );
  const starts = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const d = Math.hypot((c + 0.5) * CELL - origin.x, (r + 0.5) * CELL - origin.y) / far;
      starts[r * cols + c] = Math.min((d * (1 - JITTER) + Math.random() * JITTER) * WAVE, WAVE);
    }
  }
  const grow = 1 - WAVE;

  // One frame at phase progress p (0–1): each pixel grows in while covering, shrinks away while uncovering.
  const draw = (p: number, covering: boolean) => {
    ctx.clearRect(0, 0, w, h);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const k = Math.min(Math.max((p - starts[r * cols + c]) / grow, 0), 1);
        const fill = covering ? k : 1 - k;
        if (fill <= 0) continue;
        // Full pixels overlap by half a pixel so neighbours meet without hairline gaps.
        const s = fill >= SNAP ? CELL + 0.5 : CELL * fill;
        ctx.fillRect((c + 0.5) * CELL - s / 2, (r + 0.5) * CELL - s / 2, s, s);
      }
    }
  };

  const run = (covering: boolean, done: () => void) => {
    const start = performance.now();
    const frame = (now: number) => {
      const p = Math.min((now - start) / PHASE, 1);
      draw(p, covering);
      if (p < 1) requestAnimationFrame(frame);
      else done();
    };
    requestAnimationFrame(frame);
  };

  run(true, () => {
    apply();
    window.setTimeout(
      () =>
        run(false, () => {
          canvas.remove();
          running = false;
        }),
      HOLD,
    );
  });
}
