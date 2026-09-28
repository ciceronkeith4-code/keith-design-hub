import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DEVICE_FRAMES } from "@/data/deviceFrames";
import { DEVICES, type Device, type Project } from "@/lib/projects";
import { screenAlt } from "./device-labels";
import type { ScreenSync } from "./screen-sync";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3F4A3A] dark:focus-visible:outline-[#B4C0A4]";

interface DeviceMockupProps {
  device: Device;
  project: Project;
  sync: ScreenSync;
  /** Drawn width of the device image, in px. */
  width: number;
  /** Click, Enter, or Space on the device. Omit to make it non-interactive. */
  onActivate?: () => void;
  /** Accessible name for the device as a button. */
  label?: string;
  style?: CSSProperties;
}

/**
 * A device image from public/devices with the project's screenshot showing through its screen.
 * The screenshot sits in the screen area measured in src/data/deviceFrames.ts; the image is layered
 * on top and lets the pointer through, so the screen still scrolls and hovers.
 */
export function DeviceMockup({
  device,
  project,
  sync,
  width,
  onActivate,
  label,
  style,
}: DeviceMockupProps) {
  const frame = DEVICE_FRAMES[device];
  const screen = frame.screen;
  const height = (width * frame.naturalHeight) / frame.naturalWidth;

  return (
    <div
      role={onActivate ? "button" : undefined}
      tabIndex={onActivate ? 0 : undefined}
      aria-label={onActivate ? label : undefined}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (onActivate && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onActivate();
        }
      }}
      className={`relative select-none rounded-[4px] ${onActivate ? `cursor-pointer ${FOCUS_RING}` : ""}`}
      style={{ width, height, ...style }}
    >
      <div
        className="absolute overflow-hidden bg-[#0F0F0F]"
        style={{
          left: `${screen.left}%`,
          top: `${screen.top}%`,
          width: `${screen.width}%`,
          height: `${screen.height}%`,
          borderRadius: (screen.radius / 100) * width,
        }}
      >
        <Screenshot
          device={device}
          project={project}
          sync={sync}
          screenWidth={(screen.width / 100) * width}
        />
      </div>
      <img
        src={frame.src}
        alt=""
        width={frame.naturalWidth}
        height={frame.naturalHeight}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}

/** The full-page screenshot, anchored top and scrollable (scrollbar hidden), or a placeholder. */
function Screenshot({
  device,
  project,
  sync,
  screenWidth,
}: {
  device: Device;
  project: Project;
  sync: ScreenSync;
  screenWidth: number;
}) {
  const src = project.screens[device][0];
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasShot = Boolean(src) && !failed;

  // An image that failed before hydration never fires React's onError.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!hasShot || !el) return;
    return sync.attach(el, DEVICES[device].width);
  }, [sync, hasShot, device]);

  if (!hasShot) {
    return (
      <p
        className="absolute inset-0 flex items-center justify-center p-2 text-center font-display-mono leading-snug text-[#A3A3A3]"
        style={{ fontSize: Math.min(13, Math.max(7, screenWidth * 0.045)) }}
      >
        Screenshot coming soon
      </p>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar absolute inset-0 touch-pan-y overflow-y-auto overflow-x-hidden"
    >
      <img
        ref={imgRef}
        src={src}
        alt={screenAlt(project, device)}
        width={DEVICES[device].width}
        height={DEVICES[device].height}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        className="block h-auto min-h-full w-full object-cover object-top"
      />
    </div>
  );
}
