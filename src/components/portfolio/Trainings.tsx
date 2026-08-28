import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";
import { TRAININGS } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";

export function Trainings() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((current) => (current === 0 ? TRAININGS.length - 1 : current - 1));
  const next = () => setIndex((current) => (current === TRAININGS.length - 1 ? 0 : current + 1));

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -40) {
      next();
    } else if (info.offset.x > 40) {
      prev();
    }
  };

  const active = TRAININGS[index];

  return (
    <section id="trainings" className="stacked-panel panel-mid z-[80] px-4 py-10 sm:py-14">
      <div className="relative mx-auto max-w-4xl">
        <SectionHeading
          tone="dark"
          eyebrow="Activities"
          title={
            <>
              Trainings & <span className="text-[#E25822]">Activities</span>
            </>
          }
          subtitle="Workshops, hackathons, and seminars that shaped my growth."
        />

        <div className="relative mt-8 sm:mt-12">
          {/* Main Active Card Container */}
          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#18181A] p-6 shadow-2xl sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex cursor-grab flex-col active:cursor-grabbing"
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E25822]/30 bg-[#E25822]/15 text-[#E25822]">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#E25822]">
                      {active.role}
                    </span>
                    <h3 className="font-display mt-0.5 text-base sm:text-lg uppercase leading-snug tracking-wide text-[#F8F1E7]">
                      {active.title}
                    </h3>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between font-mono text-xs text-[#8C857B]">
                  <span>Event / Workshop</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#D8D0C5]">
                    {active.date}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Prev/Next Chevron Controls */}
            <button
              onClick={prev}
              aria-label="Previous activity"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#222225]/80 text-[#F8F1E7] transition hover:border-[#E25822] hover:bg-[#E25822]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next activity"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#222225]/80 text-[#F8F1E7] transition hover:border-[#E25822] hover:bg-[#E25822]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Dots Indicator & Counter */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {TRAININGS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndex(idx)}
                aria-label={`Go to activity ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === idx ? "w-7 bg-[#E25822]" : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-[#8C857B]">
            {index + 1} of {TRAININGS.length}
          </p>
        </div>
      </div>
    </section>
  );
}
