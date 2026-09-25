import { EXPERIENCE } from "@/lib/portfolio-data";

export function Experience() {
  return (
    <div className="w-full flex flex-col text-left">
      <h2 className="mb-6 sm:mb-8 font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
        Work History
      </h2>

      {/* Entries separated by a 1px divider, no cards */}
      <div className="divide-y divide-[#E5E5E0] dark:divide-[#262626]">
        {EXPERIENCE.map((item) => (
          <div
            key={item.company + item.role}
            className="py-6 first:pt-0 last:pb-0 flex flex-col"
          >
            {/* Header: Role, Company on Left; Date on Right in Monospace */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <h3 className="font-sans text-base font-semibold text-[#161616] dark:text-[#EDEDED]">
                  {item.role}
                </h3>
                <p className="mt-0.5 text-sm text-[#62655E] dark:text-[#A3A3A3]">
                  {item.company}
                </p>
              </div>

              <span className="font-mono text-xs text-[#62655E] dark:text-[#A3A3A3] shrink-0 self-start sm:self-auto">
                {item.period}
              </span>
            </div>

            {/* All bullets as plain text */}
            <ul className="mt-4 space-y-1.5">
              {item.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed text-[#4A4D47] dark:text-[#CCCCCC]"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#161616] dark:bg-[#EDEDED]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
