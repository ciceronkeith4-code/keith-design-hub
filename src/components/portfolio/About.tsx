import { EDUCATION } from "@/lib/portfolio-data";

export function About() {
  return (
    <div className="w-full flex flex-col justify-center py-2 text-left">
      {/* Plain Page Title */}
      <div className="mb-6 sm:mb-8 shrink-0">
        <span className="font-mono text-[10px] text-[#6E716B] dark:text-[#A3A3A3] uppercase tracking-wider block">
          About
        </span>
        <h2 className="font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
          Background & Education
        </h2>
      </div>

      {/* Two equal-width columns (50% / 50%) aligned to the same top edge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* Left Column: Profile */}
        <div className="flex flex-col justify-start">
          <span className="font-mono text-[10px] text-[#6E716B] dark:text-[#A3A3A3] uppercase tracking-wider block pb-2 border-b border-[#E5E5E0] dark:border-[#262626] mb-3">
            PROFILE
          </span>

          <h3 className="font-sans text-[clamp(18px,2.4vh,24px)] font-medium tracking-tight text-[#161616] dark:text-[#EDEDED] leading-snug">
            Building clean, modern web experiences.
          </h3>

          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#6E716B] dark:text-[#A3A3A3]">
            I am a software developer specializing in building end-to-end applications from crafting intuitive,
            responsive user interfaces to engineering reliable backend APIs and database architectures.
          </p>

          {/* Core Specializations */}
          <div className="mt-6 pt-4 border-t border-[#E5E5E0] dark:border-[#262626]">
            <span className="font-mono text-[10px] text-[#6E716B] dark:text-[#A3A3A3] uppercase tracking-wider block mb-2.5">
              Core Specializations
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] px-3 py-1 text-xs font-medium">
                Software Development
              </span>
              <span className="rounded-full bg-white dark:bg-[#141414] text-[#161616] dark:text-[#EDEDED] border border-[#E5E5E0] dark:border-[#262626] px-3 py-1 text-xs font-medium shadow-xs">
                System Design
              </span>
              <span className="rounded-full border border-dashed border-[#1C1C1C]/40 dark:border-white/40 bg-transparent text-[#161616] dark:text-[#EDEDED] px-3 py-1 text-xs font-medium">
                UI/UX Prototyping
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Education */}
        <div className="flex flex-col justify-start">
          <span className="font-mono text-[10px] text-[#6E716B] dark:text-[#A3A3A3] uppercase tracking-wider block pb-2 border-b border-[#E5E5E0] dark:border-[#262626] mb-3">
            EDUCATION
          </span>

          <div className="divide-y divide-[#E5E5E0] dark:divide-[#262626]">
            {EDUCATION.map((edu) => (
              <div
                key={edu.school}
                className="py-3 sm:py-3.5 first:pt-1 last:pb-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-sans text-xs sm:text-sm font-medium text-[#161616] dark:text-[#EDEDED] leading-snug">
                    {edu.school}
                  </h4>
                  <span className="font-mono text-[10px] text-[#6E716B] dark:text-[#A3A3A3] shrink-0">
                    {edu.period}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-[#6E716B] dark:text-[#A3A3A3]">
                    {edu.detail}
                  </span>
                  <span className="rounded-full border border-[#E5E5E0] dark:border-[#262626] bg-white dark:bg-[#141414] px-2 py-0.5 font-mono text-[9px] text-[#161616] dark:text-[#EDEDED] shrink-0 shadow-xs">
                    {edu.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
