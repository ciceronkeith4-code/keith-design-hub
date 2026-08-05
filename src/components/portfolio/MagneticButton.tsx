import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useCallback, useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "ghost";
  className?: string;
  ariaLabel?: string;
}

export function MagneticButton({
  children,
  onClick,
  href,
  variant = "primary",
  className,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 250, damping: 20, mass: 0.4 });
  const smoothY = useSpring(y, { stiffness: 250, damping: 20, mass: 0.4 });

  const cacheRect = useCallback(() => {
    rectRef.current = ref.current?.getBoundingClientRect() ?? null;
  }, []);

  const handleMove = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      if (reduceMotion) return;
      const rect = rectRef.current;
      if (!rect) return;

      x.set((event.clientX - rect.left - rect.width / 2) * 0.15);
      y.set((event.clientY - rect.top - rect.height / 2) * 0.15);
    },
    [reduceMotion, x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const base = cn(
    "relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-tight transition-[background-color,color,border-color,box-shadow] duration-200",
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-card hover:bg-secondary"
      : "border border-border bg-surface text-foreground hover:bg-muted",
    className,
  );

  const inner = (
    <motion.span
      ref={ref}
      onMouseEnter={cacheRect}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: smoothX, y: smoothY }}
      className={base + " transform-gpu will-change-transform"}
    >
      {children}
    </motion.span>
  );

  if (href) {
    const external = href.startsWith("http");

    return (
      <a
        href={href}
        aria-label={ariaLabel}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="inline-block"
      >
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className="inline-block">
      {inner}
    </button>
  );
}
