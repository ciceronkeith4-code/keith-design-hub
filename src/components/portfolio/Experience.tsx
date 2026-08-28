import { useState, useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";
import { EXPERIENCE } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";

export function Experience() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % EXPERIENCE.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -40) {
      setCurrentIndex((prev) => (prev + 1) % EXPERIENCE.length);
    } else if (info.offset.x > 40) {
      setCurrentIndex((prev) => (prev === 0 ? EXPERIENCE.length - 1 : prev - 1));
    }
  };

  const item = EXPERIENCE[currentIndex];

  return (
    <section id="experience" className="stacked-panel panel-mid z-40 px-4 py-10 sm:py-12">
      <div className="relative mx-auto max-w-3xl">
        <SectionHeading
          tone="dark"
          eyebrow="Experience"
          title={
            <>
              Where I've <span className="text-[#E25822]">worked</span>
            </>
          }
          subtitle="Hands-on roles in full-stack web development, software testing, and system optimization."
        />

        <div
          className="relative mt-10"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Strictly Fixed Box & Layout Dimensions */}
          <div className="relative h-[320px] min-h-[320px] max-h-[320px] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#18181A] p-6 shadow-2xl sm:h-[300px] sm:min-h-[300px] sm:max-h-[300px] sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="flex h-full flex-col cursor-grab active:cursor-grabbing"
              >
                {/* Header - Fixed Height */}
                <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E25822]/30 bg-[#E25822]/20 text-[#E25822]">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base sm:text-xl uppercase tracking-wide text-[#F8F1E7] truncate">
                        {item.role}
                      </h3>
                      <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[#8C857B] truncate">
                        {item.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#E25822]/30 bg-[#E25822]/15 px-3.5 py-1.5 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#F8F1E7]">
                    <Calendar className="h-3.5 w-3.5 text-[#E25822]" />
                    {item.period}
                  </div>
                </div>

                {/* Bullets - Fixed Top Spacing */}
                <ul className="mt-5 space-y-2.5">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed text-[#D8D0C5]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E25822]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator Only (No Arrows) */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {EXPERIENCE.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  currentIndex === idx ? "w-8 bg-[#E25822]" : "w-2.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



