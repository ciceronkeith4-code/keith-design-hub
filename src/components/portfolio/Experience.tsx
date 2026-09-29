import { EXPERIENCE, TRAININGS } from "@/lib/portfolio-data";

const MUTED = "text-[#62655E] dark:text-[#A3A3A3]";

export function Experience() {
  return (
    <div className="w-full flex flex-col text-left">
      <h1 className="mb-6 sm:mb-8 font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
        Experience
      </h1>

      {/* Entries separated by a 1px divider, no cards */}
      <div className="divide-y divide-[#E5E5E0] dark:divide-[#262626]">
        {EXPERIENCE.map((item) => (
          <div
            key={item.id}
            id={item.id}
            className="scroll-mt-6 py-6 first:pt-0 last:pb-0 flex flex-col"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <h2 className="font-sans text-base font-semibold text-[#161616] dark:text-[#EDEDED]">
                  {item.role}
                </h2>
                <p className={`mt-0.5 text-sm ${MUTED}`}>{item.company}</p>
              </div>

              {item.period && (
                <span className={`font-mono text-xs ${MUTED} shrink-0 self-start sm:self-auto`}>
                  {item.period}
                </span>
              )}
            </div>

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

      {/* Workshops and events, compact, below the work history */}
      <section className="mt-12">
        <h2 className="pb-2 border-b border-[#E5E5E0] dark:border-[#262626] font-mono text-[11px] font-semibold uppercase tracking-wider text-[#161616] dark:text-[#EDEDED]">
          Workshops & Events
        </h2>
        <ul className="divide-y divide-[#E5E5E0] dark:divide-[#262626]">
          {TRAININGS.map((item) => (
            <li
              key={item.title}
              className="py-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-6"
            >
              <span className="text-sm text-[#161616] dark:text-[#EDEDED]">
                {item.title}
                <span className={`ml-2 text-xs ${MUTED}`}>{item.role}</span>
              </span>
              <span className={`font-mono text-xs ${MUTED} shrink-0`}>{item.date}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
