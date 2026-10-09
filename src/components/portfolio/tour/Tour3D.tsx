import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { HeroCanvas } from "./HeroCanvas";
import { HERO_GLB } from "./GlbHero";
import { setTourDone } from "./flags";
import { HAND_RISE, hero, type HeroAction } from "./hero-store";
import { TOUR_STEPS, type TourStep } from "./steps";

/**
 * The guided tour: a 3D hero (HeroCanvas) moves around the real page to each step's element. Far targets
 * are reached by shooting a cable to an anchor above and swinging on a pendulum arc (Jumping → FallingIdle →
 * HangingIdle); close ones by climbing along the edges (Climbing). On arrival he points, a soft spotlight
 * cuts the target out of a dimmed page, and a bubble shows the step with Back, Skip and Next.
 *
 * This module (with three.js, React Three Fiber and GSAP) loads only when the tour starts.
 */
const N = TOUR_STEPS.length;
// Farther than this (px between his feet and the destination) he swings; closer, he climbs.
const FAR_DESKTOP = 240;
const FAR_PHONE = 170;
const GAP = 16;
const CLIMB_SPEED = 260;
const BUBBLE_W = 280;
const BUBBLE_H = 168;
// Soft edge of the spotlight cutout, px.
const FEATHER = 14;

type Box = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
type Spot = { x: number; y: number; hang: boolean };

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const isPhone = () => !window.matchMedia("(min-width: 768px)").matches;
const ceilingY = () => document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
// His feet on the floor: above the phone's bottom nav, or near the bottom edge on desktop.
const floorY = () => window.innerHeight - (isPhone() ? 84 : 16);
const heroWidth = () => hero.height * 0.42;

function boxOf(step: TourStep): Box | null {
  if (!step.selector) return null;
  const el = document.querySelector(step.selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return {
    left: r.left,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  };
}

/** Where he goes for a step: beside its element on the step's side (above it on phones). */
function spotFor(step: TourStep, box: Box | null): Spot {
  const vw = window.innerWidth;
  const h = hero.height;
  const w = heroWidth();
  const floor = floorY();
  if (!box) return { x: vw * (isPhone() ? 0.5 : 0.36), y: floor, hang: false };
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  let x: number;
  let y: number;
  switch (isPhone() ? "top" : step.placement) {
    case "right":
      x = box.right + GAP + w / 2;
      y = cy + h * 0.5;
      break;
    case "left":
      x = box.left - GAP - w / 2;
      y = cy + h * 0.5;
      break;
    case "bottom":
      x = cx;
      y = box.bottom + GAP / 2 + h;
      break;
    default:
      x = cx;
      y = box.top - GAP / 2;
  }
  x = clamp(x, w / 2 + 8, vw - w / 2 - 8);
  y = clamp(y, ceilingY() + h + 8, floor);
  // Close to the floor, he just stands on it rather than dangling on a long cable.
  if (y > floor - h * 0.6) y = floor;
  return { x, y, hang: y < floor - 2 };
}

/** The bubble: beside him on desktop, below the target on phones (above it if there's no room). */
function bubbleFor(box: Box | null, spot: Spot): CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const bw = Math.min(BUBBLE_W, vw - 24);
  const h = hero.height;
  const w = heroWidth();
  const heroTop = spot.y - h;
  if (!box)
    return { left: clamp(spot.x - bw / 2, 12, vw - 12 - bw), bottom: vh - heroTop + 12, width: bw };
  if (isPhone()) {
    const left = clamp(box.left + box.width / 2 - bw / 2, 12, vw - 12 - bw);
    if (box.bottom + 12 + BUBBLE_H <= vh - 88) return { left, top: box.bottom + 12, width: bw };
    return { left, bottom: vh - Math.min(heroTop, box.top) + 12, width: bw };
  }
  const top = clamp(heroTop + h * 0.1, 12, vh - BUBBLE_H - 12);
  if (spot.x + w / 2 + 14 + bw <= vw - 12) return { left: spot.x + w / 2 + 14, top, width: bw };
  if (spot.x - w / 2 - 14 - bw >= 12) return { left: spot.x - w / 2 - 14 - bw, top, width: bw };
  return {
    left: clamp(spot.x - bw / 2, 12, vw - 12 - bw),
    top: clamp(spot.y + 12, 12, vh - BUBBLE_H - 12),
    width: bw,
  };
}

function setAction(action: HeroAction) {
  hero.action = action;
}

export default function Tour3D({ onDone }: { onDone: () => void }) {
  const [glb, setGlb] = useState<boolean | null>(null);
  const [step, setStep] = useState(-1);
  const [talking, setTalking] = useState(false);
  const [bubble, setBubble] = useState<CSSProperties | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const spotlight = useRef({ l: 0, t: 0, r: 0, b: 0, on: 0 });
  const stepRef = useRef(-1);
  const started = useRef(false);
  const moving = useRef(false);
  const ending = useRef(false);
  const reduced = useRef(false);

  // Is there a hero.glb? Without one (or if it's the site's 404 page), the placeholder hero is used.
  useEffect(() => {
    let cancelled = false;
    fetch(HERO_GLB, { method: "HEAD" })
      .then(
        (r) =>
          !cancelled &&
          setGlb(r.ok && !(r.headers.get("content-type") ?? "").includes("text/html")),
      )
      .catch(() => !cancelled && setGlb(false));
    return () => {
      cancelled = true;
    };
  }, []);

  /** Paints the dimmed page with a soft rectangular hole at the spotlight. */
  const paintSpotlight = useCallback(() => {
    const el = dimRef.current;
    if (!el) return;
    const { l, t, r, b, on } = spotlight.current;
    const x = `linear-gradient(to right, #000 ${l - FEATHER}px, transparent ${l}px, transparent ${r}px, #000 ${r + FEATHER}px)`;
    const y = `linear-gradient(to bottom, #000 ${t - FEATHER}px, transparent ${t}px, transparent ${b}px, #000 ${b + FEATHER}px)`;
    el.style.maskImage = `${x}, ${y}`;
    el.style.webkitMaskImage = `${x}, ${y}`;
    el.style.opacity = `${on}`;
  }, []);

  const moveSpotlight = useCallback(
    (box: Box | null, instant = false) => {
      const target = box
        ? { l: box.left - 6, t: box.top - 6, r: box.right + 6, b: box.bottom + 6, on: 1 }
        : { ...spotlight.current, on: 0 };
      gsap.to(spotlight.current, {
        ...target,
        duration: instant || reduced.current ? 0 : 0.45,
        ease: "power2.out",
        onUpdate: paintSpotlight,
      });
    },
    [paintSpotlight],
  );

  /** The moves from where he is to `to`, as one GSAP timeline. */
  const travel = useCallback((to: Spot, done: () => void) => {
    timeline.current?.kill();
    const tl = gsap.timeline({ onComplete: done });
    timeline.current = tl;
    const h = hero.height;
    const ceiling = ceilingY();
    const settle = () => {
      if (to.hang) {
        // Hold a short cable straight up to whatever is above.
        tl.call(() => {
          Object.assign(hero.cable, { on: true, ax: to.x, ay: ceiling, grow: 0 });
          hero.hanging = true;
          setAction("HangingIdle");
        });
        tl.to(hero.cable, { grow: 1, duration: 0.14, ease: "power1.out" });
        tl.to({}, { duration: 0.2 });
      } else {
        tl.call(() => {
          hero.cable.on = false;
          hero.hanging = false;
          setAction("Idle");
        });
      }
    };

    if (reduced.current) {
      // Reduced motion: no swinging, just a fade between stops.
      tl.to(wrapRef.current, { opacity: 0, duration: 0.18 });
      tl.call(() => {
        hero.x = to.x;
        hero.y = to.y;
        hero.cable.on = false;
      });
      settle();
      tl.to(wrapRef.current, { opacity: 1, duration: 0.18 });
      return;
    }

    const from = { x: hero.x, y: hero.y };
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const far = distance > (isPhone() ? FAR_PHONE : FAR_DESKTOP);
    tl.call(() => {
      hero.cable.on = false;
      hero.hanging = false;
      if (Math.abs(to.x - from.x) > 4) hero.facing = to.x > from.x ? 1 : -1;
    });

    if (far) {
      // Hop, shoot a cable to an anchor above, and swing to the target on a pendulum arc.
      const hop = Math.min(40, h * 0.4);
      tl.call(() => setAction("Jumping"));
      tl.to(hero, { y: from.y - hop, duration: 0.28, ease: "power2.out" });
      const start = { x: from.x, y: from.y - hop - h * HAND_RISE };
      const end = { x: to.x, y: to.y - h * HAND_RISE };
      const anchor = {
        x: (start.x + end.x) / 2,
        y: clamp(Math.min(ceiling, Math.min(start.y, end.y) - 60), 4, Infinity),
      };
      tl.call(() => Object.assign(hero.cable, { on: true, ax: anchor.x, ay: anchor.y, grow: 0 }));
      tl.to(hero.cable, { grow: 1, duration: 0.16, ease: "power1.out" });
      const a0 = Math.atan2(start.x - anchor.x, start.y - anchor.y);
      const a1 = Math.atan2(end.x - anchor.x, end.y - anchor.y);
      const r0 = Math.hypot(start.x - anchor.x, start.y - anchor.y);
      const r1 = Math.hypot(end.x - anchor.x, end.y - anchor.y);
      const dip = Math.min(60, distance * 0.08);
      const arc = { t: 0 };
      tl.call(() => setAction("FallingIdle"));
      tl.to(arc, {
        t: 1,
        duration: clamp(0.75 + Math.abs(a1 - a0) * 0.3 + distance / 2400, 0.8, 1.5),
        ease: "sine.inOut",
        onUpdate: () => {
          const a = lerp(a0, a1, arc.t);
          // The cable stretches a little mid-swing, so he dips through the bottom of the arc.
          const r = lerp(r0, r1, arc.t) + Math.sin(arc.t * Math.PI) * dip;
          hero.x = anchor.x + r * Math.sin(a);
          hero.y = anchor.y + r * Math.cos(a) + h * HAND_RISE;
        },
      });
      tl.call(() => setAction("HangingIdle"));
    } else {
      // Climb along the edges: up or down first, then across.
      tl.call(() => setAction("Climbing"));
      const path = Math.abs(to.y - from.y) > 4 ? [{ x: from.x, y: to.y }, to] : [to];
      let at = from;
      for (const p of path) {
        const leg = Math.hypot(p.x - at.x, p.y - at.y);
        if (leg < 1) continue;
        tl.to(hero, { x: p.x, y: p.y, duration: Math.max(0.25, leg / CLIMB_SPEED), ease: "none" });
        at = p;
      }
    }
    settle();
  }, []);

  /** On arrival: face and point at the target (or wave), then show the bubble. */
  const arrive = useCallback((i: number, box: Box | null, spot: Spot) => {
    if (box) {
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      if (Math.abs(cx - hero.x) > 4) hero.facing = cx > hero.x ? 1 : -1;
      const shoulderY = hero.y - hero.height * 0.8;
      hero.aim = Math.atan2(shoulderY - cy, Math.abs(cx - hero.x) + 1);
      setAction("Pointing");
    } else {
      setAction("Waving");
    }
    setBubble(bubbleFor(box, spot));
    setTalking(true);
    stepRef.current = i;
  }, []);

  const finish = useCallback(() => {
    if (ending.current) return;
    ending.current = true;
    setTourDone(true);
    setTalking(false);
    timeline.current?.kill();
    moveSpotlight(null);
    setAction("Waving");
    gsap.to(wrapRef.current, {
      opacity: 0,
      duration: 0.6,
      delay: 0.7,
      ease: "power1.in",
      onComplete: onDone,
    });
  }, [moveSpotlight, onDone]);

  const goTo = useCallback(
    (index: number, direction: 1 | -1 = 1) => {
      let i = index;
      while (i >= 0 && i < N && TOUR_STEPS[i].selector && !boxOf(TOUR_STEPS[i])) i += direction;
      if (i < 0) i = 0;
      if (i >= N) {
        finish();
        return;
      }
      const s = TOUR_STEPS[i];
      setStep(i);
      setTalking(false);
      stepRef.current = i;
      const go = () => {
        const box = boxOf(s);
        const spot = spotFor(s, box);
        moveSpotlight(box);
        moving.current = true;
        travel(spot, () => {
          moving.current = false;
          arrive(i, box, spot);
        });
      };
      // Scroll the target into view first if it's off screen.
      const el = s.selector ? document.querySelector(s.selector) : null;
      const r = el?.getBoundingClientRect();
      if (el && r && (r.top < ceilingY() || r.bottom > floorY() - hero.height)) {
        el.scrollIntoView({ block: "center", behavior: reduced.current ? "auto" : "smooth" });
        window.setTimeout(go, reduced.current ? 0 : 450);
      } else go();
    },
    [arrive, finish, moveSpotlight, travel],
  );

  // The canvas is up (and the hero model loaded): bring him in from off screen.
  const onReady = useCallback(() => {
    if (started.current) return;
    started.current = true;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    hero.height = isPhone() ? 64 : 96;
    hero.x = -hero.height;
    hero.y = floorY() - hero.height * 1.8;
    hero.facing = 1;
    hero.cable.on = false;
    hero.hanging = false;
    setAction("FallingIdle");
    gsap.to(wrapRef.current, { opacity: 1, duration: 0.3 });
    goTo(0);
  }, [goTo]);

  // Escape skips. On resize or scroll, the hero, spotlight and bubble snap to the current step's element.
  useEffect(() => {
    let frame = 0;
    const realign = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const i = stepRef.current;
        if (i < 0 || moving.current || ending.current) return;
        hero.height = isPhone() ? 64 : 96;
        const box = boxOf(TOUR_STEPS[i]);
        const spot = spotFor(TOUR_STEPS[i], box);
        hero.x = spot.x;
        hero.y = spot.y;
        hero.hanging = spot.hang;
        Object.assign(hero.cable, { on: spot.hang, ax: spot.x, ay: ceilingY(), grow: 1 });
        moveSpotlight(box, true);
        setBubble(bubbleFor(box, spot));
      });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("resize", realign);
    document.addEventListener("scroll", realign, { capture: true, passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", realign);
      document.removeEventListener("scroll", realign, { capture: true });
      window.removeEventListener("keydown", onKey);
    };
  }, [finish, moveSpotlight]);

  useEffect(
    () => () => {
      timeline.current?.kill();
      gsap.killTweensOf(spotlight.current);
      hero.cable.on = false;
    },
    [],
  );

  const current = step >= 0 ? TOUR_STEPS[step] : null;
  const last = step === N - 1;

  return (
    <>
      <div
        ref={dimRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[68] bg-black/45"
        style={{ opacity: 0 }}
      />
      <div
        ref={wrapRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70]"
        style={{ opacity: 0 }}
      >
        {glb !== null && <HeroCanvas glb={glb} onReady={onReady} />}
      </div>

      {talking && current && bubble && (
        <div
          role="dialog"
          aria-labelledby="tour-title"
          className="tour-bubble fixed z-[72] rounded-xl border border-[#E5E5E0] bg-white p-4 text-left shadow-xl dark:border-[#262626] dark:bg-[#141414]"
          style={bubble}
        >
          <p id="tour-title" className="text-sm font-semibold text-[#161616] dark:text-[#EDEDED]">
            {current.title}
          </p>
          <p
            className="mt-1 text-[13px] leading-snug text-[#4A4D47] dark:text-[#C8C8C8]"
            aria-live="polite"
          >
            {current.text}
          </p>
          <div className="mt-3.5 flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] text-[#8A8D86]">
              {step + 1}/{N}
            </span>
            <div className="flex items-center gap-2">
              {!last && (
                <button
                  type="button"
                  onClick={finish}
                  className="px-1 text-[11px] text-[#62655E] underline-offset-2 hover:underline dark:text-[#A3A3A3]"
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                onClick={() => goTo(step - 1, -1)}
                disabled={step === 0}
                className="rounded-md border border-[#E5E5E0] px-2.5 py-1.5 text-[11px] font-medium text-[#161616] hover:bg-black/5 disabled:opacity-40 dark:border-[#262626] dark:text-[#EDEDED] dark:hover:bg-white/5"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => (last ? finish() : goTo(step + 1))}
                className="rounded-md bg-[#161616] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#333333] dark:bg-[#EDEDED] dark:text-[#161616] dark:hover:bg-white"
              >
                {current.next ?? "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
