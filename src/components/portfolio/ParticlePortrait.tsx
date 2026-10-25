import { useEffect, useRef, useState, type CSSProperties } from "react";
import type * as ThreeNS from "three";

/**
 * Dithered pixel portrait that assembles from a scattered 3D particle cloud each time it mounts (a load, a
 * reload, or a return to Home), then looks at the cursor by switching straight to the matching photo pose.
 * Sizes and distances are in "portrait heights" (the portrait is 1 world unit tall).
 */
const PARTICLE_PORTRAIT_CONFIG = {
  // Keith's pose photos, aligned on the shoulders and stored side by side in one grayscale sprite.
  // The resting frame, pre-dithered, is the static fallback.
  POSES_SRC: "/images/profile/keith-poses.png",
  REST_SRC: "/images/profile/keith-pose-rest.png",
  FRAME: { WIDTH: 210, HEIGHT: 258 },
  // One entry per sprite frame, in order, with the direction (degrees, 0 = right, 90 = down) the face looks.
  POSES: [
    { name: "left", angle: 180 },
    { name: "up-left", angle: -135 },
    { name: "up-right", angle: -45 },
    { name: "right", angle: 0 },
    { name: "down-right", angle: 45 },
    { name: "down-left", angle: 135 },
  ],
  // The pose shown at rest and when the cursor leaves the window. Looking left faces the hero text.
  REST_POSE: 0,
  // Cursor within this many px of the portrait's center keeps the current pose.
  DEAD_ZONE: 90,
  // Degrees the cursor must pass a pose boundary by before the head turns, so it doesn't flicker.
  HYSTERESIS: 12,
  // Source pixels per pixel: one per photo pixel (about 210×258) on a desktop, a little coarser on phones.
  SAMPLE_STEP: 1,
  MOBILE_SAMPLE_STEP: 1.25,
  // Luminance 0–255 (after compositing over white) below which a cell becomes a pixel; the white backdrop drops out.
  THRESHOLD: 240,
  // Levels: source luminance at or below BLACK prints full ink, at or above WHITE prints paper. Stretching the
  // range keeps the light skin tones' eyes, nose and mouth readable at this resolution.
  LEVELS: { BLACK: 20, WHITE: 236 },
  // Ordered (4×4 Bayer) dither to this many tones, paper included: 3 prints paper, gray and ink, like a
  // two-ink print. Paper pixels are left out, so the frame shows through.
  DITHER_TONES: 3,
  // Extra device pixels added to each pixel's size. 0 keeps the dither crisp; raise it if thin cracks show.
  PIXEL_OVERLAP: 0,
  // Full fly-in in ms, staggered departures included.
  ANIMATION_DURATION: 3000,
  // Share of the timeline spent on staggered departures (rest is flight time).
  STAGGER: 0.45,
  SCATTER_RADIUS: 1.4,
  // Mid-flight noise swirl and assembled "breathing" amplitudes. No breathing: drift would shimmer the dither.
  SWIRL: 0.12,
  IDLE_DRIFT: 0,
  // Portrait height as a fraction of the canvas height.
  FIT: 0.95,
  // "bottom" sits the portrait's flat bottom cut just past the canvas edge, so a shaped frame clips it cleanly.
  ALIGN: "bottom" as "center" | "bottom",
  // Dark pixels on the light shape in both themes (a true positive). "auto" would follow the site theme instead.
  // Gray pixels print halfway between paper and ink.
  INVERT_COLORS: false as boolean | "auto",
  // `paper` is the surface under the pixels, used to print light-gray source pixels as lighter pixels.
  COLORS: {
    normal: { ink: "#111111", paper: "#E1E4DD" },
    inverted: { ink: "#EDEDED", paper: "#0A0A0A" },
  },
};

const CONFIG = PARTICLE_PORTRAIT_CONFIG;
const FOV = 30;
// Show the still portrait if the 3D view hasn't started after this long (ms).
const SLOW_LOAD_MS = 2500;
// How far past the canvas bottom the portrait extends when bottom-aligned (portrait heights).
const BOTTOM_BLEED = 0.012;
// The static fallback image mirrors the particle colors for the same INVERT_COLORS setting.
const FALLBACK_INVERT =
  CONFIG.INVERT_COLORS === "auto" ? "dark:invert" : CONFIG.INVERT_COLORS ? "invert" : "";

// Set once WebGL has worked on this page. Later mounts (every return to Home) hide the static image from the
// first frame, so it doesn't flash before the fly-in replays. Only client-side mounts ever see it true, so
// server and first-client markup still match.
let webglWorks = false;

// Ashima Arts 3D simplex noise (MIT) — used for the flight swirl and idle breathing.
const SNOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const POSE_COUNT = CONFIG.POSES.length;
const POSE_INDICES = CONFIG.POSES.map((_, k) => k);

const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uStagger;
uniform float uSwirl;
uniform float uIdle;
uniform float uCell;
uniform float uSizeScale;
uniform float uOverlap;
// 1 for the pose on show, 0 for the rest.
uniform float uPoseW[${POSE_COUNT}];

attribute vec3 aStart;
attribute float aDelay;
// Where this particle sits in each pose: x, y, and the darkness (0–1) of that source pixel.
${POSE_INDICES.map((k) => `attribute vec3 aPose${k};`).join("\n")}

varying float vShade;
varying float vAlpha;

${SNOISE}

float easeOutCubic(float t) { float u = 1.0 - t; return 1.0 - u * u * u; }

void main() {
  vec3 target = ${POSE_INDICES.map((k) => `aPose${k} * uPoseW[${k}]`).join(" + ")};

  // Each particle leaves at its own time (aDelay), then flies with an ease-out so it settles softly.
  float t = clamp((uProgress - aDelay * uStagger) / (1.0 - uStagger), 0.0, 1.0);
  float e = easeOutCubic(t);
  vec3 pos = mix(aStart, vec3(target.xy, 0.0), e);

  // One slowly evolving noise field: large while in flight (swirl), tiny once settled (breathing).
  vec3 q = vec3(target.xy * 3.0, uTime * 0.12);
  vec3 n = vec3(snoise(q), snoise(q + vec3(17.3, 0.0, 0.0)), snoise(q + vec3(0.0, 31.7, 0.0)));
  float inFlight = sin(t * 3.14159265);
  pos += n * (uSwirl * inFlight + uIdle * e);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  // Perspective-correct size: one sample cell in world units → device pixels at this depth, plus the overlap.
  gl_PointSize = max(uCell * uSizeScale / -mv.z + uOverlap, 1.0);

  vShade = target.z;
  // Particles still in flight fade out radially toward the canvas edges, so the cloud reads as a soft
  // oval nebula instead of showing the canvas's rectangular clip.
  vec2 ndc = gl_Position.xy / gl_Position.w;
  float edgeFade = 1.0 - smoothstep(0.55, 1.0, length(ndc));
  vAlpha = smoothstep(0.0, 0.08, uProgress) * mix(edgeFade, 1.0, e);
}`;

const FRAGMENT_SHADER = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uPaper;
varying float vShade;
varying float vAlpha;

void main() {
  // Square pixels: a point sprite is already square, so every fragment of it is drawn.
  // Each pixel reproduces its source pixel's own tone: paper for white, full ink for black.
  vec3 col = mix(uPaper, uInk, vShade);
  gl_FragColor = vec4(col, vAlpha);
}`;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Pixel sampling: scale one sprite frame to a `rows`-tall grid (the browser averages each cell), and turn
 * every cell darker than THRESHOLD into a particle. The grid is drawn over white so transparent background
 * and soft edges read as paper, not ink. Coordinates are centered, Y-flipped, and scaled so the
 * portrait is exactly 1 world unit tall. Particles come back in Hilbert-curve order, so particle i of
 * one pose and particle i of another sit in roughly the same area and a pose change moves pixels a short way.
 */
function samplePose(sprite: HTMLImageElement, frame: number, rows: number) {
  const { WIDTH: fw, HEIGHT: fh } = CONFIG.FRAME;
  const cols = Math.max(1, Math.round((rows * fw) / fh));
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, cols, rows);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(sprite, frame * fw, 0, fw, fh, 0, 0, cols, rows);
  const { data } = ctx.getImageData(0, 0, cols, rows);

  const { BLACK, WHITE } = CONFIG.LEVELS;
  const unit = 1 / rows;
  const side = 2 ** Math.ceil(Math.log2(Math.max(cols, rows)));
  const cells: { order: number; x: number; y: number; shade: number }[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum >= CONFIG.THRESHOLD) continue;
      const shade = ditherTone(1 - Math.min(Math.max((lum - BLACK) / (WHITE - BLACK), 0), 1), x, y);
      if (shade === 0) continue;
      cells.push({
        order: hilbertIndex(side, x, y),
        x: (x + 0.5 - cols / 2) * unit,
        y: (rows / 2 - y - 0.5) * unit,
        shade,
      });
    }
  }
  cells.sort((a, b) => a.order - b.order);
  return { cells, cell: unit };
}

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** Ordered dither: darkness 0–1 at grid cell (x, y) → one of DITHER_TONES evenly spaced tones (0 is paper). */
function ditherTone(darkness: number, x: number, y: number) {
  const steps = CONFIG.DITHER_TONES - 1;
  const scaled = darkness * steps;
  const base = Math.floor(scaled);
  const threshold = (BAYER_4[y % 4][x % 4] + 0.5) / 16;
  return Math.min(base + (scaled - base > threshold ? 1 : 0), steps) / steps;
}

/** Position of grid cell (x, y) along a Hilbert curve filling a side×side square (side a power of two). */
function hilbertIndex(side: number, x: number, y: number) {
  let d = 0;
  for (let s = side / 2; s >= 1; s /= 2) {
    const rx = x & s ? 1 : 0;
    const ry = y & s ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      [x, y] = [y, x];
    }
  }
  return d;
}

// Portrait height in world units the camera must show so it fills FIT of the canvas (or its width, if narrower).
function visibleHeight(viewAspect: number, imageAspect: number) {
  return Math.max(1 / CONFIG.FIT, imageAspect / (CONFIG.FIT * viewAspect));
}

function isInverted() {
  if (CONFIG.INVERT_COLORS === "auto") return document.documentElement.classList.contains("dark");
  return CONFIG.INVERT_COLORS;
}

interface ParticlePortraitProps {
  /** Start the fly-in. Pass false while an intro overlay is still covering the page. */
  play?: boolean;
  className?: string;
  /** e.g. an organic border-radius; pair with overflow-hidden in className to clip the particles to the shape. */
  style?: CSSProperties;
}

export function ParticlePortrait({ play = true, className = "", style }: ParticlePortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<(() => void) | null>(null);
  const playRef = useRef(play);
  // "pending" until the 3D view is up ("live") or can't run ("static": the still image shows instead).
  const [mode, setMode] = useState<"pending" | "live" | "static">(webglWorks ? "live" : "pending");

  useEffect(() => {
    playRef.current = play;
    if (play) startRef.current?.();
  }, [play]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Reduced motion: the static image is the whole experience; no WebGL, no fly-in, no pose changes.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMode("static");
      return;
    }

    let disposed = false;
    let teardown = () => {};
    // On a slow connection or device, show the still portrait rather than an empty frame while the 3D view
    // loads; the fly-in then takes over from it.
    const slow = window.setTimeout(
      () => setMode((m) => (m === "pending" ? "static" : m)),
      SLOW_LOAD_MS,
    );

    (async () => {
      const [THREE, sprite] = await Promise.all([import("three"), loadImage(CONFIG.POSES_SRC)]);
      if (disposed) return;

      const coarse = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
      // Full device resolution: a canvas upscaled by the browser (e.g. capped at 2× on a 3× phone) resamples the pixel grid.
      const pixelRatio = Math.min(window.devicePixelRatio, 3);
      const imageAspect = CONFIG.FRAME.WIDTH / CONFIG.FRAME.HEIGHT;
      const step = coarse ? CONFIG.MOBILE_SAMPLE_STEP : CONFIG.SAMPLE_STEP;
      let rows = Math.ceil(CONFIG.FRAME.HEIGHT / step);
      // The grid is sized so the pixel pitch is a whole number of device pixels. Every pixel then lands on the
      // same sub-pixel phase and the gaps between them stay even; a fractional pitch shows as uneven bands.
      // The camera fit is nudged to match (<4%).
      let pitch = 0;
      const ch = container.clientHeight;
      if (ch) {
        const visibleH = visibleHeight(container.clientWidth / ch, imageAspect);
        const pxPerUnit = Math.floor(ch * pixelRatio) / visibleH;
        pitch = Math.max(1, Math.round(pxPerUnit / rows));
        rows = Math.round(pxPerUnit / pitch);
      }

      // Every pose has a different number of inked pixels; all poses share one particle count (the largest),
      // spreading each pose's pixels evenly over it so a few sit doubled up on the same spot.
      const poses = CONFIG.POSES.map((_, k) => samplePose(sprite, k, rows));
      const cell = poses[0].cell;
      const count = Math.max(...poses.map((p) => p.cells.length));
      const poseAttributes = poses.map(({ cells }) => {
        const data = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const c = cells[Math.floor((i * cells.length) / count)];
          data[i * 3] = c.x;
          data[i * 3 + 1] = c.y;
          data[i * 3 + 2] = c.shade;
        }
        return data;
      });

      const starts = new Float32Array(count * 3);
      const delays = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        // Uniform point in a sphere; the half toward the camera is flattened so nothing starts huge.
        const u = Math.random() * 2 - 1;
        const theta = Math.random() * Math.PI * 2;
        const r = CONFIG.SCATTER_RADIUS * Math.cbrt(Math.random());
        const s = Math.sqrt(1 - u * u);
        const z = r * u;
        starts[i * 3] = r * s * Math.cos(theta);
        starts[i * 3 + 1] = r * s * Math.sin(theta);
        starts[i * 3 + 2] = z > 0 ? z * 0.45 : z;
        delays[i] = Math.random();
      }

      const geometry = new THREE.BufferGeometry();
      // `position` only sizes the draw call; the shader places every particle from the pose attributes.
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      geometry.setAttribute("aStart", new THREE.BufferAttribute(starts, 3));
      geometry.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));
      poseAttributes.forEach((data, k) =>
        geometry.setAttribute(`aPose${k}`, new THREE.BufferAttribute(data, 3)),
      );

      const oneHot = (k: number) => CONFIG.POSES.map((_, i) => (i === k ? 1 : 0));
      const palette = () => (isInverted() ? CONFIG.COLORS.inverted : CONFIG.COLORS.normal);
      const uniforms = {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uStagger: { value: CONFIG.STAGGER },
        uSwirl: { value: CONFIG.SWIRL },
        uIdle: { value: CONFIG.IDLE_DRIFT },
        uCell: { value: cell },
        uSizeScale: { value: 1 },
        uOverlap: { value: CONFIG.PIXEL_OVERLAP },
        uPoseW: { value: oneHot(CONFIG.REST_POSE) },
        uInk: { value: new THREE.Color(palette().ink) },
        uPaper: { value: new THREE.Color(palette().paper) },
      };

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });

      const points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      const scene = new THREE.Scene();
      scene.add(points);
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 50);

      let renderer: ThreeNS.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        geometry.dispose();
        material.dispose();
        webglWorks = false;
        setMode("static"); // no WebGL: show the static image
        return;
      }
      webglWorks = true;
      renderer.setPixelRatio(pixelRatio);
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
      container.appendChild(canvas);

      const tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      const drawSize = new THREE.Vector2();

      // Fit the portrait to FIT of the canvas height (or width, if the canvas is narrower than the image).
      const resize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        renderer.getDrawingBufferSize(drawSize);
        const viewAspect = w / h;
        let visibleH = visibleHeight(viewAspect, imageAspect);
        if (pitch) {
          // Keep the whole-pixel pitch after a resize (e.g. rotation), unless that would visibly change the portrait size.
          const snap = Math.max(1, Math.round(drawSize.y / visibleH / rows));
          const snappedH = drawSize.y / (rows * snap);
          if (Math.abs(snappedH / visibleH - 1) < 0.04) visibleH = snappedH;
        }
        // Bottom alignment pans the camera (not the particles) so the portrait's bottom (y = -0.5) sits just below the frame.
        const camY = CONFIG.ALIGN === "bottom" ? visibleH / 2 - 0.5 + BOTTOM_BLEED : 0;
        camera.aspect = viewAspect;
        camera.position.set(0, camY, visibleH / (2 * tanHalf));
        camera.updateProjectionMatrix();
        uniforms.uSizeScale.value = drawSize.y / (2 * tanHalf);
      };
      resize();

      // Progress timeline: JS only advances a uniform; all particle motion is computed in the shader.
      // Every mount (each load of Home, a reload, or a return to it) starts scattered and plays the full fly-in.
      let from = uniforms.uProgress.value;
      let to = from;
      let animStart = 0;
      let animDuration = CONFIG.ANIMATION_DURATION;
      const animateTo = (target: number, duration: number) => {
        from = uniforms.uProgress.value;
        to = target;
        animStart = performance.now();
        animDuration = duration * Math.abs(target - from);
      };
      startRef.current = () => {
        if (to !== 1) animateTo(1, CONFIG.ANIMATION_DURATION);
      };
      if (playRef.current) startRef.current();

      // Nothing is drawn while the portrait is scrolled out of view.
      let visible = true;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(container);

      // Once it has landed, the portrait only changes on a pose change, a theme change or a resize (or every
      // frame with an idle drift), so a frame is drawn only then and the GPU is left free for scrolling.
      let dirty = true;

      const ro = new ResizeObserver(() => {
        resize();
        dirty = true;
      });
      ro.observe(container);

      const themeObserver = new MutationObserver(() => {
        const p = palette();
        uniforms.uInk.value.set(p.ink);
        uniforms.uPaper.value.set(p.paper);
        dirty = true;
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      // Pose changes are an instant swap; the pixels only animate during the fly-in.
      let pose = CONFIG.REST_POSE;
      const turnTo = (k: number) => {
        if (k === pose) return;
        pose = k;
        uniforms.uPoseW.value = oneHot(k);
        dirty = true;
      };

      // Turn to the pose whose direction is nearest the point's direction from the portrait's center. Inside the
      // dead zone, or (with hysteresis) until the point is clearly past a boundary, the current pose holds.
      const angleGap = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
      const lookToward = (clientX: number, clientY: number, hysteresis: number) => {
        const rect = container.getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);
        if (Math.hypot(dx, dy) < CONFIG.DEAD_ZONE) return;
        const angle = THREE.MathUtils.radToDeg(Math.atan2(dy, dx));
        let best = pose;
        let bestGap = angleGap(angle, CONFIG.POSES[pose].angle) - hysteresis;
        CONFIG.POSES.forEach((p, k) => {
          const gap = angleGap(angle, p.angle);
          if (gap < bestGap) {
            best = k;
            bestGap = gap;
          }
        });
        turnTo(best);
      };

      // Mouse and trackpad: follow the cursor.
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType === "mouse")
          lookToward(event.clientX, event.clientY, CONFIG.HYSTERESIS);
      };
      // Cursor leaves the window: back to the resting pose.
      const onPointerLeave = () => turnTo(CONFIG.REST_POSE);
      if (canHover) {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onPointerLeave);
        window.addEventListener("blur", onPointerLeave);
      }
      // Touch and pen: look toward wherever the screen is tapped. A tap is deliberate, so no hysteresis.
      // Passive, so taps and scrolls behave exactly as before.
      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") lookToward(event.clientX, event.clientY, 0);
      };
      window.addEventListener("pointerdown", onPointerDown, { passive: true });

      // While anything on the page scrolls, an idle drift holds still so the GPU only has the scroll to
      // draw. Scroll events don't bubble, so this listens in the capture phase.
      let scrollingUntil = 0;
      const onScroll = () => {
        scrollingUntil = performance.now() + 150;
      };
      document.addEventListener("scroll", onScroll, { capture: true, passive: true });

      // The clock only runs while frames are drawn, so a paused drift resumes where it stopped.
      let last = performance.now();
      let clock = 0;
      renderer.setAnimationLoop((now: number) => {
        const dt = now - last;
        last = now;
        if (from !== to) {
          const k = animDuration > 0 ? Math.min((now - animStart) / animDuration, 1) : 1;
          uniforms.uProgress.value = from + (to - from) * k;
          if (k >= 1) {
            from = to;
            dirty = true; // draw the landed frame
          }
        }

        const animating = from !== to;
        const drifting = CONFIG.IDLE_DRIFT > 0 && now >= scrollingUntil;
        if (!visible && !animating) return;
        if (!animating && !drifting && !dirty) return;
        dirty = false;

        clock += Math.min(dt, 50);
        uniforms.uTime.value = clock / 1000;
        renderer.render(scene, camera);
      });

      setMode("live");

      teardown = () => {
        renderer.setAnimationLoop(null);
        document.removeEventListener("scroll", onScroll, { capture: true });
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerdown", onPointerDown);
        document.documentElement.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("blur", onPointerLeave);
        io.disconnect();
        ro.disconnect();
        themeObserver.disconnect();
        startRef.current = null;
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })().catch(() => {
      // Image or module failed to load: show the static portrait.
      if (!disposed) setMode("static");
    });

    return () => {
      disposed = true;
      window.clearTimeout(slow);
      teardown();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      {/* Static portrait: shown during SSR, without WebGL, and for reduced motion; hidden once particles take over.
          Framed exactly like the particle version so the handoff never shifts, and scaled without smoothing so it
          stays pixelated. */}
      <img
        src={CONFIG.REST_SRC}
        alt="Keith Ciceron as a dithered gray portrait"
        width={CONFIG.FRAME.WIDTH}
        height={CONFIG.FRAME.HEIGHT}
        className={`portrait-fallback absolute left-1/2 -translate-x-1/2 w-auto max-w-none [image-rendering:pixelated] transition-opacity duration-300 ${FALLBACK_INVERT} ${mode === "live" ? "opacity-0" : mode === "static" ? "portrait-fallback-show" : ""}`}
        style={{
          height: `${CONFIG.FIT * 100}%`,
          ...(CONFIG.ALIGN === "bottom"
            ? { bottom: `${-BOTTOM_BLEED * CONFIG.FIT * 100}%` }
            : { top: `${((1 - CONFIG.FIT) / 2) * 100}%` }),
        }}
      />
    </div>
  );
}
