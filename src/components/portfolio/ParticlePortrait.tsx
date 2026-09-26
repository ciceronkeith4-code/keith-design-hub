import { useEffect, useRef, useState, type CSSProperties } from "react";
import type * as ThreeNS from "three";

/**
 * Halftone portrait that assembles from a scattered 3D particle cloud.
 * Sizes and distances are in "portrait heights" (the portrait is 1 world unit tall).
 */
const PARTICLE_PORTRAIT_CONFIG = {
  IMAGE_SRC: "/images/profile/keith-code-portrait.png",
  // The source is 288×388, so step 1 (one particle per inked pixel, ≈57k) is what reproduces the halftone exactly.
  SAMPLE_STEP: 1,
  // Phones / coarse pointers: ≈2×2 cells averaged, ≈15k particles (fine-tuned so the dot pitch is whole device pixels).
  MOBILE_SAMPLE_STEP: 2,
  // Luminance 0–255 (after compositing over white) below which a cell becomes a particle.
  // This portrait's face shading is light-gray dots, so 232 keeps it; 128 would drop the midtones and wash the face out.
  THRESHOLD: 232,
  // Dot diameter as a multiple of one sample cell; √2 just covers the cell so dark areas fill solid like the source.
  PARTICLE_SIZE: 1.42,
  // Full fly-in in ms, staggered departures included.
  ANIMATION_DURATION: 3000,
  // Share of the timeline spent on staggered departures (rest is flight time).
  STAGGER: 0.45,
  SCATTER_RADIUS: 1.4,
  // Mid-flight noise swirl and assembled "breathing" amplitudes.
  SWIRL: 0.12,
  IDLE_DRIFT: 0.0022,
  // Portrait height as a fraction of the canvas height.
  FIT: 0.95,
  // "bottom" sits the portrait's flat bottom cut just past the canvas edge, so a shaped frame clips it cleanly.
  ALIGN: "bottom" as "center" | "bottom",
  // Dark dots on the light shape in both themes (a true positive). "auto" would follow the site theme instead.
  INVERT_COLORS: false as boolean | "auto",
  // `paper` is the surface under the dots, used to print light-gray source pixels as lighter dots.
  COLORS: {
    normal: { ink: "#111111", paper: "#E1E4DD" },
    inverted: { ink: "#EDEDED", paper: "#0A0A0A" },
  },
};

const CONFIG = PARTICLE_PORTRAIT_CONFIG;
const FOV = 30;
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

const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uStagger;
uniform float uSwirl;
uniform float uIdle;
uniform float uCell;
uniform float uSizeScale;

// position = aTarget: where the particle sits in the finished portrait
attribute vec3 aStart;
attribute float aDelay;
attribute float aSize;
attribute float aShade;

varying float vShade;
varying float vAlpha;

${SNOISE}

float easeOutCubic(float t) { float u = 1.0 - t; return 1.0 - u * u * u; }

void main() {
  // Each particle leaves at its own time (aDelay), then flies with an ease-out so it settles softly.
  float t = clamp((uProgress - aDelay * uStagger) / (1.0 - uStagger), 0.0, 1.0);
  float e = easeOutCubic(t);
  vec3 pos = mix(aStart, position, e);

  // One slowly evolving noise field: large while in flight (swirl), tiny once arrived (breathing).
  vec3 q = position * 3.0 + vec3(0.0, 0.0, uTime * 0.12);
  vec3 n = vec3(snoise(q), snoise(q + vec3(17.3, 0.0, 0.0)), snoise(q + vec3(0.0, 31.7, 0.0)));
  float inFlight = sin(t * 3.14159265);
  pos += n * (uSwirl * inFlight + uIdle * e);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  // Perspective-correct size: one sample cell in world units → device pixels at this depth.
  gl_PointSize = max(uCell * aSize * uSizeScale / -mv.z, 1.0);

  vShade = aShade;
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
  // Round, crisp dots: discard outside the circle, keep a one-pixel soft edge.
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float edge = 1.0 - smoothstep(0.5 - fwidth(r), 0.5, r);
  // Each dot reproduces its source pixel's own tone: paper for white, full ink for black.
  vec3 col = mix(uPaper, uInk, vShade);
  gl_FragColor = vec4(col, edge * vAlpha);
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
 * Pixel sampling: scale the image to a `rows`-tall grid (the browser averages each cell), and turn every
 * cell darker than THRESHOLD into a particle. The grid is drawn over white so transparent background
 * and soft edges read as paper, not ink. Coordinates are centered, Y-flipped, and scaled so the
 * portrait is exactly 1 world unit tall.
 */
function samplePortrait(img: HTMLImageElement, rows: number) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const cols = Math.max(1, Math.round((rows * iw) / ih));
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, cols, rows);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, cols, rows);
  const { data } = ctx.getImageData(0, 0, cols, rows);

  const unit = 1 / rows;
  const targets: number[] = [];
  const shades: number[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum >= CONFIG.THRESHOLD) continue;
      targets.push((x + 0.5 - cols / 2) * unit, (rows / 2 - y - 0.5) * unit, 0);
      // Darkness 0–1 of the source pixel itself, so the particle can print its exact tone.
      shades.push(1 - lum / 255);
    }
  }
  return { targets, shades, aspect: iw / ih, cell: unit };
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
  const [ready, setReady] = useState(webglWorks);

  useEffect(() => {
    playRef.current = play;
    if (play) startRef.current?.();
  }, [play]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Reduced motion: the static image is the whole experience; no WebGL, no drift, no repulsion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(false);
      return;
    }

    let disposed = false;
    let teardown = () => {};

    (async () => {
      const [THREE, img] = await Promise.all([import("three"), loadImage(CONFIG.IMAGE_SRC)]);
      if (disposed) return;

      const coarse = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
      // Full device resolution: a canvas upscaled by the browser (e.g. capped at 2× on a 3× phone) resamples the dot grid into stripes.
      const pixelRatio = Math.min(window.devicePixelRatio, 3);
      const imageAspect = img.naturalWidth / img.naturalHeight;
      const step = coarse ? CONFIG.MOBILE_SAMPLE_STEP : CONFIG.SAMPLE_STEP;
      let rows = Math.ceil(img.naturalHeight / step);
      // Coarse grids (phones) are sized so the dot pitch is a whole number of device pixels. Every dot then lands
      // on the same sub-pixel phase and rasterizes identically; a fractional pitch (≈2.9px) beats against the
      // pixel grid and shows as darker/lighter bands across the portrait. The camera fit is nudged to match (<1%).
      let pitch = 0;
      const ch = container.clientHeight;
      if (coarse && ch) {
        const visibleH = visibleHeight(container.clientWidth / ch, imageAspect);
        const pxPerUnit = Math.floor(ch * pixelRatio) / visibleH;
        pitch = Math.max(1, Math.round(pxPerUnit / rows));
        rows = Math.round(pxPerUnit / pitch);
      }
      const { targets, shades, cell } = samplePortrait(img, rows);
      const count = shades.length;

      const starts = new Float32Array(count * 3);
      const delays = new Float32Array(count);
      const sizes = new Float32Array(count);
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
        // Darker pixels print marginally larger; kept small so the assembled image stays faithful.
        // No random term: on a regular grid, per-dot size noise reads as mottled texture.
        sizes[i] = 0.96 + 0.08 * shades[i];
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(targets, 3));
      geometry.setAttribute("aStart", new THREE.BufferAttribute(starts, 3));
      geometry.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("aShade", new THREE.Float32BufferAttribute(shades, 1));

      const palette = () => (isInverted() ? CONFIG.COLORS.inverted : CONFIG.COLORS.normal);
      const uniforms = {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uStagger: { value: CONFIG.STAGGER },
        uSwirl: { value: CONFIG.SWIRL },
        uIdle: { value: CONFIG.IDLE_DRIFT },
        uCell: { value: cell * CONFIG.PARTICLE_SIZE },
        uSizeScale: { value: 1 },
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
        setReady(false); // no WebGL: show the static image
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
      // Every mount (each visit to Home) starts scattered and plays the full fly-in.
      let assembled = false;
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

      // Scroll the portrait out of view → particles scatter; back into view → they reassemble.
      let visible = true;
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (!assembled) return;
          animateTo(entry.intersectionRatio > 0.2 ? 1 : 0, CONFIG.ANIMATION_DURATION * 0.6);
        },
        { threshold: [0, 0.2] },
      );
      io.observe(container);

      const ro = new ResizeObserver(resize);
      ro.observe(container);

      const themeObserver = new MutationObserver(() => {
        const p = palette();
        uniforms.uInk.value.set(p.ink);
        uniforms.uPaper.value.set(p.paper);
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      const t0 = performance.now();
      renderer.setAnimationLoop((now: number) => {
        if (from !== to) {
          const k = animDuration > 0 ? Math.min((now - animStart) / animDuration, 1) : 1;
          uniforms.uProgress.value = from + (to - from) * k;
          if (k >= 1) {
            from = to;
            if (to === 1) assembled = true;
          }
        }

        const animating = from !== to;
        if (!visible && !animating) return;

        uniforms.uTime.value = (now - t0) / 1000;
        renderer.render(scene, camera);
      });

      setReady(true);

      teardown = () => {
        renderer.setAnimationLoop(null);
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
      if (!disposed) setReady(false);
    });

    return () => {
      disposed = true;
      teardown();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      {/* Static portrait: shown during SSR, without WebGL, and for reduced motion; hidden once particles take over.
          Framed exactly like the particle version so the handoff never shifts. */}
      <img
        src={CONFIG.IMAGE_SRC}
        alt="Keith Ciceron rendered as a halftone portrait"
        width={288}
        height={388}
        className={`absolute left-1/2 -translate-x-1/2 w-auto max-w-none transition-opacity duration-300 ${FALLBACK_INVERT} ${ready ? "opacity-0" : "opacity-100"}`}
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
