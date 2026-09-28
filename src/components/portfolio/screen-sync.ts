/** How fast the hover scroll moves through the real site, in its own CSS pixels per second. */
const SITE_PX_PER_SECOND = 450;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Keeps every screen on a stage at the same point of its page (as a fraction of the scroll), so
 * the laptop, tablet, and phone show the same section. Hovering a screen with a mouse slowly
 * scrolls them all; leaving rewinds to the top. Scrolling by hand (wheel, drag) takes over and
 * the others follow. No hover scroll with reduced motion.
 */
export class ScreenSync {
  private screens = new Map<HTMLElement, { deviceWidth: number; expected: number }>();
  private progress = 0;
  private frame = 0;
  private delay = 0;

  /** Registers a scrolling screen; `deviceWidth` is the viewport its screenshot was taken at. */
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
