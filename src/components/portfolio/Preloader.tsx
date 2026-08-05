import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const LOADER_DURATION = 5000;
const stages = [
  { label: "Initializing", progress: "00", at: 0 },
  { label: "Loading modules", progress: "34", at: 1600 },
  { label: "Preparing interface", progress: "72", at: 3300 },
  { label: "Ready", progress: "100", at: 4700 },
] as const;

interface PreloaderProps {
  onComplete?: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const reduceMotion = useReducedMotion();
  const notified = useRef(false);
  const duration = reduceMotion ? 180 : LOADER_DURATION;
  const stage = reduceMotion ? stages[stages.length - 1] : progress < 34 ? stages[0] : progress < 72 ? stages[1] : progress < 100 ? stages[2] : stages[3];

  useEffect(() => {
    if (reduceMotion) {
      setProgress(100);
      const timer = window.setTimeout(() => setComplete(true), duration);
      return () => window.clearTimeout(timer);
    }
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(100, Math.round(((now - startedAt) / duration) * 100));
      setProgress(next);
      if (next < 100) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    const finishTimer = window.setTimeout(() => { setProgress(100); setComplete(true); }, duration);
    return () => { window.cancelAnimationFrame(frame); window.clearTimeout(finishTimer); };
  }, [duration, reduceMotion]);

  const notifyComplete = useCallback(() => {
    if (notified.current) return;
    notified.current = true;
    onComplete?.();
  }, [onComplete]);

  return (
    <AnimatePresence onExitComplete={notifyComplete}>
      {!complete && (
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[150] overflow-hidden bg-[#1f1f1e] text-[#f3f0e8]"
          aria-label="Loading portfolio"
          role="status"
        >
          <motion.div
            aria-hidden
            animate={reduceMotion ? {} : { x: ["-2%", "2%", "-2%"], y: ["-1%", "1%", "-1%"], scale: [1, 1.04, 1] }}
            transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
            className="pointer-events-none absolute -inset-[12%] transform-gpu will-change-transform"
            style={{
              background:
                "radial-gradient(circle at 54% 45%, rgba(255,255,255,0.05), transparent 25%), radial-gradient(circle at 21% 78%, rgba(235,94,40,0.08), transparent 24%), radial-gradient(circle at 84% 16%, rgba(255,255,255,0.025), transparent 23%)",
            }}
          />
          <div aria-hidden className="noise pointer-events-none absolute inset-0 opacity-[0.025]" />
          <motion.div
            aria-hidden
            animate={reduceMotion ? {} : { y: ["-12vh", "112vh"] }}
            transition={{ duration: 3.8, ease: "linear", repeat: Infinity, repeatDelay: 1.2 }}
            className="pointer-events-none absolute inset-x-0 h-px transform-gpu bg-gradient-to-r from-transparent via-white/[0.12] to-transparent will-change-transform"
          />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.08, type: "spring", stiffness: 220, damping: 26 }}
            className="absolute left-8 top-10 font-sans text-[11px] font-bold tracking-[0.04em] text-[#f3f0e8] sm:left-9 sm:top-11"
          >
            KEITH CICERON
          </motion.div>

          <div className="absolute right-10 top-9 flex h-7 items-end gap-1 sm:right-12 sm:top-10" aria-hidden>
            {[0, 0.16, 0.32].map((delay, index) => (
              <motion.span
                key={delay}
                animate={reduceMotion ? {} : { scaleY: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.1, repeat: Infinity, delay }}
                className={(index === 0 ? "h-3" : index === 1 ? "h-5" : "h-2") + " w-1 origin-bottom rounded-full bg-[#EB5E28] will-change-transform"}
              />
            ))}
          </div>

          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-[clamp(6rem,12vw,15rem)] -translate-y-1/2 overflow-hidden contain-paint">
            <motion.div
              initial={{ x: "-50%" }}
              animate={reduceMotion ? { x: "-50%" } : { x: ["-50%", "0%"] }}
              transition={{ duration: reduceMotion ? 0 : 18, ease: "linear", repeat: Infinity }}
              transformTemplate={({ x }) => `translate3d(${x}, 0, 0)`}
              className="flex w-max items-center transform-gpu select-none whitespace-nowrap font-display text-[clamp(6rem,12vw,15rem)] uppercase leading-none tracking-[-0.03em] text-white/[0.1] will-change-transform"
            >
              {[0, 1].map((copy) => (
                <span key={copy} className="block shrink-0 pr-[12vw]">
                  SOFTWARE DEVELOPER
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.12, type: "spring", stiffness: 190, damping: 24 }}
            className="absolute left-1/2 top-1/2 z-20 w-[min(88vw,340px)] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative h-[62px] overflow-hidden rounded-full border border-white/[0.07] bg-[#3c3935] shadow-[0_14px_30px_rgba(0,0,0,0.25)]">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduceMotion ? 0 : duration / 1000, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 origin-left transform-gpu bg-[linear-gradient(90deg,#49453f,#5b5147)] will-change-transform"
              />
              <motion.div
                aria-hidden
                animate={reduceMotion ? {} : { x: ["-160%", "440%"] }}
                transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
                className="pointer-events-none absolute inset-y-0 w-16 -skew-x-12 transform-gpu bg-gradient-to-r from-transparent via-white/[0.13] to-transparent will-change-transform"
              />
              <div className="relative z-10 flex h-full items-center justify-between px-8 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#ded9cf]">
                <motion.span
                  key={stage.label}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="whitespace-nowrap"
                >
                  {stage.label}
                </motion.span>
                <span className="text-[#f1eee6]">{progress}%</span>
              </div>
            </div>
            <motion.div
              animate={reduceMotion ? {} : { scaleX: [0.82, 1, 0.82], opacity: [0.18, 0.38, 0.18] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="mx-auto mt-5 h-px w-[58%] origin-center transform-gpu bg-[#EB5E28] will-change-transform"
            />
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.22 }}
            className="absolute bottom-9 left-8 font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-white/[0.34] sm:left-9"
          >
            © 2026
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.22 }}
            className="absolute bottom-9 right-8 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-white/[0.34] sm:right-10"
          >
            System Init
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

