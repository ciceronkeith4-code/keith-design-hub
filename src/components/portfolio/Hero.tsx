import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { MagneticButton } from "./MagneticButton";
import { scrollToSection } from "./useScrollSpy";

const professionWords = ["Full Stack Web Developer", "Full Stack Engineer"] as const;
const entranceEase = [0.22, 1, 0.36, 1] as const;
const PROFESSION_START_DELAY_MS = 100;
const PROFESSION_INTRO_DURATION_MS = 600;
const PROFESSION_WORD_HOLD_MS = 1800;

const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.02,
      staggerChildren: 0.15,
    },
  },
};

const entranceItem = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 190,
      damping: 25,
      mass: 0.72,
    },
  },
};

interface HeroProps {
  ready?: boolean;
}

export function Hero({ ready = true }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, frame: 0 });
  const reduceMotion = useReducedMotion();
  const inView = useInView(sectionRef, { amount: 0.15 });
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const smoothGlowX = useSpring(glowX, { stiffness: 52, damping: 19, mass: 0.8 });
  const smoothGlowY = useSpring(glowY, { stiffness: 52, damping: 19, mass: 0.8 });
  const [professionStarted, setProfessionStarted] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    if (!ready || !inView) {
      setProfessionStarted(false);
      setIntroComplete(false);
      return;
    }

    if (reduceMotion) {
      setProfessionStarted(true);
      setIntroComplete(true);
      return;
    }

    setProfessionStarted(false);
    setIntroComplete(false);
    const startTimer = window.setTimeout(() => setProfessionStarted(true), PROFESSION_START_DELAY_MS);
    const finishTimer = window.setTimeout(
      () => setIntroComplete(true),
      PROFESSION_START_DELAY_MS + PROFESSION_INTRO_DURATION_MS,
    );

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(finishTimer);
    };
  }, [ready, inView, reduceMotion]);

  const floatActive = Boolean(ready && inView && introComplete && !reduceMotion);

  const updateRect = useCallback(() => {
    rectRef.current = sectionRef.current?.getBoundingClientRect() ?? null;
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    updateRect();
    const observer = new ResizeObserver(updateRect);
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (pointerRef.current.frame) cancelAnimationFrame(pointerRef.current.frame);
    };
  }, [updateRect]);

  const queueGlow = useCallback(
    (clientX: number, clientY: number) => {
      pointerRef.current.x = clientX;
      pointerRef.current.y = clientY;

      if (pointerRef.current.frame || reduceMotion) return;

      pointerRef.current.frame = requestAnimationFrame(() => {
        const rect = rectRef.current;
        if (rect) {
          glowX.set((pointerRef.current.x - rect.left - rect.width / 2) * 0.028);
          glowY.set((pointerRef.current.y - rect.top - rect.height / 2) * 0.028);
        }
        pointerRef.current.frame = 0;
      });
    },
    [glowX, glowY, reduceMotion],
  );

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      updateRect();
      queueGlow(event.clientX, event.clientY);
    },
    [queueGlow, updateRect],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      queueGlow(event.clientX, event.clientY);
    },
    [queueGlow],
  );

  const resetGlow = useCallback(() => {
    glowX.set(0);
    glowY.set(0);
  }, [glowX, glowY]);

  const goProjects = useCallback(() => scrollToSection("projects"), []);
  const goContact = useCallback(() => scrollToSection("contact"), []);
  const goAbout = useCallback(() => scrollToSection("about"), []);

  return (
    <section
      ref={sectionRef}
      id="home"
      onPointerEnter={reduceMotion ? undefined : handlePointerEnter}
      onPointerMove={reduceMotion ? undefined : handlePointerMove}
      onPointerLeave={reduceMotion ? undefined : resetGlow}
      className="full-page-slide relative z-10 mx-4 mt-28 flex min-h-[calc(100svh-7rem)] items-center justify-center overflow-hidden rounded-t-[2.5rem] border border-neutral-200/30 bg-[#FFFCF2] px-4 py-20 text-[#252422] shadow-md md:mx-6 md:rounded-t-[3.5rem]"
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: entranceEase }}
        className="pointer-events-none absolute inset-0"
      >
        <HeroBackdrop x={smoothGlowX} y={smoothGlowY} reducedMotion={Boolean(reduceMotion)} />
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 top-6 sm:top-10 z-10 flex justify-between px-4 sm:px-[8%] font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-neutral-400">
        <span>Manila · PH</span>
        <span>Portfolio / 2026</span>
      </div>


      <motion.div
        initial="hidden"
        animate={ready ? "visible" : "hidden"}
        variants={contentVariants}
        className="relative z-20 mx-auto flex max-w-5xl flex-col items-center text-center px-2"
      >
        <motion.span variants={entranceItem} className="mb-6 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.24em] sm:tracking-[0.32em] text-[#E25822] sm:mb-8">
          Hello, I&apos;m available for work
        </motion.span>

        <motion.h1 variants={entranceItem} className="font-display max-w-5xl text-[clamp(1.85rem,10vw,9.5rem)] uppercase leading-[0.88] sm:leading-[0.84] sm:whitespace-nowrap tracking-[-0.035em] text-[#18181A]">
          Keith <span className="text-[#E25822]">Ciceron.</span>
        </motion.h1>

        <motion.h2 variants={entranceItem} className="font-display mt-4 sm:mt-6 text-lg uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#E25822] sm:text-2xl md:text-3xl lg:text-4xl font-bold">
          FULL STACK DEVELOPER
        </motion.h2>

        <motion.p variants={entranceItem} className="mt-4 max-w-2xl text-base font-medium leading-relaxed tracking-wide text-[#4A443B] sm:text-lg md:text-xl">
          Building modern, scalable web applications with intuitive user interfaces and robust backend systems.
        </motion.p>

        <motion.div variants={entranceItem} className="mt-7 flex flex-wrap justify-center gap-3">
          <MagneticButton onClick={goProjects} className="bg-[#E25822] text-[#F8F1E7] hover:bg-[#c94b19] shadow-md">
            View Projects <ArrowUpRight className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton
            onClick={goContact}
            variant="ghost"
            className="border-[#E25822]/30 bg-[#F8F1E7] text-[#18181A] hover:border-[#E25822] hover:bg-white"
          >
            Let&apos;s Talk
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: entranceEase }}
        onClick={goAbout}
        className="absolute bottom-9 left-1/2 z-20 -translate-x-1/2 text-neutral-500 transition-colors duration-200 hover:text-[#E25822]"
        aria-label="Scroll to about section"
      >
        <motion.span
          animate={floatActive ? { y: [0, 6, 0] } : { y: 0 }}
          transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
          className="block transform-gpu will-change-transform"
        >
          <ArrowDown className="h-5 w-5" />
        </motion.span>
      </motion.button>
    </section>
  );
}

const HeroBackdrop = memo(function HeroBackdrop({ x, y, reducedMotion }: { x: MotionValue<number>; y: MotionValue<number>; reducedMotion: boolean }) {
  return (
    <>
      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: "-14%" }}
        animate={reducedMotion ? { opacity: 0.3, x: 0 } : { opacity: [0.22, 0.5, 0.22], x: ["-14%", "14%", "-14%"] }}
        transition={reducedMotion ? { duration: 0 } : { duration: 16, ease: "easeInOut", repeat: Infinity }}
        className="pointer-events-none absolute inset-y-[-18%] left-[-20%] w-[140%] transform-gpu will-change-transform"
      >
        <div
          className="h-full w-full"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(235,94,40,0.015) 34%, rgba(235,94,40,0.08) 50%, rgba(255,255,255,0.26) 58%, transparent 100%)" }}
        />
      </motion.div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,36,34,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(37,36,34,0.035) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div aria-hidden className="noise pointer-events-none absolute inset-0 opacity-[0.018]" />
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[48rem] w-[48rem] max-h-[92vw] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full transform-gpu will-change-transform"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(235,94,40,0.14),rgba(235,94,40,0.04)_35%,transparent_69%)]" />
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-x-[12%] bottom-[12%] h-px bg-gradient-to-r from-transparent via-[#EB5E28]/20 to-transparent" />
    </>
  );
});

function RotatingProfession({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const word = professionWords[index];

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }
    if (reduceMotion) return;

    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % professionWords.length);
    }, PROFESSION_WORD_HOLD_MS);

    return () => window.clearTimeout(timer);
  }, [active, index, reduceMotion]);

  return (
    <div className="relative flex h-[1.15em] w-[min(90vw,29rem)] items-center justify-center overflow-hidden text-center font-display text-2xl uppercase leading-none tracking-[-0.015em] text-[#252422] sm:text-3xl">
      <div aria-hidden className="pointer-events-none absolute opacity-0">
        {professionWords.map((profession) => (
          <span key={profession} className="whitespace-nowrap">
            {profession}
          </span>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {active && (
          <motion.span
            key={word}
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: "105%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: "-105%" }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 26, mass: 0.75 }}
            className="absolute inset-x-0 top-0 flex h-full items-center justify-center whitespace-nowrap transform-gpu will-change-transform"
            aria-live="polite"
          >
            <span className="text-[#EB5E28]">{word}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
