import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DEVICES, type Device, type Project } from "@/lib/projects";
import { LAPTOP, PHONE, RIM, TABLET, screenAlt } from "./device-geometry";

/**
 * Generic graphite-and-silver devices drawn in HTML/CSS, each at one fixed "true" size where the
 * bezel, radius, and camera measurements read right. Layouts scale a whole device with a
 * transform, so its proportions never change. Sizes are in CSS pixels at scale 1.
 */

/** Syncs the scroll position of every screen on a stage; see ScreenSync in DeviceStage. */
export interface ScreenSyncLike {
  attach(el: HTMLElement, deviceWidth: number): () => void;
}

const ALUMINUM = "linear-gradient(135deg, #e4e4e4 0%, #cfcfcf 45%, #a9a9a9 100%)";
const BEZEL = "#161616";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3F4A3A] dark:focus-visible:outline-[#B4C0A4]";

export interface DeviceProps {
  project: Project;
  sync: ScreenSyncLike;
  /** Click, Enter, or Space on the device. Omit to make it inert. */
  onActivate?: () => void;
  /** Accessible name for the device as a button. */
  label?: string;
  /** Soft floor shadow under the device. */
  shadow?: boolean;
  style?: CSSProperties;
}

/** The clickable wrapper every device shares. */
function DeviceRoot({
  onActivate,
  label,
  width,
  height,
  style,
  children,
}: {
  onActivate?: () => void;
  label?: string;
  width: number;
  height: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
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
      className={`relative select-none ${onActivate ? `cursor-pointer rounded-[18px] ${FOCUS_RING}` : ""}`}
      style={{ width, height, ...style }}
    >
      {children}
    </div>
  );
}

/**
 * A device screen: the full-page screenshot anchored top, scrollable (scrollbars hidden) and kept
 * in step with the stage's other screens, under a faint diagonal glare.
 */
function Screen({
  device,
  project,
  sync,
  width,
  height,
  missingTextSize,
  children,
}: {
  device: Device;
  project: Project;
  sync: ScreenSyncLike;
  width: number;
  height: number;
  missingTextSize: number;
  children?: ReactNode;
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

  return (
    <div className="relative overflow-hidden rounded-[2px] bg-[#0F0F0F]" style={{ width, height }}>
      {hasShot ? (
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
      ) : (
        <p
          className="absolute inset-0 flex items-center justify-center p-4 text-center font-mono leading-snug text-[#8A8D86]"
          style={{ fontSize: missingTextSize }}
        >
          Screenshot coming soon
        </p>
      )}
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%)",
        }}
      />
    </div>
  );
}

function CameraDot({ size, style }: { size: number; style: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 35%, #34485c 0%, #0d0f12 65%, #000 100%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
        ...style,
      }}
    />
  );
}

/** Blurred ellipse on the floor under a device. */
function FloorShadow({
  width,
  height,
  opacity,
  bottom,
}: {
  width: string;
  height: number;
  opacity: number;
  bottom: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%]"
      style={{
        bottom,
        width,
        height,
        background: `radial-gradient(ellipse at center, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,${opacity / 3}) 45%, transparent 72%)`,
        filter: "blur(8px)",
      }}
    />
  );
}

const DECK_CLIP = (inset: number) =>
  `polygon(${inset}px 0, calc(100% - ${inset}px) 0, 100% 100%, 0 100%)`;

/** Laptop: lid with camera, brushed-aluminum keyboard deck, front lip, and a faint reflection. */
export function LaptopMockup({
  project,
  sync,
  onActivate,
  label,
  shadow = true,
  tilt = false,
  style,
}: DeviceProps & { /** Lean the lid back slightly (for the angled scene). */ tilt?: boolean }) {
  const { lid, deck, lip, bezel, screen } = LAPTOP;
  const deckTopInset = deck.inset - 6; // the lid sits just inside the deck's back edge

  return (
    <DeviceRoot
      onActivate={onActivate}
      label={label}
      width={LAPTOP.w}
      height={LAPTOP.h}
      style={style}
    >
      {shadow && <FloorShadow width="96%" height={30} opacity={0.22} bottom={-16} />}

      {/* Faint floor reflection of the base: 8%, fading out. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 opacity-[0.08]"
        style={{
          top: LAPTOP.h,
          height: 34,
          clipPath: `polygon(0 0, 100% 0, calc(100% - ${deck.inset}px) 100%, ${deck.inset}px 100%)`,
          background: "linear-gradient(to bottom, #5a5c60 0%, transparent 100%)",
        }}
      />

      {/* Lid */}
      <div
        className="absolute top-0"
        style={{
          left: deck.inset,
          width: lid.w,
          height: lid.h,
          transformOrigin: "50% 100%",
          transform: tilt ? "perspective(2200px) rotateX(4deg)" : undefined,
          padding: RIM,
          borderRadius: "14px 14px 4px 4px",
          background: ALUMINUM,
        }}
      >
        <div
          className="relative h-full w-full"
          style={{
            background: BEZEL,
            borderRadius: "12px 12px 3px 3px",
            padding: `${bezel.top}px ${bezel.x}px ${bezel.bottom}px`,
          }}
        >
          <CameraDot size={5} style={{ top: 5, left: "50%", marginLeft: -2.5 }} />
          <Screen
            device="desktop"
            project={project}
            sync={sync}
            width={screen.w}
            height={screen.h}
            missingTextSize={14}
          />
        </div>
      </div>

      {/* Keyboard deck: a trapezoid in brushed aluminum */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0"
        style={{
          top: lid.h,
          height: deck.h,
          clipPath: DECK_CLIP(deckTopInset),
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 3px), linear-gradient(180deg, #d9dbde 0%, #c6c8cb 55%, #b3b5b8 100%)",
        }}
      >
        {/* Key grid: dark keys, aluminum gaps */}
        <div
          className="absolute"
          style={{
            top: 5,
            height: 22,
            left: "15%",
            right: "15%",
            clipPath: DECK_CLIP(8),
            background:
              "repeating-linear-gradient(90deg, transparent 0 11px, #a4a7ab 11px 12.5px), repeating-linear-gradient(180deg, transparent 0 3.4px, #a4a7ab 3.4px 4.4px), #2a2b2d",
          }}
        />
        {/* Trackpad */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: 31,
            height: 10,
            width: "26%",
            clipPath: DECK_CLIP(3),
            background: "linear-gradient(180deg, #cfd1d4 0%, #bcbec1 100%)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
          }}
        />
      </div>

      {/* Front lip with a small center notch */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0"
        style={{
          top: lid.h + deck.h,
          height: lip,
          borderRadius: "0 0 8px 8px",
          background: "linear-gradient(180deg, #c3c5c8 0%, #8e9194 100%)",
        }}
      >
        <span
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: 72,
            height: 3,
            borderRadius: "0 0 4px 4px",
            background: "#7a7d80",
          }}
        />
      </div>
    </DeviceRoot>
  );
}

/** Tablet in landscape: even black bezel, rounded aluminum edge, camera on the short side. */
export function TabletMockup({
  project,
  sync,
  onActivate,
  label,
  shadow = true,
  style,
}: DeviceProps) {
  return (
    <DeviceRoot
      onActivate={onActivate}
      label={label}
      width={TABLET.w}
      height={TABLET.h}
      style={style}
    >
      {shadow && <FloorShadow width="94%" height={22} opacity={0.2} bottom={-12} />}
      <div
        className="relative h-full w-full rounded-[18px]"
        style={{ padding: RIM, background: ALUMINUM }}
      >
        <div
          className="relative h-full w-full rounded-[16px]"
          style={{ background: BEZEL, padding: TABLET.bezel }}
        >
          <CameraDot size={5} style={{ left: 4.5, top: "50%", marginTop: -2.5 }} />
          <Screen
            device="tablet"
            project={project}
            sync={sync}
            width={TABLET.screen.w}
            height={TABLET.screen.h}
            missingTextSize={14}
          />
        </div>
      </div>
    </DeviceRoot>
  );
}

/** Phone in portrait: slim bezel, 34px corners, punch-hole camera, buttons on the right edge. */
export function PhoneMockup({
  project,
  sync,
  onActivate,
  label,
  shadow = true,
  style,
}: DeviceProps) {
  return (
    <DeviceRoot
      onActivate={onActivate}
      label={label}
      width={PHONE.w}
      height={PHONE.h}
      style={style}
    >
      {shadow && <FloorShadow width="110%" height={18} opacity={0.25} bottom={-10} />}
      {[
        { top: 92, height: 26 },
        { top: 132, height: 48 },
      ].map((button) => (
        <span
          key={button.top}
          aria-hidden="true"
          className="absolute -right-[2px] w-[3px] rounded-r-[2px]"
          style={{ ...button, background: "linear-gradient(90deg, #a9a9a9, #d9d9d9)" }}
        />
      ))}
      <div
        className="relative h-full w-full rounded-[34px]"
        style={{ padding: RIM, background: ALUMINUM }}
      >
        <div
          className="relative h-full w-full rounded-[32px]"
          style={{ background: BEZEL, padding: PHONE.bezel }}
        >
          <Screen
            device="mobile"
            project={project}
            sync={sync}
            width={PHONE.screen.w}
            height={PHONE.screen.h}
            missingTextSize={12}
          >
            <CameraDot
              size={8}
              style={{ top: 7, left: "50%", marginLeft: -4, zIndex: 1, background: "#050505" }}
            />
          </Screen>
        </div>
      </div>
    </DeviceRoot>
  );
}
