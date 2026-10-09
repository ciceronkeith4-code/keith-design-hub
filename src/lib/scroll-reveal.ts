import { useEffect, type RefObject } from "react";

/**
 * Fade-in on scroll for every page. Content blocks below the fold start hidden (opacity and a small lift)
 * and ease in as they scroll into view; blocks already on screen are left alone, so nothing flashes.
 * Only opacity and transform change, which browsers animate on the compositor, and one observer watches
 * everything and lets each block go once it has appeared.
 */

// Blocks that fade in. Only the outermost match animates, so a list item's paragraphs move with it.
const BLOCKS = "h1, h2, h3, p, li, img, figure, form, table, pre, blockquote, [data-reveal]";
// Siblings that appear together start this many ms apart, up to MAX_STAGGER.
const STAGGER = 60;
const MAX_STAGGER = 240;

/** Re-scans `root` whenever `key` changes (a new page). */
export function useScrollReveal(root: RefObject<HTMLElement | null>, key: string) {
  useEffect(() => {
    const container = root.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Wait a frame so the new page has laid out before measuring it.
    let observer: IntersectionObserver | null = null;
    const frame = requestAnimationFrame(() => {
      const candidates = [...container.querySelectorAll<HTMLElement>(BLOCKS)].filter(
        (el) => !el.closest("[data-no-reveal]"),
      );
      const outermost = candidates.filter(
        (el) => !candidates.some((other) => other !== el && other.contains(el)),
      );
      const fold = container.getBoundingClientRect().bottom;
      const hidden = outermost.filter((el) => el.getBoundingClientRect().top > fold);
      if (hidden.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          let order = 0;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            el.style.transitionDelay = `${Math.min(order * STAGGER, MAX_STAGGER)}ms`;
            el.classList.add("is-revealed");
            order++;
            observer?.unobserve(el);
            // Once shown, hand the element back to its own styles (its hover transitions included).
            el.addEventListener(
              "transitionend",
              () => {
                el.classList.remove("reveal", "is-revealed");
                el.style.transitionDelay = "";
              },
              { once: true },
            );
          }
        },
        { root: container, rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
      );
      for (const el of hidden) {
        el.classList.add("reveal");
        observer.observe(el);
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [root, key]);
}
