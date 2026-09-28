import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { DEVICE_FRAMES } from "@/data/deviceFrames";
import { DEVICES, type Device, type Project } from "@/lib/projects";
import { DeviceMockup } from "./DeviceMockup";
import { DEVICE_NOUN, screenAlt, siteName } from "./device-labels";
import { layoutScene } from "./device-scene";
import { Lightbox, type LightboxImage } from "./Lightbox";
import { ScreenSync } from "./screen-sync";

const DEVICE_ORDER: Device[] = ["desktop", "tablet", "mobile"];

/** "all" is the scene (or the project photo); a device name shows that one alone. */
type View = "all" | Device;

/** Tallest the scene may be drawn, in px; phones use a share of the width instead. */
const MAX_SCENE_H = 380;
/** Tallest a single device may be drawn, in px. On phones the phone fills about 65% of the width. */
const MAX_FOCUS_H = 400;
const COMPACT_MAX_FOCUS_H = 520;
const CAPTION_H = 36;
const PHOTO_RATIO = 16 / 10;

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F4A3A] dark:focus-visible:outline-[#B4C0A4]";

interface DeviceStageProps {
  project: Project;
  /** Grid placement for the stage and the tabs below it, which render as siblings. */
  stageClassName?: string;
  tabsClassName?: string;
}

export function DeviceStage({
  project,
  stageClassName = "",
  tabsClassName = "",
}: DeviceStageProps) {
  const devices = DEVICE_ORDER.filter((d) => !project.devices || project.devices.includes(d));
  const devicesKey = devices.join(",");
  const scene = useMemo(
    () => layoutScene(devicesKey.split(",") as Device[], project.heroDevice),
    [devicesKey, project.heroDevice],
  );

  const [view, setView] = useState<View>("all");
  const [lightbox, setLightbox] = useState<{ device: Device; index: number } | null>(null);
  const [sync] = useState(() => new ScreenSync());
  useEffect(() => () => sync.dispose(), [sync]);
  const [stageRef, { width, compact }] = useStageSize();
  const id = useId();
  const name = siteName(project);

  // "All": the whole scene scaled as one unit to fit the column.
  const sceneScale = width
    ? Math.min(width / scene.width, (compact ? width * 0.75 : MAX_SCENE_H) / scene.height)
    : 0;
  const allH = project.photo ? width / PHOTO_RATIO : scene.height * sceneScale;
  // A single device: as large as fits, with its caption underneath.
  const focusWidth = (device: Device) => {
    const frame = DEVICE_FRAMES[device];
    const maxH = compact ? COMPACT_MAX_FOCUS_H : MAX_FOCUS_H;
    return Math.min(width, (maxH * frame.naturalWidth) / frame.naturalHeight);
  };
  const focusH = (device: Device) => {
    const frame = DEVICE_FRAMES[device];
    return (focusWidth(device) * frame.naturalHeight) / frame.naturalWidth + CAPTION_H;
  };
  const stageH = view === "all" ? allH : focusH(view);

  /** Clicking a device: on phones the scene's devices switch tabs; otherwise open the lightbox. */
  const activation = (device: Device, inScene: boolean) => {
    if (inScene && compact) {
      return {
        onActivate: () => setView(device),
        label: `Show ${name} on a ${DEVICE_NOUN[device]}`,
      };
    }
    if (project.screens[device].length === 0) return {};
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

  const shadowHeight = scene.height - scene.floor;

  return (
    <>
      <div
        ref={stageRef}
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${view}`}
        className={`relative w-full overflow-hidden transition-[height] duration-300 ${EASE} ${stageClassName}`}
        // Until it's measured, reserve the scene's shape so the page doesn't jump.
        style={width ? { height: stageH } : { aspectRatio: `${scene.width} / ${scene.height}` }}
      >
        {width > 0 && (
          <>
            <Layer active={view === "all"} height={allH}>
              {project.photo ? (
                <img
                  src={project.photo}
                  alt={`${name} in use`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full rounded-[4px] object-cover"
                />
              ) : (
                <div
                  className="absolute bottom-0"
                  style={{
                    left: (width - scene.width * sceneScale) / 2,
                    width: scene.width,
                    height: scene.height,
                    transform: `scale(${sceneScale})`,
                    transformOrigin: "0 100%",
                  }}
                >
                  {/* One soft floor shadow under the whole group. */}
                  <div
                    aria-hidden="true"
                    className="absolute rounded-[50%] bg-black/15 dark:bg-black/50"
                    style={{
                      left: scene.width * 0.06,
                      width: scene.width * 0.88,
                      top: scene.floor - shadowHeight * 0.35,
                      height: shadowHeight * 0.7,
                      filter: `blur(${shadowHeight * 0.4}px)`,
                    }}
                  />
                  {scene.devices.map((d) => (
                    <DeviceMockup
                      key={d.device}
                      device={d.device}
                      project={project}
                      sync={sync}
                      width={d.width}
                      {...activation(d.device, true)}
                      style={{ position: "absolute", left: d.x, top: d.y, zIndex: d.hero ? 2 : 1 }}
                    />
                  ))}
                </div>
              )}
            </Layer>

            {devices.map((device) => {
              const spec = DEVICES[device];
              return (
                <Layer key={device} active={view === device} height={focusH(device)}>
                  <div className="flex h-full flex-col items-center justify-end">
                    <DeviceMockup
                      device={device}
                      project={project}
                      sync={sync}
                      width={focusWidth(device)}
                      {...activation(device, false)}
                    />
                    <p
                      className="flex shrink-0 items-end font-display-mono text-xs text-[#5E615A] dark:text-[#A3A3A3]"
                      style={{ height: CAPTION_H }}
                    >
                      {spec.label} — {spec.width} × {spec.height}
                    </p>
                  </div>
                </Layer>
              );
            })}
          </>
        )}
      </div>

      <div className={tabsClassName}>
        <DeviceTabs
          id={id}
          label={`Device preview of ${project.title}`}
          options={["all", ...devices]}
          value={view}
          onChange={setView}
        />
      </div>

      <Lightbox
        images={images}
        index={lightbox?.index ?? null}
        label={
          lightbox ? `${project.title}, ${DEVICE_NOUN[lightbox.device]} screenshots` : undefined
        }
        fontClassName="font-display-mono"
        onClose={() => setLightbox(null)}
        onIndexChange={(index) =>
          setLightbox((current) => (current ? { ...current, index } : current))
        }
      />
    </>
  );
}

/**
 * One view of the stage, standing on its bottom edge. Views crossfade with a slight scale;
 * hidden ones can't be reached by pointer, keyboard, or screen reader.
 */
function Layer({
  active,
  height,
  children,
}: {
  active: boolean;
  height: number;
  children: ReactNode;
}) {
  return (
    <div
      inert={!active}
      className={`absolute inset-x-0 bottom-0 origin-bottom transition-[opacity,transform] duration-[250ms] ${EASE}`}
      style={{ height, opacity: active ? 1 : 0, transform: active ? "none" : "scale(0.97)" }}
    >
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
    <div className="border-t border-black/12 dark:border-white/12">
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="relative inline-flex items-center font-display-mono text-[11px]"
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
          className={`absolute bottom-1 h-[2px] bg-[#3F4A3A] dark:bg-[#B4C0A4] ${
            slide ? `transition-[left,width] duration-[240ms] ${EASE}` : ""
          }`}
          style={{ left: bar?.left ?? 0, width: bar?.width ?? 0, opacity: bar ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
