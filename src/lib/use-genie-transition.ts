import { animate, motionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * useGenieTransition: opens a panel out of a launcher button and sucks it back in, like a window minimising into
 * the macOS Dock. Reusable for any floating panel or modal.
 *
 * How it works. One number, `p`, runs from 0 (tucked into the launcher) to 1 (fully open) and is moved by a
 * spring. Every frame the panel's transform, clip-path, opacity and blur are worked out from `p` and written
 * straight to the element, so React never re-renders during the animation (a long message list costs nothing).
 * Because everything comes from `p`, pressing the launcher mid-flight just aims the spring the other way from
 * wherever it is, keeping its speed, so the motion reverses smoothly. Only transform, clip-path, opacity and
 * filter are animated, and `will-change` is set only while it moves.
 *
 * Open: the panel starts as a thin pinched sliver at the launcher, stretches out, widens, overshoots a couple of
 * percent and settles; its content fades in a moment after the shape has finished. Close: the content fades out
 * first, then the shape tapers like a funnel (the edge nearest the launcher pinches the most), narrows faster than
 * it shortens, blurs and fades in the last stretch, and flows into the launcher, which gives a small "receive" pulse.
 *
 * Wiring (see AskPanel.tsx):
 *   const genie = useGenieTransition({ open, getLauncher, onRequestClose });
 *   <section ref={genie.panelRef} className="genie-panel ...">
 *     <header ref={genie.handleRef} className="genie-handle ..."> (the swipe-to-close handle, phones only)
 *     <div ref={genie.contentRef}> ...the panel's contents... </div>
 *   </section>
 * and give the launcher's icons the .genie-icon-chat / .genie-icon-x classes (styles.css) to morph with the panel.
 * The panel must be position: fixed (its offsets are read to place the animation's origin).
 *
 * The panel stays mounted while closed (hidden with visibility, and inert), so opening never re-creates it.
 * `data-genie-state` on the panel is "closed", "opening", "open" or "closing".
 */

// ---------------------------------------------------------------------------------------------------------------
// TWEAK ME. Everything that shapes the feel is here.
// ---------------------------------------------------------------------------------------------------------------
export const GENIE = {
  // Springs (framer-motion: stiffness, damping, mass). There is no fixed duration; it comes out of these numbers.
  // Timings below were measured by simulating the physics (settled = within 1% of the target):
  //   open:  about 450 ms on screen, overshoots the final size by about 2%.
  //   close: about 350 ms for the shape (plus the short content fade before it), critically damped so it never
  //          overshoots (a negative size would invert the shape). That is a little quicker than opening, like macOS.
  // Stiffer = faster and snappier. More damping = less overshoot. 320 / 30 / 0.9 on its own settles in ~260 ms.
  open: { stiffness: 220, damping: 22, mass: 0.9 },
  close: { stiffness: 320, damping: 33.9, mass: 0.9 },

  // Funnel shape.
  taper: 0.9, // 0 to 1. How hard the edge nearest the launcher is pinched. 0 = no taper, only the scale squash.
  farTaper: 0.3, // 0 to 1. How much of that pinch the far edge also gets (smaller = more funnel-like).
  slotPx: 36, // Width of the pinched end where the panel meets the launcher, in px.
  minScale: 0.04, // Size of the panel (as a fraction) when it is fully tucked into the launcher.
  widthCurve: 1.3, // Above 1: the width shrinks faster than the height on close (and trails on open).
  heightCurve: 1, // 1 = height follows the spring one to one. Together with widthCurve it sets the overshoot.

  // Soft focus near the closed end, so the squashed content doesn't look jagged.
  blurPx: 4, // Maximum blur in px.
  blurFrom: 0.7, // Blur and fade only happen in the last (1 - blurFrom) of the way to closed: 0.7 = last 30%.

  // Content (header, messages, input) fades separately from the shape.
  contentRiseAt: 0.96, // On open, content starts once the shape is this far along (1 = fully open).
  contentDelayMs: 100, // ...and this long after that.
  contentFadeInMs: 140,
  contentFadeOutMs: 80, // On close the content fades out first, then the shape moves.
  contentSlidePx: 6, // How far the content slides while it fades.

  // The launcher's "receive" pulse when the panel arrives: scale 1 -> pulseScale -> 1.
  pulseScale: 1.08,
  pulseMs: 260,
  pulseAt: 0.08, // Fires when the panel is this close to fully closed.

  // Swipe-down to close (phones).
  dismissPx: 90, // Drag at least this far to close...
  dismissVelocity: 0.55, // ...or flick faster than this (px per ms).

  // prefers-reduced-motion: a plain fade, no movement or distortion.
  reducedMotionMs: 150,

  // The clip-path starts this far outside the panel so its drop shadow isn't cut off.
  shadowMarginPx: 64,
};
export type GenieConfig = typeof GENIE;

export type GenieOptions = {
  /** Whether the panel should be open. */
  open: boolean;
  /** The launcher button the panel comes out of. Measured fresh at the start of every open or close. */
  getLauncher: () => HTMLElement | null;
  /** Called when the user dismisses the panel by swiping it down or clicking outside it. */
  onRequestClose?: () => void;
  /** Close on a click or tap outside the panel and the launcher. Off by default. */
  closeOnOutsideClick?: boolean;
  /** Keep Tab and Shift+Tab inside the panel while focus is in it. On by default. */
  trapFocus?: boolean;
  /** Swipe down on the handle to close while this media query matches. False turns it off. */
  swipeToClose?: string | false;
  /** Override any of the GENIE values. */
  config?: Partial<GenieConfig>;
};

type Geometry = { width: number; height: number; ox: number; oy: number; near: "top" | "bottom" };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (from: number, to: number, x: number) => {
  const t = clamp01((x - from) / (to - from));
  return t * t * (3 - 2 * t);
};
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Read = () => {
  panel: HTMLElement | null;
  content: HTMLElement | null;
  opts: GenieOptions;
  cfg: GenieConfig;
};

/** The animation itself. Plain functions and numbers, no React, so a re-render can't disturb a running animation. */
function createEngine(read: Read) {
  const p = motionValue(0); // 0 = tucked into the launcher, 1 = open. Passes 1 briefly: the overshoot.
  const c = motionValue(0); // 0 to 1: how visible the content is.
  const drag = motionValue(0); // px the panel has been pulled down by a swipe.
  let geo: Geometry | null = null;
  let token = 0; // bumped whenever the animation is interrupted, so stale callbacks do nothing
  let moving = false;
  let reduced = false;
  let running: { stop: () => void }[] = [];
  let timer = 0;
  let unwatch: (() => void) | null = null;

  // The launcher element, looked up again at the start of each open or close rather than on every frame.
  let launcherEl: HTMLElement | null = null;
  const launcher = () => launcherEl ?? (launcherEl = read().opts.getLauncher());

  /** Where the launcher is, relative to the panel's own corner. Layout offsets ignore transforms. */
  function measure(): Geometry | null {
    const { panel } = read();
    if (!panel) return null;
    launcherEl = read().opts.getLauncher();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const rect = launcherEl?.getBoundingClientRect();
    let ox = width;
    let oy = -20;
    let near: Geometry["near"] = "top";
    if (rect) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      ox = cx - panel.offsetLeft;
      oy = cy - panel.offsetTop;
      near = cy < panel.offsetTop + height / 2 ? "top" : "bottom";
    }
    panel.style.transformOrigin = `${ox}px ${oy}px`;
    geo = { width, height, ox, oy, near };
    return geo;
  }

  /** Writes the current frame. Called whenever p, c or drag changes. */
  function paint() {
    const { panel, content, cfg } = read();
    if (!panel) return;
    const pv = p.get();
    const cv = clamp01(c.get());
    const dy = drag.get();
    launcher()?.style.setProperty("--genie-p", clamp01(pv).toFixed(3));
    if (content) {
      content.style.opacity = cv >= 1 ? "" : String(cv);
      content.style.transform =
        cv >= 1 ? "" : `translateY(${((1 - cv) * cfg.contentSlidePx).toFixed(2)}px)`;
    }

    if (reduced) {
      panel.style.opacity = pv >= 1 ? "" : String(clamp01(pv));
      panel.style.transform = dy > 0.5 ? `translateY(${dy}px)` : "";
      panel.style.clipPath = "";
      panel.style.filter = "";
      return;
    }
    if (Math.abs(pv - 1) < 0.0005 && Math.abs(dy) < 0.5) {
      // Fully open: leave nothing behind, so the panel is an ordinary element again.
      panel.style.transform = "";
      panel.style.clipPath = "";
      panel.style.filter = "";
      panel.style.opacity = "";
      return;
    }

    const g = geo ?? measure();
    if (!g) return;
    const pp = Math.max(pv, 0);
    const sx = lerp(cfg.minScale, 1, Math.pow(pp, cfg.widthCurve));
    const sy = lerp(cfg.minScale, 1, Math.pow(pp, cfg.heightCurve));
    const closed = clamp01(1 - pv); // 0 open, 1 closed
    const soft = smoothstep(cfg.blurFrom, 1, closed); // 0 until the last stretch, then up to 1

    // Funnel: the edge nearest the launcher is pulled in toward the launcher's x, the far edge only a little.
    const M = cfg.shadowMarginPx;
    const pinch = clamp01(cfg.taper * closed * 1.6);
    const farPinch = pinch * cfg.farTaper;
    const ox = Math.min(g.width, Math.max(0, g.ox));
    const half = cfg.slotPx / 2;
    const nearY = g.near === "top" ? -M : g.height + M;
    const farY = g.near === "top" ? g.height + M : -M;
    const nearL = lerp(-M, ox - half, pinch);
    const nearR = lerp(g.width + M, ox + half, pinch);
    const farL = lerp(-M, ox - half, farPinch);
    const farR = lerp(g.width + M, ox + half, farPinch);

    panel.style.transform = `translate3d(0, ${dy.toFixed(2)}px, 0) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    panel.style.clipPath = `polygon(${nearL.toFixed(1)}px ${nearY}px, ${nearR.toFixed(1)}px ${nearY}px, ${farR.toFixed(1)}px ${farY}px, ${farL.toFixed(1)}px ${farY}px)`;
    panel.style.opacity = String(
      ((1 - soft) * (1 - Math.min(Math.max(dy, 0) / 320, 0.4))).toFixed(3),
    );
    panel.style.filter = soft > 0.02 ? `blur(${(cfg.blurPx * soft).toFixed(2)}px)` : "";
  }

  const stopAll = () => {
    token++;
    for (const run of running) run.stop();
    running = [];
    window.clearTimeout(timer);
    unwatch?.();
    unwatch = null;
  };

  function pulse() {
    const { cfg } = read();
    if (reduced) return;
    launcher()?.animate(
      [
        { transform: "scale(1)" },
        { transform: `scale(${cfg.pulseScale})`, offset: 0.4 },
        { transform: "scale(1)" },
      ],
      { duration: cfg.pulseMs, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
    );
  }

  /** Sets the panel's resting state without animating (first render). */
  function init(open: boolean) {
    const { panel } = read();
    if (!panel) return;
    p.set(open ? 1 : 0);
    c.set(open ? 1 : 0);
    drag.set(0);
    moving = false;
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel.dataset.genieState = open ? "open" : "closed";
    if (!open) {
      panel.inert = true;
      panel.setAttribute("aria-hidden", "true");
    }
    paint();
  }

  /** Aims the animation at open or closed, from wherever it currently is. */
  function start(open: boolean) {
    const { panel, cfg } = read();
    if (!panel) return;
    const wasMoving = moving;
    stopAll();
    const mine = token;
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!wasMoving || !geo) measure(); // a fresh start reads the launcher's position again; a reversal keeps its origin
    moving = true;
    panel.style.willChange = reduced ? "opacity" : "transform, clip-path, filter, opacity";
    const fixed = reduced
      ? { duration: cfg.reducedMotionMs / 1000, ease: "linear" as const }
      : null;

    const finish = (state: "open" | "closed") => () => {
      if (mine !== token) return;
      moving = false;
      p.set(state === "open" ? 1 : 0);
      if (state === "closed") c.set(0);
      panel.dataset.genieState = state;
      panel.style.willChange = "";
      paint();
    };

    if (open) {
      panel.inert = false;
      panel.removeAttribute("aria-hidden");
      panel.dataset.genieState = "opening";
      if (drag.get() !== 0) running.push(animate(drag, 0, { type: "spring", ...cfg.open }));

      if (fixed) {
        c.set(1);
        running.push(animate(p, 1, { ...fixed, onComplete: finish("open") }));
        return;
      }
      running.push(
        animate(p, 1, {
          type: "spring",
          ...cfg.open,
          // Done once within 0.1% of full size (under half a pixel) and nearly still.
          restDelta: 0.001,
          restSpeed: 0.05,
          onComplete: finish("open"),
        }),
      );
      // The content waits for the shape to be (nearly) finished, then fades in.
      const fadeIn = () => {
        if (mine === token)
          running.push(animate(c, 1, { duration: cfg.contentFadeInMs / 1000, ease: EASE_OUT }));
      };
      if (p.get() >= cfg.contentRiseAt) {
        fadeIn();
      } else {
        unwatch = p.on("change", (v) => {
          if (v < cfg.contentRiseAt) return;
          unwatch?.();
          unwatch = null;
          timer = window.setTimeout(fadeIn, cfg.contentDelayMs);
        });
      }
      return;
    }

    // Closing. If focus is inside the panel, hand it back to the launcher before the panel goes inert.
    if (document.activeElement && panel.contains(document.activeElement)) {
      launcher()?.focus({ preventScroll: true });
    }
    panel.inert = true;
    panel.setAttribute("aria-hidden", "true");
    panel.dataset.genieState = "closing";
    if (drag.get() !== 0) running.push(animate(drag, 0, { type: "spring", ...cfg.close }));

    const collapse = () => {
      if (mine !== token) return;
      if (fixed) {
        running.push(animate(p, 0, { ...fixed, onComplete: finish("closed") }));
        return;
      }
      running.push(
        animate(p, 0, {
          type: "spring",
          ...cfg.close,
          // By 1% of the way the panel is already blurred out and invisible, so stop there.
          restDelta: 0.01,
          restSpeed: 0.2,
          onComplete: finish("closed"),
        }),
      );
      unwatch = p.on("change", (v) => {
        if (v > cfg.pulseAt) return;
        unwatch?.();
        unwatch = null;
        pulse();
      });
    };
    if (fixed) {
      c.set(0);
      collapse();
    } else if (c.get() > 0.01) {
      running.push(
        animate(c, 0, {
          duration: cfg.contentFadeOutMs / 1000,
          ease: EASE_OUT,
          onComplete: collapse,
        }),
      );
    } else {
      collapse();
    }
  }

  const springBack = () => {
    const { cfg } = read();
    running.push(
      animate(drag, 0, { type: "spring", stiffness: 420, damping: 34, mass: cfg.close.mass }),
    );
  };

  const watchers = [p.on("change", paint), c.on("change", paint), drag.on("change", paint)];
  const destroy = () => {
    stopAll();
    for (const stop of watchers) stop();
  };

  return { p, drag, init, start, springBack, destroy, isMoving: () => moving };
}
type Engine = ReturnType<typeof createEngine>;

export function useGenieTransition(options: GenieOptions) {
  const panelRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const latest = useRef({ options, cfg: { ...GENIE, ...options.config } as GenieConfig });
  const started = useRef(false);

  // Always read the newest options from inside the engine and the event handlers.
  useLayoutEffect(() => {
    latest.current = { options, cfg: { ...GENIE, ...options.config } as GenieConfig };
  });

  // Open or close.
  useLayoutEffect(() => {
    if (!engineRef.current) {
      engineRef.current = createEngine(() => ({
        panel: panelRef.current,
        content: contentRef.current,
        opts: latest.current.options,
        cfg: latest.current.cfg,
      }));
    }
    const engine = engineRef.current;
    if (!started.current) {
      started.current = true;
      engine.init(options.open);
      return;
    }
    // Already settled where it should be (e.g. React re-running effects in development): nothing to do.
    const target = options.open ? 1 : 0;
    if (!engine.isMoving() && Math.abs(engine.p.get() - target) < 0.001) return;
    engine.start(options.open);
  }, [options.open]);

  useEffect(
    () => () => {
      engineRef.current?.destroy();
      engineRef.current = null;
      started.current = false;
    },
    [],
  );

  // Keep Tab inside the panel while focus is in it.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key !== "Tab" ||
        latest.current.options.trapFocus === false ||
        !latest.current.options.open
      )
        return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0,
      );
      if (items.length === 0) {
        e.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, []);

  // Optional: a click or tap outside closes the panel.
  const outside = options.closeOnOutsideClick === true;
  useEffect(() => {
    if (!outside) return;
    const onDown = (e: PointerEvent) => {
      const { open, getLauncher, onRequestClose } = latest.current.options;
      const target = e.target as Node | null;
      if (!open || !target || panelRef.current?.contains(target) || getLauncher()?.contains(target))
        return;
      onRequestClose?.();
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [outside]);

  // Swipe down on the handle to close. The panel follows the finger, then either flows into the launcher or springs back.
  const swipe = options.swipeToClose ?? "(max-width: 767px)";
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle || swipe === false) return;
    const query = window.matchMedia(swipe);
    let active = false;
    let startY = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;
    const onDown = (e: PointerEvent) => {
      const engine = engineRef.current;
      if (!engine || !query.matches || !latest.current.options.open || engine.isMoving()) return;
      if ((e.target as Element).closest("button, a, input, textarea")) return;
      active = true;
      startY = lastY = e.clientY;
      lastT = e.timeStamp;
      velocity = 0;
      handle.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const dy = e.clientY - startY;
      engineRef.current?.drag.set(dy > 0 ? dy : dy * 0.15); // a little give upward, full follow downward
      const dt = Math.max(1, e.timeStamp - lastT);
      velocity = 0.7 * velocity + 0.3 * ((e.clientY - lastY) / dt);
      lastY = e.clientY;
      lastT = e.timeStamp;
    };
    const onUp = () => {
      if (!active) return;
      active = false;
      const engine = engineRef.current;
      if (!engine) return;
      const { cfg, options: o } = latest.current;
      if (engine.drag.get() >= cfg.dismissPx || velocity >= cfg.dismissVelocity) {
        o.onRequestClose?.();
        // If the owner didn't close it, don't leave the panel hanging half-pulled.
        window.setTimeout(() => {
          if (latest.current.options.open) engineRef.current?.springBack();
        }, 0);
      } else {
        engine.springBack();
      }
    };
    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
    return () => {
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };
  }, [swipe]);

  return { panelRef, contentRef, handleRef };
}
