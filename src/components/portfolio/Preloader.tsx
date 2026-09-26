import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

// Built bottom-up like a real stack: data first, interface last. Listed top-down for reading order.
const LAYERS = [
  { label: "Frontend", tech: "React · TypeScript · Tailwind", delay: 640 },
  { label: "Backend", tech: "Node.js", delay: 380 },
  { label: "Database", tech: "MySQL · Supabase · Firebase", delay: 120 },
] as const;

const HOLD_MS = 220;
// Fallbacks only: normally completion follows the CSS animations' own `finished` promises.
const FALLBACK_BUILD_MS = 1300;
const SAFETY_CAP_MS = 4000;

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

interface PreloaderProps {
  onComplete?: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [complete, setComplete] = useState(false);
  const reduceMotion = useReducedMotion();
  const stackRef = useRef<HTMLDivElement>(null);
  const notified = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let holdTimer = 0;
    const finish = () => {
      if (cancelled) return;
      holdTimer = window.setTimeout(
        () => !cancelled && setComplete(true),
        reduceMotion ? 80 : HOLD_MS,
      );
    };

    const safety = window.setTimeout(() => !cancelled && setComplete(true), SAFETY_CAP_MS);
    const node = stackRef.current;
    if (node && typeof node.getAnimations === "function") {
      // The build started at first paint, possibly long before hydration; wait only for what's left of it.
      Promise.allSettled(node.getAnimations({ subtree: true }).map((a) => a.finished)).then(finish);
    } else {
      holdTimer = window.setTimeout(finish, FALLBACK_BUILD_MS);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(holdTimer);
      window.clearTimeout(safety);
    };
  }, [reduceMotion]);

  const notifyComplete = useCallback(() => {
    if (notified.current) return;
    notified.current = true;
    onComplete?.();
  }, [onComplete]);

  // Exit: content lifts and fades first, then the whole screen wipes upward to reveal Home underneath.
  const overlayVariants: Variants = {
    exit: reduceMotion
      ? { opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }
      : {
          clipPath: "inset(0% 0% 100% 0%)",
          transition: { duration: 0.65, ease: EASE_DRAWER, delay: 0.08 },
        },
  };
  const contentVariants: Variants = {
    exit: reduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          transform: "translateY(-16px)",
          transition: { duration: 0.3, ease: EASE_OUT },
        },
  };

  return (
    <AnimatePresence onExitComplete={notifyComplete}>
      {!complete && (
        <motion.div
          key="preloader"
          variants={overlayVariants}
          initial={false}
          exit="exit"
          style={{ clipPath: "inset(0% 0% 0% 0%)" }}
          className="fixed inset-0 z-[150] bg-[#ECEEEA] dark:bg-[#0A0A0A] text-[#161616] dark:text-[#EDEDED] select-none"
          role="status"
          aria-label="Loading portfolio"
        >
          <motion.div
            variants={contentVariants}
            style={{ transform: "translateY(0px)" }}
            className="h-full flex flex-col justify-between p-6 sm:p-10"
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-medium uppercase tracking-wider">
                Keith Ciceron
              </span>
              <span className="font-mono text-xs text-[#62655E] dark:text-[#A3A3A3]">
                Portfolio / 2026
              </span>
            </div>

            <div ref={stackRef} className="mx-auto w-full max-w-[340px]" aria-hidden="true">
              {LAYERS.map((layer) => (
                <div
                  key={layer.label}
                  style={{ "--intro-delay": `${layer.delay}ms` } as CSSProperties}
                >
                  {/* Mask hugs the text line only, so the label is fully hidden until it rises out of its rule */}
                  <div className="pt-4 pb-2.5">
                    <div className="overflow-hidden">
                      <div className="intro-rise flex items-baseline justify-between gap-4">
                        <span className="font-mono text-xs font-medium uppercase tracking-wider">
                          {layer.label}
                        </span>
                        <span className="font-mono text-[11px] text-[#62655E] dark:text-[#A3A3A3] truncate">
                          {layer.tech}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="intro-rule h-px w-full bg-[#161616] dark:bg-[#EDEDED]" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-[#62655E] dark:text-[#A3A3A3]">
              <span>Full Stack Developer</span>
              <span>Manila · PH</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
