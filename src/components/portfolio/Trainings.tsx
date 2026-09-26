import { TRAININGS } from "@/lib/portfolio-data";

export function Trainings() {
  return (
    <div className="w-full flex flex-col text-left">
      <h1 className="mb-6 sm:mb-8 font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
        Workshops & Events
      </h1>

      {/* Simple list separated by thin dividers, no cards */}
      <div className="divide-y divide-[#E5E5E0] dark:divide-[#262626]">
        {TRAININGS.map((item) => (
          <div
            key={item.title}
            className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
              {/* Fixed-width role column so every title starts on the same vertical line */}
              <span className="sm:w-[104px] shrink-0">
                <span className="inline-block rounded-full bg-white dark:bg-[#141414] border border-[#E5E5E0] dark:border-[#262626] text-[#161616] dark:text-[#EDEDED] px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider">
                  {item.role}
                </span>
              </span>
              <h3 className="font-sans text-sm font-semibold text-[#161616] dark:text-[#EDEDED]">
                {item.title}
              </h3>
            </div>

            <span className="font-mono text-xs text-[#62655E] dark:text-[#A3A3A3] shrink-0">
              {item.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
