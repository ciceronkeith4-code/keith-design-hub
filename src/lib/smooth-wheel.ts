import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

/**
 * Smooth wheel scrolling for the content pane. A mouse wheel normally moves the page in ~100px jumps; here each
 * notch moves a target instead, and the pane glides toward it every frame, at whatever rate the screen refreshes
 * (60 Hz, 120 Hz or more). Touch, the keyboard and the scrollbar stay native, and so does any inner area that can
 * still scroll that way (a device screen on the Work page), so it scrolls first and the page takes over at its end.
 * Off with reduced motion.
 */

// How quickly the pane catches up: the distance left halves every HALF_LIFE ms. Lower is snappier.
const HALF_LIFE = 50;
// Pixels per line for wheels that report lines (Firefox), and the longest frame step, so a stall doesn't jump.
const LINE = 40;
const MAX_STEP = 64;

/** True if something between the pointer and the pane can still scroll in this direction. */
function innerCanScroll(from: EventTarget | null, pane: HTMLElement, dy: number) {
  for (let el = from instanceof Element ? from : null; el && el !== pane; el = el.parentElement) {
    if (el.scrollHeight <= el.clientHeight) continue;
    const { overflowY } = getComputedStyle(el);
    if (overflowY !== "auto" && overflowY !== "scroll") continue;
    if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)
      return true;
  }
  return false;
}

/** `page` is the current path: when it changes, any glide still running is dropped. */
export function useSmoothWheel(pane: RefObject<HTMLElement | null>, page: string) {
  const stop = useRef(() => {});

  useEffect(() => {
    const el = pane.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let target = 0;
    let current = 0;
    // Where this code last put the pane, read back, to notice when something else moves it.
    let written = 0;
    let last = 0;
    let frame = 0;
    stop.current = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const tick = (now: number) => {
      // Moved by something else (the scrollbar, keys, a new page starting at the top): follow it and stop.
      if (Math.abs(el.scrollTop - written) > 1) {
        frame = 0;
        return;
      }
      const dt = last ? Math.min(now - last, MAX_STEP) : 16;
      last = now;
      current += (target - current) * (1 - 0.5 ** (dt / HALF_LIFE));
      if (Math.abs(target - current) < 0.5) current = target;
      el.scrollTop = current;
      written = el.scrollTop;
      frame = current === target ? 0 : requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      // Pinch and ctrl+wheel zoom, and sideways scrolling, stay with the browser.
      if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const dy = e.deltaY * (e.deltaMode === 1 ? LINE : e.deltaMode === 2 ? el.clientHeight : 1);
      if (dy === 0 || innerCanScroll(e.target, el, dy)) return;
      e.preventDefault();
      if (!frame) {
        // Start from wherever the pane is now.
        target = current = written = el.scrollTop;
        last = 0;
      }
      target = Math.max(0, Math.min(el.scrollHeight - el.clientHeight, target + dy));
      if (!frame && target !== current) frame = requestAnimationFrame(tick);
    };

    // Not passive: the wheel's own jump has to be cancelled for the glide to replace it.
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(frame);
    };
  }, [pane]);

  // Before the new page is drawn. A glide that ran one more frame on the new page would have that position
  // saved as the page's own by the router's scroll restoration, which then scrolls back down to it.
  useLayoutEffect(() => stop.current(), [page]);
}
