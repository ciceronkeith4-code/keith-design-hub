import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { TOUR_STEPS, type TourSide, type TourStep } from "./steps";

/**
 * The guided tour: the page dims, one thing stays lit, and a bubble beside it says what it is. Next and Back
 * step through; Skip, Escape, or the last Done close it. On phones the bubble docks above the bottom bar so it
 * never sits on the page's content.
 */
const PAD = 6; // light around the highlighted element
const GAP = 14; // between the highlight and the bubble
const EDGE = 12; // closest the bubble gets to the window edge
const BUBBLE_W = 288;
const DOCK = 84; // phones: the bubble's bottom edge above the window bottom, clear of the nav bar
const NEAR = 160; // phones: the arrow shows only when the highlight is this close to the bubble

type Rect = { x: number; y: number; w: number; h: number };
type Placed = { left: number; top: number; width: number; points: TourSide | null; offset: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
const isPhone = () => !window.matchMedia("(min-width: 768px)").matches;
const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const opposite: Record<TourSide, TourSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** The box around every element a step selects, or null when none is showing. */
function rectOf(step: TourStep): Rect | null {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const el of document.querySelectorAll(step.selector)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    left = Math.min(left, r.left);
    top = Math.min(top, r.top);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  return left === Infinity ? null : { x: left, y: top, w: right - left, h: bottom - top };
}

function place(spot: Rect, prefer: TourSide, height: number, phone: boolean): Placed {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = spot.x + spot.w / 2;
  const cy = spot.y + spot.h / 2;

  const lit: Rect = { x: spot.x - PAD, y: spot.y - PAD, w: spot.w + PAD * 2, h: spot.h + PAD * 2 };

  if (phone) {
    // Docked above the bottom bar, or under the header when the highlight is down there.
    const width = vw - EDGE * 2;
    const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    const bottom: Rect = { x: EDGE, y: vh - DOCK - height, w: width, h: height };
    const topDock: Rect = { x: EDGE, y: header + EDGE, w: width, h: height };
    const dock = overlaps(bottom, lit) && !overlaps(topDock, lit) ? topDock : bottom;
    const above = dock.y - (spot.y + spot.h);
    const below = spot.y - (dock.y + dock.h);
    const points: TourSide | null =
      above >= 0 && above < NEAR ? "top" : below >= 0 && below < NEAR ? "bottom" : null;
    return { left: EDGE, top: dock.y, width, points, offset: clamp(cx - EDGE, 20, width - 20) };
  }

  const at = (side: TourSide): Rect => {
    const r: Rect = { x: 0, y: 0, w: BUBBLE_W, h: height };
    if (side === "right") r.x = lit.x + lit.w + GAP;
    else if (side === "left") r.x = lit.x - GAP - BUBBLE_W;
    else r.x = cx - BUBBLE_W / 2;
    if (side === "bottom") r.y = lit.y + lit.h + GAP;
    else if (side === "top") r.y = lit.y - GAP - height;
    else r.y = cy - height / 2;
    r.x = clamp(r.x, EDGE, vw - EDGE - BUBBLE_W);
    r.y = clamp(r.y, EDGE, vh - EDGE - height);
    return r;
  };
  const order: TourSide[] = [prefer, opposite[prefer], "right", "bottom", "left", "top"];
  const side = order.find((s) => !overlaps(at(s), lit)) ?? prefer;
  const r = at(side);
  const points = opposite[side];
  const offset =
    points === "left" || points === "right"
      ? clamp(cy - r.y, 20, height - 20)
      : clamp(cx - r.x, 20, BUBBLE_W - 20);
  return { left: r.x, top: r.y, width: BUBBLE_W, points, offset };
}

/** The little triangle on the bubble's edge, pointing at the highlight. */
function arrowStyle(points: TourSide, offset: number): CSSProperties {
  const base: CSSProperties = { position: "absolute", width: 12, height: 12 };
  const line = "1px solid var(--tour-line)";
  switch (points) {
    case "left":
      return { ...base, left: -7, top: offset - 6, borderLeft: line, borderBottom: line };
    case "right":
      return { ...base, right: -7, top: offset - 6, borderRight: line, borderTop: line };
    case "top":
      return { ...base, top: -7, left: offset - 6, borderTop: line, borderLeft: line };
    case "bottom":
      return { ...base, bottom: -7, left: offset - 6, borderBottom: line, borderRight: line };
  }
}

export default function SpotlightTour({ onDone }: { onDone: () => void }) {
  // Only the steps whose element is on screen right now, fixed for this run.
  const [steps] = useState(() => TOUR_STEPS.filter((s) => rectOf(s) !== null));
  const [i, setI] = useState(0);
  const [spot, setSpot] = useState<Rect | null>(null);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [moving, setMoving] = useState(false);
  const bubble = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);

  const step = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;

  const next = useCallback(() => (last ? onDone() : setI((n) => n + 1)), [last, onDone]);
  const back = useCallback(() => setI((n) => Math.max(0, n - 1)), []);

  useEffect(() => {
    if (steps.length === 0) onDone();
  }, [steps, onDone]);

  // The page scrolls inside its pane, so put the tour back where the visitor was when it closes.
  useEffect(() => {
    const pane = document.querySelector("main > div");
    const top = pane?.scrollTop ?? 0;
    return () => pane?.scrollTo({ top });
  }, []);

  const measure = useCallback(() => setSpot(step ? rectOf(step) : null), [step]);

  useLayoutEffect(() => {
    if (!step) return;
    document.querySelector(step.selector)?.scrollIntoView({ block: "center", inline: "nearest" });
    measure();
  }, [step, measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    document.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      document.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  // After the bubble has its text, so its height is known.
  useLayoutEffect(() => {
    if (!spot || !step || !bubble.current) return;
    setPlaced(place(spot, step.placement, bubble.current.offsetHeight, isPhone()));
  }, [spot, step]);

  // The highlight glides between steps, but doesn't fly in from the corner on the first one.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMoving(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Focus Next once the bubble is showing (a hidden element can't take focus), and again whenever focus has
  // left the bubble, for instance when the Back button it was on disappears.
  const showing = placed !== null;
  useEffect(() => {
    if (showing && !bubble.current?.contains(document.activeElement)) primary.current?.focus();
  }, [showing, i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    };
    // Keep keyboard focus inside the bubble while the page behind it is dimmed.
    const onFocus = (e: FocusEvent) => {
      if (!bubble.current?.contains(e.target as Node)) primary.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
    };
  }, [next, back, onDone]);

  if (!step) return null;

  return (
    <>
      {/* Catches clicks so the page behind can't be used mid-tour. */}
      <div className="fixed inset-0 z-[70] overflow-hidden select-none" aria-hidden="true">
        {spot && (
          <div
            className={`tour-hole ${moving ? "is-moving" : ""}`}
            style={{
              width: spot.w + PAD * 2,
              height: spot.h + PAD * 2,
              transform: `translate(${spot.x - PAD}px, ${spot.y - PAD}px)`,
            }}
          />
        )}
      </div>

      <div
        ref={bubble}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
        onKeyDown={(e) => {
          if (e.key !== "Tab" || !bubble.current) return;
          const items = [...bubble.current.querySelectorAll("button")];
          const first = items[0];
          const end = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            end.focus();
          } else if (!e.shiftKey && document.activeElement === end) {
            e.preventDefault();
            first.focus();
          }
        }}
        className="tour-bubble fixed z-[72] rounded-xl border border-[#E5E5E0] bg-white p-4 text-left shadow-xl [--tour-line:#E5E5E0] dark:border-[#262626] dark:bg-[#141414] dark:[--tour-line:#262626]"
        style={{
          left: placed?.left ?? 0,
          top: placed?.top ?? 0,
          width: placed?.width ?? BUBBLE_W,
          visibility: placed ? "visible" : "hidden",
        }}
      >
        {placed?.points && (
          <span
            aria-hidden="true"
            className="bg-white dark:bg-[#141414]"
            style={{ ...arrowStyle(placed.points, placed.offset), transform: "rotate(45deg)" }}
          />
        )}

        <h2 id="tour-title" className="text-sm font-semibold text-[#161616] dark:text-[#EDEDED]">
          {step.title}
        </h2>
        <p
          id="tour-text"
          className="mt-1 text-sm leading-relaxed text-[#62655E] dark:text-[#A3A3A3]"
          aria-live="polite"
        >
          {step.text}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {steps.map((s, k) => (
              <span
                key={s.selector}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${
                  k === i
                    ? "w-4 bg-[#161616] dark:bg-[#EDEDED]"
                    : "w-1.5 bg-[#C9CCC4] dark:bg-[#3A3A3A]"
                }`}
              />
            ))}
          </div>
          <span className="sr-only">
            Step {i + 1} of {steps.length}
          </span>
          <span className="flex-1" />
          {!last && (
            <button
              type="button"
              onClick={onDone}
              className="h-9 rounded-md px-2.5 text-sm text-[#62655E] hover:text-[#161616] dark:text-[#A3A3A3] dark:hover:text-[#EDEDED] cursor-pointer"
            >
              Skip
            </button>
          )}
          {i > 0 && (
            <button
              type="button"
              onClick={back}
              className="h-9 rounded-md border border-[#E5E5E0] px-3.5 text-sm font-medium text-[#161616] hover:bg-black/5 dark:border-[#262626] dark:text-[#EDEDED] dark:hover:bg-white/5 cursor-pointer"
            >
              Back
            </button>
          )}
          <button
            ref={primary}
            type="button"
            onClick={next}
            className="h-9 rounded-md bg-[#161616] px-4 text-sm font-medium text-white hover:bg-[#333333] dark:bg-[#EDEDED] dark:text-[#161616] dark:hover:bg-white cursor-pointer"
          >
            {last ? (step.next ?? "Done") : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}
