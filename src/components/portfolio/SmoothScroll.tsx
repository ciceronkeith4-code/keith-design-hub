import Lenis from "lenis";
import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import "lenis/dist/lenis.css";

let activeLenis: Lenis | null = null;

export function getLenis() {
  return activeLenis;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.05,
      easing: (time) => 1 - Math.pow(1 - time, 4),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;
    activeLenis = lenis;

    return () => {
      if (activeLenis === lenis) activeLenis = null;
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduceMotion]);

  useAnimationFrame((time) => {
    lenisRef.current?.raf(time);
  });

  return <>{children}</>;
}
