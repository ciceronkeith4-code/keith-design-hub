import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { DEVICES, type Device, type Project } from "@/lib/projects";
import { Lightbox, type LightboxImage } from "./Lightbox";

const DEVICE_ORDER: Device[] = ["desktop", "tablet", "mobile"];

/** "all" is the composed arrangement; a device name brings that one forward on its own. */
type View = "all" | Device;

/**
 * Where each frame sits on the composed stage, in % of the stage box. The stage is 1800 × 1600
 * device pixels, so frames keep the true relative scale of their viewports: the desktop spans
 * 1460 of those, the tablet 850, the phone 410. `shiftY` is a translateY in % of the frame's own
 * height, which lets the tablet and phone anchor to the bottom edge whatever their bezel adds.
 */
type Placement = { left: number; top: number; width: number; shiftY: number };

const STAGE_RATIO = "1800 / 1600";

const COMPOSED: Record<Device, Placement> = {
  desktop: { left: 18.89, top: 0, width: 81.11, shiftY: 0 },
  tablet: { left: 0, top: 100, width: 47.22, shiftY: -100 },
  mobile: { left: 77.22, top: 97, width: 22.78, shiftY: -100 },
};

/** A single device, centered and as large as the stage allows. */
const FOCUSED: Record<Device, Placement> = {
  desktop: { left: 0, top: 50, width: 100, shiftY: -50 },
  tablet: { left: 21.39, top: 50, width: 57.22, shiftY: -50 },
  mobile: { left: 31.11, top: 50, width: 37.78, shiftY: -50 },
};

const LAYER: Record<Device, number> = { desktop: 1, tablet: 2, mobile: 3 };

/** Frame widths when one device shows at a time (phone widths): the phone is ~70% of the screen. */
const SINGLE_WIDTH: Record<Device, string> = {
  desktop: "w-full",
  tablet: "w-[86%]",
  mobile: "w-[70vw] max-w-full",
};

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F4A3A] dark:focus-visible:outline-[#B4C0A4]";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const screenAlt = (project: Project, device: Device, n: number, total: number) =>
  `${project.title}, full page at ${DEVICES[device].label.toLowerCase()} width (${DEVICES[device].width} px)` +
  (total > 1 ? `, screen ${n} of ${total}` : "");

export function DeviceStage({ project }: { project: Project }) {
  const [lightbox, setLightbox] = useState<{ device: Device; index: number } | null>(null);
  const openLightbox = (device: Device) => setLightbox({ device, index: 0 });

  const images: LightboxImage[] = lightbox
    ? project.screens[lightbox.device].map((src, i, all) => ({
        src,
        alt: screenAlt(project, lightbox.device, i + 1, all.length),
        caption: `${DEVICES[lightbox.device].label} · ${DEVICES[lightbox.device].width} × ${DEVICES[lightbox.device].height}`,
        width: DEVICES[lightbox.device].width,
        height: DEVICES[lightbox.device].height,
      }))
    : [];

  return (
    <>
      {/* Both layouts are server-rendered and CSS picks one, so there's no flash on hydration. */}
      <div className="hidden md:block">
        <ComposedStage project={project} onOpen={openLightbox} />
      </div>
      <div className="md:hidden">
        <SingleStage project={project} onOpen={openLightbox} />
      </div>

      <Lightbox
        images={images}
        index={lightbox?.index ?? null}
        label={
          lightbox
            ? `${project.title}, ${DEVICES[lightbox.device].label.toLowerCase()} screenshots`
            : undefined
        }
        onClose={() => setLightbox(null)}
        onIndexChange={(index) =>
          setLightbox((current) => (current ? { ...current, index } : current))
        }
      />
    </>
  );
}

interface StageProps {
  project: Project;
  onOpen: (device: Device) => void;
}

/** Tablet and up: all three frames arranged together, or one brought forward. */
function ComposedStage({ project, onOpen }: StageProps) {
  const [view, setView] = useState<View>("all");
  const id = useId();

  return (
    <div>
      <DeviceTabs
        id={id}
        label={`Device preview of ${project.title}`}
        options={["all", ...DEVICE_ORDER]}
        value={view}
        onChange={setView}
      />
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${view}`}
        className="relative mt-6"
        style={{ aspectRatio: STAGE_RATIO }}
      >
        {DEVICE_ORDER.map((device) => {
          const focused = view === device;
          const visible = view === "all" || focused;
          const place = focused ? FOCUSED[device] : COMPOSED[device];
          return (
            <DeviceFrame
              key={device}
              device={device}
              project={project}
              onOpen={onOpen}
              hidden={!visible}
              className={`absolute transition-[left,top,width,transform,opacity] duration-[260ms] ${EASE}`}
              style={{
                left: `${place.left}%`,
                top: `${place.top}%`,
                width: `${place.width}%`,
                transform: `translateY(${place.shiftY}%)`,
                zIndex: focused ? 4 : LAYER[device],
                opacity: visible ? 1 : 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Phone widths: one device at a time, switched by the tabs or a horizontal swipe. */
function SingleStage({ project, onOpen }: StageProps) {
  const [device, setDevice] = useState<Device>("desktop");
  const id = useId();
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const step = (dir: 1 | -1) => {
    const next = DEVICE_ORDER.indexOf(device) + dir;
    if (next >= 0 && next < DEVICE_ORDER.length) setDevice(DEVICE_ORDER[next]);
  };

  return (
    <div>
      <DeviceTabs
        id={id}
        label={`Device preview of ${project.title}`}
        options={DEVICE_ORDER}
        value={device}
        onChange={(v) => setDevice(v as Device)}
      />
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${device}`}
        className="mt-5 flex touch-pan-y justify-center"
        onPointerDown={(e) => {
          swipeStart.current = { x: e.clientX, y: e.clientY };
          swiped.current = false;
        }}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            swiped.current = true;
            step(dx < 0 ? 1 : -1);
          }
        }}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
        // A swipe that ends on the frame shouldn't also open the lightbox.
        onClickCapture={(e) => {
          if (swiped.current) {
            e.stopPropagation();
            swiped.current = false;
          }
        }}
      >
        <DeviceFrame
          key={device}
          device={device}
          project={project}
          onOpen={onOpen}
          className={`device-in ${SINGLE_WIDTH[device]}`}
        />
      </div>
    </div>
  );
}

interface DeviceTabsProps {
  id: string;
  label: string;
  options: View[];
  value: View;
  onChange: (view: View) => void;
}

/** Desktop · Tablet · Mobile as a real tablist, with an underline that slides to the active tab. */
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
    // Re-measure when the web font lands or the list goes from hidden to shown.
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

  const spec = value === "all" ? null : DEVICES[value];

  return (
    <div className="flex items-end justify-between gap-4 border-b border-black/12 dark:border-white/12">
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="relative flex items-center font-mono text-[11px]"
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
                className={`py-2.5 cursor-pointer transition-colors ${FOCUS_RING} ${
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
      <span className="hidden pb-2.5 font-mono text-[11px] text-[#5E615A] dark:text-[#A3A3A3] sm:block">
        {spec ? `${spec.width} × ${spec.height}` : "3 viewports"}
      </span>
    </div>
  );
}

interface DeviceFrameProps {
  device: Device;
  project: Project;
  onOpen: (device: Device) => void;
  /** Faded out behind a focused device: no pointer, focus, or screen reader access. */
  hidden?: boolean;
  className?: string;
  style?: CSSProperties;
}

const BEZEL: Record<Device, string> = {
  desktop: "px-[3px] pb-[3px]",
  tablet: "p-[6px]",
  mobile: "p-[4px]",
};

/** A minimal CSS device: 1px outline, thin even bezel, and a three-dot bar on the desktop. */
function DeviceFrame({ device, project, onOpen, hidden, className = "", style }: DeviceFrameProps) {
  const spec = DEVICES[device];
  const screens = project.screens[device];
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const hasShot = screens.length > 0 && !failed;
  const scrollRef = useHoverScroll(hasShot);

  // An image that failed before hydration never fires React's onError.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  const interactive = hasShot && !hidden;

  return (
    <div
      className={`rounded-[4px] border border-black/30 bg-[#F6F7F4] dark:border-white/25 dark:bg-[#141414] ${BEZEL[device]} ${
        interactive ? `cursor-zoom-in ${FOCUS_RING}` : ""
      } ${className}`}
      style={style}
      inert={hidden}
      role={hasShot ? "button" : undefined}
      tabIndex={hasShot ? 0 : undefined}
      aria-label={
        hasShot
          ? `Open ${spec.label.toLowerCase()} screenshots of ${project.title}${screens.length > 1 ? ` (${screens.length})` : ""}`
          : undefined
      }
      onClick={() => interactive && onOpen(device)}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen(device);
        }
      }}
    >
      {device === "desktop" && (
        <div aria-hidden="true" className="flex h-4 items-center gap-[3px] px-[3px]">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-[5px] w-[5px] rounded-full bg-black/15 dark:bg-white/20" />
          ))}
        </div>
      )}
      <div
        className="relative overflow-hidden rounded-[2px] border border-black/12 bg-white dark:border-white/12 dark:bg-[#1C1C1C]"
        style={{ aspectRatio: `${spec.width} / ${spec.height}` }}
      >
        {hasShot ? (
          <div
            ref={scrollRef}
            className="screen-scrollbar absolute inset-0 touch-pan-y overflow-y-auto overflow-x-hidden"
          >
            <img
              ref={imgRef}
              src={screens[0]}
              alt={screenAlt(project, device, 1, screens.length)}
              width={spec.width}
              height={spec.height}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => setFailed(true)}
              className="block h-auto w-full"
            />
          </div>
        ) : (
          <p className="absolute inset-0 flex items-center justify-center p-2 text-center font-mono text-[10px] leading-snug text-[#5E615A] dark:text-[#A3A3A3]">
            Screenshot coming soon
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Hovering a screen with a mouse slowly scrolls the page inside it, then returns to the top on
 * leave. Wheel or click hands control back. Off for touch (people drag instead) and reduced motion.
 */
function useHoverScroll(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const SPEED = 110; // px per second
    let frame = 0;
    let delay = 0;
    let last = 0;
    let pos = 0;

    const stop = () => {
      cancelAnimationFrame(frame);
      clearTimeout(delay);
      frame = 0;
    };
    const tick = (now: number) => {
      pos += (SPEED * (last ? now - last : 16)) / 1000;
      last = now;
      el.scrollTop = pos;
      if (pos < el.scrollHeight - el.clientHeight) frame = requestAnimationFrame(tick);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
      // A short wait so passing the cursor over a frame doesn't set it off.
      delay = window.setTimeout(() => {
        pos = el.scrollTop;
        last = 0;
        frame = requestAnimationFrame(tick);
      }, 350);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      stop();
      if (!prefersReducedMotion()) el.scrollTo({ top: 0, behavior: "smooth" });
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("pointerdown", stop);
    return () => {
      stop();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("wheel", stop);
      el.removeEventListener("pointerdown", stop);
    };
  }, [enabled]);

  return ref;
}
