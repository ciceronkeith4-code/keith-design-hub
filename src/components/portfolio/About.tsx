import { ArrowUpRight } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { EDUCATION } from "@/lib/portfolio-data";

const SUBHEAD =
  "font-mono text-[11px] font-semibold uppercase tracking-wider text-[#161616] dark:text-[#EDEDED]";

export function About() {
  return (
    <div className="w-full flex flex-col text-left">
      <h2 className="mb-6 sm:mb-8 font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
        Background & Education
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Profile */}
        <div className="flex flex-col">
          <h3 className="font-sans text-[clamp(18px,2.4vh,24px)] font-medium tracking-tight text-[#161616] dark:text-[#EDEDED] leading-snug">
            Building clean, modern web experiences.
          </h3>

          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-[#62655E] dark:text-[#A3A3A3]">
            I am a full stack developer specializing in building end-to-end applications from crafting intuitive,
            responsive user interfaces to engineering reliable backend APIs and database architectures.
          </p>

          <div className="mt-8">
            <h4 className={`${SUBHEAD} mb-3`}>Core Specializations</h4>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] px-3 py-1 text-xs font-medium">
                Full Stack Development
              </span>
              <span className="rounded-full bg-white dark:bg-[#141414] text-[#161616] dark:text-[#EDEDED] border border-[#E5E5E0] dark:border-[#262626] px-3 py-1 text-xs font-medium">
                System Design
              </span>
              <span className="rounded-full border border-dashed border-[#1C1C1C]/40 dark:border-white/40 bg-transparent text-[#161616] dark:text-[#EDEDED] px-3 py-1 text-xs font-medium">
                UI/UX Prototyping
              </span>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="flex flex-col">
          <h3 className={`${SUBHEAD} pb-2 border-b border-[#E5E5E0] dark:border-[#262626]`}>Education</h3>

          <div className="divide-y divide-[#E5E5E0] dark:divide-[#262626]">
            {EDUCATION.map((edu) => (
              <div key={edu.school} className="py-3.5 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-sans text-sm font-medium text-[#161616] dark:text-[#EDEDED] leading-snug">
                    {edu.school}
                  </h4>
                  <span className="font-mono text-[11px] text-[#62655E] dark:text-[#A3A3A3] shrink-0 pt-0.5">
                    {edu.period}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#62655E] dark:text-[#A3A3A3]">{edu.detail}</span>
                  <span className="rounded-full border border-[#E5E5E0] dark:border-[#262626] bg-white dark:bg-[#141414] px-2 py-0.5 font-mono text-[10px] text-[#161616] dark:text-[#EDEDED] shrink-0">
                    {edu.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GitHub Contributions */}
      <section className="mt-10 sm:mt-12">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E0] dark:border-[#262626] mb-4">
          <h3 className={SUBHEAD}>GitHub Contributions</h3>
          <a
            href="https://github.com/ciceronkeith4-code"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors"
          >
            <SiGithub className="h-3 w-3" />
            <span>View Profile</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        {/* Light panel in both themes: the chart's empty-day squares are a fixed light gray baked into the image */}
        <div className="overflow-x-auto card-scrollbar rounded-[10px] border border-[#E5E5E0] dark:border-[#262626] bg-[#F6F7F4] p-3 sm:p-4">
          <img
            src="https://ghchart.rshah.org/161616/ciceronkeith4-code"
            alt="Keith Ciceron's GitHub contribution graph for the past year"
            width={663}
            height={104}
            decoding="async"
            className="block h-auto min-w-[600px] w-full"
          />
        </div>
      </section>
    </div>
  );
}
