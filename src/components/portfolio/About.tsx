import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { EDUCATION, SKILLS } from "@/lib/portfolio-data";
import { PROJECTS } from "@/data/projects";

const SUBHEAD =
  "font-mono text-[11px] font-semibold uppercase tracking-wider text-[#161616] dark:text-[#EDEDED]";
const MUTED = "text-[#62655E] dark:text-[#A3A3A3]";
const LINK =
  "underline decoration-[#C9CCC4] dark:decoration-[#3A3A3A] underline-offset-2 hover:text-[#161616] dark:hover:text-[#EDEDED] hover:decoration-current";

/** Stack entries grouped in SKILLS order, keeping only what a project actually used (and QA). */
const STACK_GROUPS = SKILLS.reduce<{ group: string; skills: (typeof SKILLS)[number][] }[]>(
  (groups, skill) => {
    const used = skill.name === "QA Testing" || PROJECTS.some((p) => p.stack.includes(skill.name));
    if (!used) return groups;
    const last = groups[groups.length - 1];
    if (last?.group === skill.group) last.skills.push(skill);
    else groups.push({ group: skill.group, skills: [skill] });
    return groups;
  },
  [],
);

export function About() {
  return (
    <div className="w-full flex flex-col text-left">
      <h1 className="mb-6 sm:mb-8 font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
        About
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
        <div className="flex flex-col gap-3 max-w-[60ch] text-sm leading-relaxed text-[#3A3C38] dark:text-[#C8C8C8]">
          <p>
            I spent September 2022 to December 2025 as a Dev Assistant at Opoli Technology, testing
            web and mobile apps.
          </p>
          <p>
            I now build web systems for clients as a freelancer while finishing my BSIT at San
            Sebastian College Recoletos Manila.
          </p>
        </div>

        {/* Education */}
        <div className="flex flex-col">
          <h2 className={`${SUBHEAD} pb-2 border-b border-[#E5E5E0] dark:border-[#262626]`}>
            Education
          </h2>

          <div className="divide-y divide-[#E5E5E0] dark:divide-[#262626]">
            {EDUCATION.map((edu) => (
              <div key={edu.school} className="py-3.5 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-sans text-sm font-medium text-[#161616] dark:text-[#EDEDED] leading-snug">
                    {edu.school}
                  </h3>
                  <span className={`font-mono text-[11px] ${MUTED} shrink-0 pt-0.5`}>
                    {edu.period}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className={`text-xs ${MUTED}`}>{edu.detail}</span>
                  <span className="rounded-full border border-[#E5E5E0] dark:border-[#262626] bg-white dark:bg-[#141414] px-2 py-0.5 font-mono text-[10px] text-[#161616] dark:text-[#EDEDED] shrink-0">
                    {edu.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stack: every entry names the projects that used it */}
      <section className="mt-10 sm:mt-12">
        <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-[#E5E5E0] dark:border-[#262626] mb-4">
          <h2 className={SUBHEAD}>Stack</h2>
          <p className={`text-xs ${MUTED}`}>Each entry links to where I used it.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
          {STACK_GROUPS.map(({ group, skills }) => (
            <div key={group}>
              <h3 className={`font-mono text-[10px] uppercase tracking-wider ${MUTED} mb-1`}>
                {group}
              </h3>
              <div className="divide-y divide-[#E5E5E0]/60 dark:divide-[#262626]">
                {skills.map((skill) => {
                  const Icon = skill.icon;
                  const usedIn = PROJECTS.filter((p) => p.stack.includes(skill.name));
                  return (
                    <div key={skill.name} className="py-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-[#161616] dark:text-[#EDEDED]">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{skill.name}</span>
                      </div>
                      <p
                        className={`mt-0.5 pl-[22px] font-mono text-[10px] leading-relaxed ${MUTED}`}
                      >
                        {skill.name === "QA Testing" ? (
                          <Link to="/experience" hash="opoli" className={LINK}>
                            Dev Assistant at Opoli Technology
                          </Link>
                        ) : (
                          usedIn.map((p, i) => (
                            <span key={p.slug}>
                              {i > 0 && ", "}
                              <Link to="/projects/$slug" params={{ slug: p.slug }} className={LINK}>
                                {p.name}
                              </Link>
                            </span>
                          ))
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GitHub Contributions */}
      <section className="mt-10 sm:mt-12">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E0] dark:border-[#262626] mb-4">
          <h2 className={SUBHEAD}>GitHub Contributions</h2>
          <a
            href="https://github.com/ciceronkeith4-code"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs ${MUTED} hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors`}
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
