import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CustomCursorProps {
  active?: boolean;
}

export function CustomCursor({ active = true }: CustomCursorProps) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(0);
  const rotate = useMotionValue(0);
  
  const smoothScale = useSpring(scale, { stiffness: 360, damping: 28, mass: 0.35 });
  const smoothOpacity = useSpring(opacity, { stiffness: 260, damping: 26 });
  const smoothRotate = useSpring(rotate, { stiffness: 300, damping: 20 });

  const [canUseCursor, setCanUseCursor] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const lastMoveTime = useRef(Date.now());
  const pending = useRef({ x: -100, y: -100, target: null as EventTarget | null, frame: 0, interactive: false, visible: false });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateCapability = () => setCanUseCursor(media.matches);
    updateCapability();
    media.addEventListener("change", updateCapability);

    return () => media.removeEventListener("change", updateCapability);
  }, []);

  // Decay the trail when the mouse stops moving
  useEffect(() => {
    if (!active || reduceMotion || !canUseCursor) return;

    const interval = setInterval(() => {
      if (Date.now() - lastMoveTime.current > 35 && trailRef.current.length > 0) {
        trailRef.current.shift();
        setTrail([...trailRef.current]);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [active, reduceMotion, canUseCursor]);

  useEffect(() => {
    if (!active || reduceMotion || !canUseCursor) {
      pending.current.visible = false;
      opacity.set(0);
      return;
    }

    opacity.set(0.95);
    scale.set(1);
    rotate.set(0);
    pending.current.visible = true;

    const update = () => {
      const next = pending.current;
      // Offset by -3, -21 so the tip of the pen (nib) is exactly at the mouse pointer coordinate
      x.set(next.x - 3);
      y.set(next.y - 21);

      const node = next.target instanceof HTMLElement ? next.target : null;
      const interactive = Boolean(node?.closest("a,button,input,textarea,[data-cursor]"));
      if (interactive !== next.interactive) {
        next.interactive = interactive;
        scale.set(interactive ? 1.15 : 1);
        rotate.set(interactive ? -15 : 0); // Tilt the pen as if writing when hovering interactive items
        opacity.set(interactive ? 1 : 0.95);
      }

      if (!next.visible) {
        next.visible = true;
        opacity.set(next.interactive ? 1 : 0.95);
      }

      next.frame = 0;
    };

    const move = (event: PointerEvent) => {
      pending.current.x = event.clientX;
      pending.current.y = event.clientY;
      pending.current.target = event.target;

      if (!pending.current.frame) {
        pending.current.frame = requestAnimationFrame(update);
      }

      // Add point to trail exactly at the pen tip coordinates
      const now = Date.now();
      lastMoveTime.current = now;
      trailRef.current.push({ x: event.clientX, y: event.clientY });
      if (trailRef.current.length > 16) {
        trailRef.current.shift();
      }
      setTrail([...trailRef.current]);
    };

    const leave = () => {
      pending.current.visible = false;
      opacity.set(0);
      trailRef.current = [];
      setTrail([]);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", leave);
      if (pending.current.frame) cancelAnimationFrame(pending.current.frame);
    };
  }, [active, canUseCursor, opacity, reduceMotion, scale, rotate, x, y]);

  if (!active || reduceMotion || !canUseCursor) return null;

  return (
    <>
      {/* Writing Trail Lines */}
      <svg className="pointer-events-none fixed inset-0 z-[199] h-full w-full overflow-hidden">
        {trail.map((point, index) => {
          if (index === 0) return null;
          const prev = trail[index - 1];
          const ratio = index / trail.length;
          const strokeWidth = ratio * 3.5;
          const opacityVal = ratio * 0.65;
          return (
            <line
              key={index}
              x1={prev.x}
              y1={prev.y}
              x2={point.x}
              y2={point.y}
              stroke="#EB5E28"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={opacityVal}
            />
          );
        })}
      </svg>
      {/* Eyeliner/Makeup Pen Cursor */}
      <motion.div
        aria-hidden
        style={{
          x,
          y,
          scale: smoothScale,
          opacity: smoothOpacity,
          rotate: smoothRotate,
          transformOrigin: "3px 21px" // Rotate around the tip of the eyeliner brush
        }}
        className="custom-cursor pointer-events-none fixed left-0 top-0 z-[200] will-change-transform"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.28)]"
        >
          {/* Fine felt brush tip pointing to (3, 21) */}
          <path d="M3 21 L5.5 17.5 L7 19 L3 21 Z" fill="#252422" />
          
          {/* Shiny Rose Gold/Orange Collar */}
          <path d="M5.5 17.5 L8.5 14.5 L10 16 L7 19 Z" fill="#EB5E28" />
          
          {/* Sleek Black Eyeliner Body */}
          <path d="M8.5 14.5 L17.5 5.5 L19 7 L10 16 Z" fill="#252422" />
          
          {/* Gold Accent Ring */}
          <path d="M17.5 5.5 L18.5 4.5 L20 6 L19 7 Z" fill="#EB5E28" />
          
          {/* Cap Section */}
          <path d="M18.5 4.5 L21 2 L22.5 3.5 L20 6 Z" fill="#403D39" />
        </svg>
      </motion.div>
    </>
  );
}
