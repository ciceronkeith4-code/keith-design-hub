import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { DEVICES, type Device, type Project } from "@/lib/projects";
import { Lightbox, type LightboxImage } from "./Lightbox";
import { DEVICE_NOUN, LAPTOP, PHONE, TABLET, screenAlt, siteName } from "./device-geometry";
import {
  LaptopMockup,
  PhoneMockup,
  TabletMockup,
  type DeviceProps,
  type ScreenSyncLike,
} from "./RealisticDeviceMockups";

const DEVICE_ORDER: Device[] = ["desktop", "tablet", "mobile"];

/** "all" is the composed scene; a device name shows that one alone, straight on. */
type View = "all" | Device;

const MOCKUP: Record<Device, (props: DeviceProps & { tilt?: boolean }) => ReactNode> = {
  desktop: LaptopMockup,
  tablet: TabletMockup,
  mobile: PhoneMockup,
};

/**
 * The composed scene, laid out in a fixed 760 × 440 box that's scaled to the column as one unit.
 * Each device is placed at a scale that keeps real-life proportions: the tablet's screen is 55% of
 * the laptop's screen width, and the phone stands about 78% of the tablet's height.
 */
const SCENE = { w: 760, h: 440 };
const LAPTOP_SCALE = 0.72;
const TABLET_SCALE = (LAPTOP.screen.w * LAPTOP_SCALE * 0.55) / TABLET.screen.w;
const PHONE_SCALE = (TABLET.h * TABLET_SCALE * 0.78) / PHONE.h;

/** Top-left corner of each device, with its bottom edge at `bottom` (in scene px). */
const placeAt = (x: number, bottom: number, height: number, scale: number) => ({
  x,
  y: bottom - height * scale,
  scale,
});

const SCENE_PLACEMENT: Record<Device, { x: number; y: number; scale: number; z: number }> = {
  // Back left.
  desktop: { ...placeAt(20, 388, LAPTOP.h, LAPTOP_SCALE), z: 2 },
  // Back right, partly behind the laptop's lid.
  tablet: { ...placeAt(470, 338, TABLET.h, TABLET_SCALE), z: 1 },
  // Standing in front, overlapping both near center-right.
  mobile: { ...placeAt(505, 404, PHONE.h, PHONE_SCALE), z: 3 },
};

/** Single-device views: the device at its true size (plus room for its shadow), scaled to fit. */
const FOCUS_BOX: Record<Device, { w: number; h: number }> = {
  desktop: { w: LAPTOP.w, h: LAPTOP.h + 28 },
  tablet: { w: TABLET.w, h: TABLET.h + 20 },
  mobile: { w: PHONE.w, h: PHONE.h + 20 },
};
const CAPTION_H = 36;
/**
 * The largest a single device is drawn, relative to its true size. On phones it may grow a little
 * past true size, so the phone fills ~60% of the screen width.
 */
const MAX_FOCUS_SCALE = 0.85;
const COMPACT_MAX_FOCUS_SCALE = 1.1;

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F4A3A] dark:focus-visible:outline-[#B4C0A4]";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function DeviceStage({ project }: { project: Project }) {
  const [view, setView] = useState<View>("all");
  const [lightbox, setLightbox] = useState<{ device: Device; index: number } | null>(null);
  const [sync] = useState(() => new ScreenSync());
  useEffect(() => () => sync.dispose(), [sync]);
  const [stageRef, { width, compact }] = useStageSize();
  const id = useId();

  const sceneScale = width / SCENE.w;
  const sceneH = SCENE.h * sceneScale;
  const widthFit = (device: Device) =>
    Math.min(width / FOCUS_BOX[device].w, compact ? COMPACT_MAX_FOCUS_SCALE : MAX_FOCUS_SCALE);
  // Phones: the stage grows or shrinks to fit each view. Wider: one height for every tab (the
  // laptop's, if taller than the scene) so switching never moves the page, and the scene centers.
  const fixedH = Math.max(sceneH, FOCUS_BOX.desktop.h * widthFit("desktop") + CAPTION_H);
  const focusScale = (device: Device) =>
    compact
      ? widthFit(device)
      : Math.min(widthFit(device), (fixedH - CAPTION_H) / FOCUS_BOX[device].h);
  const stageH = !compact
    ? fixedH
    : view === "all"
      ? sceneH
      : FOCUS_BOX[view].h * focusScale(view) + CAPTION_H;

  const hasShots = (device: Device) => project.screens[device].length > 0;

  /** What clicking a device does: on phones the scene's devices switch tabs; otherwise open. */
  const activation = (device: Device, inScene: boolean) => {
    const name = siteName(project);
    if (inScene && compact) {
      return {
        onActivate: () => setView(device),
        label: `Show ${name} on a ${DEVICE_NOUN[device]}`,
      };
    }
    if (!hasShots(device)) return {};
    return {
      onActivate: () => setLightbox({ device, index: 0 }),
      label: `Open ${DEVICE_NOUN[device]} screenshots of ${name}`,
    };
  };

  const images: LightboxImage[] = lightbox
    ? project.screens[lightbox.device].map((src, i, all) => {
        const spec = DEVICES[lightbox.device];
        return {
          src,
          alt:
            screenAlt(project, lightbox.device) +
            (all.length > 1 ? `, ${i + 1} of ${all.length}` : ""),
          caption: `${spec.label} — ${spec.width} × ${spec.height}`,
          width: spec.width,
          height: spec.height,
        };
      })
    : [];

  return (
    <div className="w-full">
      <DeviceTabs
        id={id}
        label={`Device preview of ${project.title}`}
        options={["all", ...DEVICE_ORDER]}
        value={view}
        onChange={setView}
      />

      <div
        ref={stageRef}
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${view}`}
        className={`relative mt-6 w-full overflow-hidden transition-[height] duration-300 ${EASE}`}
        // Until it's measured, reserve the scene's shape so the page doesn't jump.
        style={width ? { height: stageH } : { aspectRatio: `${SCENE.w} / ${SCENE.h}` }}
      >
        {width > 0 && (
          <>
            <Layer active={view === "all"}>
              <Scaled
                left={0}
                top={compact ? 0 : (stageH - sceneH) / 2}
                width={SCENE.w}
                height={SCENE.h}
                scale={sceneScale}
              >
                {/* The whole group sits in perspective, turned slightly. */}
                <div className="h-full w-full" style={{ perspective: 2200 }}>
                  <div className="relative h-full w-full" style={{ transform: "rotateY(-10deg)" }}>
                    {DEVICE_ORDER.map((device) => {
                      const place = SCENE_PLACEMENT[device];
                      const Mockup = MOCKUP[device];
                      return (
                        <Mockup
                          key={device}
                          project={project}
                          sync={sync}
                          tilt={device === "desktop"}
                          {...activation(device, true)}
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            zIndex: place.z,
                            transformOrigin: "0 0",
                            transform: `translate(${place.x}px, ${place.y}px) scale(${place.scale})`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </Scaled>
            </Layer>

            {DEVICE_ORDER.map((device) => {
              const box = FOCUS_BOX[device];
              const scale = focusScale(device);
              const boxW = box.w * scale;
              const boxH = box.h * scale;
              const top = compact ? 0 : Math.max(0, (stageH - boxH - CAPTION_H) / 2);
              const spec = DEVICES[device];
              const Mockup = MOCKUP[device];
              return (
                <Layer key={device} active={view === device}>
                  <Scaled
                    left={(width - boxW) / 2}
                    top={top}
                    width={box.w}
                    height={box.h}
                    scale={scale}
                  >
                    <div className="flex justify-center">
                      <Mockup project={project} sync={sync} {...activation(device, false)} />
                    </div>
                  </Scaled>
                  <p
                    className="absolute left-0 right-0 text-center font-mono text-xs text-[#5E615A] dark:text-[#A3A3A3]"
                    style={{ top: top + boxH + 8 }}
                  >
                    {spec.label} — {spec.width} × {spec.height}
                  </p>
                </Layer>
              );
            })}
          </>
        )}
      </div>

      <Lightbox
        images={images}
        index={lightbox?.index ?? null}
        label={
          lightbox ? `${project.title}, ${DEVICE_NOUN[lightbox.device]} screenshots` : undefined
        }
        onClose={() => setLightbox(null)}
        onIndexChange={(index) =>
          setLightbox((current) => (current ? { ...current, index } : current))
        }
      />
    </div>
  );
}

/** One view of the stage. Views crossfade with a slight scale; hidden ones can't be reached. */
function Layer({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      inert={!active}
      className={`absolute inset-0 transition-[opacity,transform] duration-300 ${EASE}`}
      style={{ opacity: active ? 1 : 0, transform: active ? "none" : "scale(0.97)" }}
    >
      {children}
    </div>
  );
}

/** A fixed-size box drawn at `scale`, placed at `left`/`top` in stage pixels. */
function Scaled({
  left,
  top,
  width,
  height,
  scale,
  children,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
  children: ReactNode;
}) {
  const style: CSSProperties = {
    left,
    top,
    width,
    height,
    transform: `scale(${scale})`,
    transformOrigin: "0 0",
  };
  return (
    <div className="absolute" style={style}>
      {children}
    </div>
  );
}

/** The stage's width, and whether the viewport is phone-sized (under 768px). */
function useStageSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, compact: false });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => {
      const width = el.clientWidth;
      const compact = query.matches;
      setSize((prev) =>
        prev.width === width && prev.compact === compact ? prev : { width, compact },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    query.addEventListener("change", update);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", update);
    };
  }, []);

  return [ref, size] as const;
}

/** How fast the hover scroll moves through the real site, in its own CSS pixels per second. */
const SITE_PX_PER_SECOND = 450;

/**
 * Keeps every screen on a stage at the same point of its page (as a fraction of the scroll), so
 * the laptop, tablet, and phone show the same section. Hovering a screen with a mouse slowly
 * scrolls them all; leaving rewinds to the top. Scrolling by hand (wheel, drag) takes over and
 * the others follow. No hover scroll with reduced motion.
 */
class ScreenSync implements ScreenSyncLike {
  private screens = new Map<HTMLElement, { deviceWidth: number; expected: number }>();
  private progress = 0;
  private frame = 0;
  private delay = 0;

  attach(el: HTMLElement, deviceWidth: number) {
    const entry = { deviceWidth, expected: el.scrollTop };
    this.screens.set(el, entry);

    const onScroll = () => {
      // Ignore the scroll events our own writes cause.
      if (Math.abs(el.scrollTop - entry.expected) < 2) return;
      this.stop();
      const range = el.scrollHeight - el.clientHeight;
      entry.expected = el.scrollTop;
      this.progress = range > 0 ? el.scrollTop / range : 0;
      this.apply(el);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && !prefersReducedMotion()) this.play(el, entry.deviceWidth);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") this.rewind();
    };
    const onTakeOver = () => this.stop();

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("wheel", onTakeOver, { passive: true });
    el.addEventListener("touchstart", onTakeOver, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("wheel", onTakeOver);
      el.removeEventListener("touchstart", onTakeOver);
      this.screens.delete(el);
    };
  }

  dispose() {
    this.stop();
  }

  private stop() {
    cancelAnimationFrame(this.frame);
    clearTimeout(this.delay);
  }

  /** Moves every screen (except the one the user is scrolling) to the current progress. */
  private apply(except?: HTMLElement) {
    for (const [el, entry] of this.screens) {
      if (el === except) continue;
      el.scrollTop = this.progress * Math.max(0, el.scrollHeight - el.clientHeight);
      entry.expected = el.scrollTop;
    }
  }

  private play(driver: HTMLElement, deviceWidth: number) {
    this.stop();
    // A short wait so a cursor passing over doesn't set it off.
    this.delay = window.setTimeout(() => {
      let last = 0;
      const tick = (now: number) => {
        const range = driver.scrollHeight - driver.clientHeight;
        if (range <= 0) return;
        const siteRange = (range * deviceWidth) / driver.clientWidth;
        const dt = last ? now - last : 16;
        last = now;
        this.progress = Math.min(1, this.progress + (SITE_PX_PER_SECOND * dt) / 1000 / siteRange);
        this.apply();
        if (this.progress < 1) this.frame = requestAnimationFrame(tick);
      };
      this.frame = requestAnimationFrame(tick);
    }, 300);
  }

  private rewind() {
    this.stop();
    if (prefersReducedMotion() || this.progress === 0) {
      this.progress = 0;
      this.apply();
      return;
    }
    const from = this.progress;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 450);
      this.progress = from * (1 - t) ** 3;
      this.apply();
      if (t < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }
}

interface DeviceTabsProps {
  id: string;
  label: string;
  options: View[];
  value: View;
  onChange: (view: View) => void;
}

/** All · Desktop · Tablet · Mobile as a real tablist, with an underline that slides between tabs. */
function DeviceTabs({ id, label, options, value, onChange }: DeviceTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  // The underline only slides between tabs, never in from the edge on first paint.
  const [slide, setSlide] = useState(false);
  useEffect(() => {
    if (!bar || slide) return;
    const frame = requestAnimationFrame(() => setSlide(true));
    return () => cancelAnimationFrame(frame);
  }, [bar, slide]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const tab = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (tab) setBar({ left: tab.offsetLeft, width: tab.offsetWidth });
    };
    measure();
    // Re-measure when the web font lands.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [value]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = options.indexOf(value);
    const last = options.length - 1;
    const target =
      e.key === "ArrowRight"
        ? (current + 1) % options.length
        : e.key === "ArrowLeft"
          ? (current - 1 + options.length) % options.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (target === null) return;
    e.preventDefault();
    onChange(options[target]);
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[target]?.focus();
  };

  return (
    <div className="border-b border-black/12 dark:border-white/12">
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="relative inline-flex items-center font-mono text-[11px]"
      >
        {options.map((option, i) => {
          const selected = option === value;
          return (
            <span key={option} className="flex items-center">
              {i > 0 && (
                <span aria-hidden="true" className="px-2 text-[#8A8D86] dark:text-[#6B6B6B]">
                  ·
                </span>
              )}
              <button
                type="button"
                role="tab"
                id={`${id}-tab-${option}`}
                aria-selected={selected}
                aria-controls={`${id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(option)}
                className={`cursor-pointer py-2.5 transition-colors ${FOCUS_RING} ${
                  selected
                    ? "text-[#141414] dark:text-[#EDEDED]"
                    : "text-[#5E615A] hover:text-[#141414] dark:text-[#A3A3A3] dark:hover:text-[#EDEDED]"
                }`}
              >
                {option === "all" ? "All" : DEVICES[option].label}
              </button>
            </span>
          );
        })}
        <span
          aria-hidden="true"
          className={`absolute -bottom-px h-[2px] bg-[#3F4A3A] dark:bg-[#B4C0A4] ${
            slide ? `transition-[left,width] duration-[240ms] ${EASE}` : ""
          }`}
          style={{ left: bar?.left ?? 0, width: bar?.width ?? 0, opacity: bar ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
