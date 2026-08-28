import { motion } from "framer-motion";
import { useState } from "react";
import { TRAININGS } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";

export function Trainings() {
  const [index, setIndex] = useState(0);

  return (
    <section id="trainings" className="stacked-panel panel-mid z-[80] px-4 py-10 sm:py-12">
      <div className="relative mx-auto max-w-5xl">
        <SectionHeading
          tone="dark"
          eyebrow="Activities"
          title={<>Trainings & <span className="text-[#E25822]">Activities</span></>}
          subtitle="Workshops, hackathons, and seminars that shaped my growth."
        />
        <div className="mt-14 flex flex-col items-center">
          <div className="w-full overflow-hidden py-3">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(event, info) => {
                const swipeThreshold = 50;
                if (info.offset.x < -swipeThreshold) {
                  setIndex((current) => Math.min(TRAININGS.length - 1, current + 1));
                } else if (info.offset.x > swipeThreshold) {
                  setIndex((current) => Math.max(0, current - 1));
                }
              }}
              animate={{ x: `calc(50% - ${index * 324 + 150}px)` }}
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
              className="flex gap-6 cursor-grab active:cursor-grabbing"
            >
              {TRAININGS.map((training, itemIndex) => {
                const active = itemIndex === index;
                return (
                  <button
                    key={training.title}
                    onClick={() => setIndex(itemIndex)}
                    className={`w-[300px] shrink-0 rounded-3xl border p-7 text-left transition duration-500 ${
                      active
                        ? "scale-[1.03] border-[#E25822] bg-[#18181A] opacity-100 shadow-[0_20px_40px_-10px_rgba(226,88,34,0.3)]"
                        : "scale-95 border-white/[0.03] bg-[#18181A]/60 opacity-40 hover:opacity-70"
                    }`}
                  >
                    <h3 className="font-display min-h-[40px] text-sm uppercase leading-snug tracking-wide text-[#F8F1E7]">
                      {training.title}
                    </h3>
                    <p className="mt-4 border-t border-white/5 pt-4 text-xs font-semibold text-neutral-400">
                      <span className={active ? "text-[#E25822]" : "text-[#D8D0C5]"}>{training.role}</span> · <span className="font-mono">{training.date}</span>
                    </p>
                  </button>
                );
              })}
            </motion.div>
          </div>
          <div className="mt-6 flex gap-2">
            {TRAININGS.map((training, itemIndex) => (
              <button
                key={training.title}
                onClick={() => setIndex(itemIndex)}
                aria-label={`Go to training ${itemIndex + 1}`}
                className={`h-2 rounded-full transition ${index === itemIndex ? "w-6 bg-[#E25822]" : "w-2 bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
