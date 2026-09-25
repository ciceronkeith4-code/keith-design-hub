import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const LOADER_DURATION = 1500;
const stages = [
  { label: "Initializing", progress: "00" },
  { label: "Loading dashboard", progress: "35" },
  { label: "Preparing bento modules", progress: "70" },
  { label: "Ready", progress: "100" },
] as const;

interface PreloaderProps {
  onComplete?: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const reduceMotion = useReducedMotion();
  const notified = useRef(false);
  const duration = reduceMotion ? 120 : LOADER_DURATION;

  const stage = reduceMotion
    ? stages[stages.length - 1]
    : progress < 35
    ? stages[0]
    : progress < 70
    ? stages[1]
    : progress < 100
    ? stages[2]
    : stages[3];

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
    const finishTimer = window.setTimeout(() => {
      setProgress(100);
      setComplete(true);
    }, duration);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(finishTimer);
    };
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
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[150] flex flex-col justify-between p-6 sm:p-10 bg-[#ECEEEA] text-[#161616] select-none"
          role="status"
          aria-label="Loading portfolio"
        >
          {/* Top Info */}
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-medium uppercase tracking-wider text-[#161616]">
              Keith Ciceron
            </span>
            <span className="font-mono text-xs text-[#6E716B]">
              Portfolio / 2026
            </span>
          </div>

          {/* Center Progress Box */}
          <div className="mx-auto w-full max-w-xs space-y-3 rounded-[24px] bg-[#F6F7F4] border border-[#E3E5E0] p-5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#161616] font-medium">{stage.label}</span>
              <span className="text-[#6E716B]">{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E3E5E0]">
              <motion.div
                className="h-full bg-[#1C1C1C]"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between font-mono text-[11px] text-[#6E716B]">
            <span>Software Developer</span>
            <span>Manila · PH</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
