import { TRAININGS } from "@/lib/portfolio-data";

export function Trainings() {
  return (
    <div className="w-full flex flex-col justify-center py-2 text-left">
      {/* Plain Page Title */}
      <div className="mb-6 sm:mb-8 shrink-0">
        <span className="font-mono text-[10px] text-[#6E716B] dark:text-[#A3A3A3] uppercase tracking-wider block">
          Activities
        </span>
        <h2 className="font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
          Workshops & Events
        </h2>
      </div>

      {/* Simple List separated by thin dividers, NO cards */}
      <div className="divide-y divide-[#E5E5E0] dark:divide-[#262626]">
        {TRAININGS.map((item) => (
          <div
            key={item.title}
            className="py-3.5 sm:py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-3">
              {/* Neutral Role badge */}
              <span className="rounded-full bg-white dark:bg-[#141414] border border-[#E5E5E0] dark:border-[#262626] text-[#161616] dark:text-[#EDEDED] px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider shrink-0 shadow-xs">
                {item.role}
              </span>
              <h3 className="font-sans text-xs sm:text-sm font-semibold text-[#161616] dark:text-[#EDEDED]">
                {item.title}
              </h3>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-[#6E716B] dark:text-[#A3A3A3] shrink-0 self-start sm:self-auto">
              <span>Event / Workshop</span>
              <span className="h-3 w-px bg-[#E5E5E0] dark:bg-[#262626]" />
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
