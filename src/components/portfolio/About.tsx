import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";

const photos = [
  "/images/profile/keith-white-shirt.jpg",
  "/images/profile/keith-brown-shirt.jpg",
  "/images/profile/keith3.jpeg",
  "/images/profile/keith4.jpeg",
  "/images/profile/keith5.jpeg",
];

function DesktopPortraitOrbit() {
  return (
    <div className="portrait-stage relative hidden h-[430px] w-full items-center justify-center overflow-hidden sm:flex">
      <div className="relative h-[325px] w-[240px] [perspective:1200px]">
        <div className="portrait-orbit relative h-full w-full [transform-style:preserve-3d]">
          {photos.map((photo, index) => (
            <div
              key={photo}
              className="absolute inset-0 overflow-hidden rounded-[1.65rem] bg-neutral-900 shadow-[0_22px_55px_rgba(0,0,0,.45)] [backface-visibility:hidden]"
              style={{
                transform: `rotateY(${index * (360 / photos.length)}deg) translateZ(240px)`,
                transformStyle: "preserve-3d",
              }}
            >
              <img
                src={photo}
                alt={`Keith portrait ${index + 1}`}
                draggable="false"
                className="h-full w-full select-none object-cover grayscale contrast-[1.1] brightness-[0.9] transition duration-500 hover:grayscale-0 hover:brightness-100"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobilePortraitCarousel() {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex w-full flex-col items-center py-0 sm:hidden">
      <div className="relative h-[240px] w-[180px] overflow-hidden rounded-3xl border border-white/15 bg-neutral-900 shadow-[0_16px_32px_rgba(0,0,0,0.45)]">
        <AnimatePresence mode="wait">
          <motion.img
            key={photos[photoIndex]}
            src={photos[photoIndex]}
            alt={`Keith portrait ${photoIndex + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="h-full w-full object-cover grayscale contrast-[1.1] brightness-[0.92]"
          />
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
      </div>

      {/* Pagination dots for mobile */}
      <div className="mt-2.5 flex gap-1.5">
        {photos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setPhotoIndex(idx)}
            aria-label={`View photo ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              photoIndex === idx ? "w-5 bg-[#E25822]" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="full-page-slide stacked-panel panel-dark z-20 overflow-hidden px-4 py-8 sm:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 overflow-hidden whitespace-nowrap opacity-[0.018]">
        <div className="marquee-track flex min-w-max">
          <span className="font-display pr-20 text-[18vw] uppercase leading-none">Keith Czimonne Anderson Ciceron</span>
          <span className="font-display pr-20 text-[18vw] uppercase leading-none">Keith Czimonne Anderson Ciceron</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-4 sm:gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal className="relative flex items-center justify-center">
          <DesktopPortraitOrbit />
          <MobilePortraitCarousel />
        </Reveal>

        <Reveal delay={0.12}>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#E25822]">About Me</span>
          <h2 className="font-display mt-3 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl uppercase leading-[0.92] tracking-tight text-[#F8F1E7]">
            Building clean, <span className="text-[#E25822]">modern web experiences.</span>
          </h2>
          <div className="mt-5 text-sm leading-relaxed text-[#D8D0C5] sm:text-base">
            <p>
              I am a software developer specializing in building end-to-end applications from crafting intuitive,
              responsive user interfaces to engineering reliable backend APIs and database architectures.
            </p>
          </div>
          <div className="mt-6 sm:mt-8 border-t border-white/10 pt-6 sm:pt-8">
            <div>
              <h3 className="font-display text-xs sm:text-sm uppercase tracking-wide text-neutral-100">
                Core Specializations
              </h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-neutral-400">
                Software Development • System Design • UI/UX Prototyping
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
