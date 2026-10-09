import { Link } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";
import { PROJECTS, type Project } from "@/data/projects";
import { DeviceStage } from "./DeviceStage";

const pad = (n: number) => String(n).padStart(2, "0");

/** The case study's first sentence doubles as the project's one-line description here. */
const firstSentence = (text: string) => text.match(/^.*?[.?](?=\s|$)/)?.[0] ?? text;

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F4A3A] dark:focus-visible:outline-[#B4C0A4]";

const MUTED = "text-[#5E615A] dark:text-[#A3A3A3]";

export function Projects() {
  return (
    <div className="w-full font-display text-[#141414] dark:text-[#EDEDED]">
      <header className="border-b border-black/12 pb-8 dark:border-white/12">
        <h1 className="text-[clamp(32px,4.4vw,46px)] font-semibold leading-[1.02] tracking-[-0.035em]">
          Work
        </h1>
        <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-[#3A3C38] dark:text-[#C8C8C8]">
          Web systems for businesses, a local government, and schools. Each has a case study and is
          shown at desktop, tablet, and mobile sizes.
        </p>
      </header>

      <ol>
        {PROJECTS.map((project, i) => (
          <ProjectRow key={project.slug} project={project} number={i + 1} total={PROJECTS.length} />
        ))}
      </ol>
    </div>
  );
}

function ProjectRow({
  project,
  number,
  total,
}: {
  project: Project;
  number: number;
  total: number;
}) {
  const titleId = `project-${project.slug}`;
  const meta = [project.status, project.timeline, project.role].filter(Boolean);
  const { live, code } = project.links;

  return (
    <li className="border-b border-black/12 py-10 sm:py-14 dark:border-white/12">
      {/* Desktop: text | scene on one grid row with bottoms aligned; the tabs sit on a second
          row under the scene. Narrower: text, scene, tabs stacked. */}
      <article
        aria-labelledby={titleId}
        className="grid grid-cols-1 lg:grid-cols-12 lg:items-end lg:gap-x-10"
      >
        <div className="flex flex-col lg:col-span-5 lg:row-start-1">
          <p className={`font-display-mono text-[11px] ${MUTED}`}>
            <span className="text-[#141414] dark:text-[#EDEDED]">{pad(number)}</span> / {pad(total)}
          </p>

          <p className={`mt-4 font-display-mono text-[11px] ${MUTED}`}>{project.type}</p>
          <h2
            id={titleId}
            className="mt-1.5 text-[clamp(22px,2.6vw,28px)] font-semibold leading-[1.15] tracking-[-0.025em] text-balance"
          >
            {project.name}
          </h2>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-[#3A3C38] dark:text-[#C8C8C8]">
            {firstSentence(project.intro)}
          </p>

          <div
            className={`mt-6 flex flex-col gap-1.5 font-display-mono text-[11px] leading-relaxed ${MUTED}`}
          >
            {meta.length > 0 && <p>{meta.join(" · ")}</p>}
            <p>
              <span className="sr-only">Built with </span>
              {project.stack.join(" · ")}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
            <Link
              to="/projects/$slug"
              params={{ slug: project.slug }}
              className={`font-medium transition-opacity hover:opacity-70 ${FOCUS_RING}`}
            >
              Case study <span aria-hidden="true">→</span>
              <span className="sr-only"> for {project.name}</span>
            </Link>
            {live && (
              <ExternalLink href={live} label={`Live site for ${project.name}`}>
                Live site
              </ExternalLink>
            )}
            {code && (
              <ExternalLink href={code} label={`Code for ${project.name}`}>
                Code
              </ExternalLink>
            )}
          </div>
        </div>

        <DeviceStage
          project={project}
          stageClassName="mt-10 min-w-0 lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:mt-0"
          tabsClassName="mt-4 min-w-0 lg:col-span-7 lg:col-start-6 lg:row-start-2"
        />
      </article>
    </li>
  );
}

function ExternalLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      className={`inline-flex items-center gap-1.5 ${MUTED} hover:text-[#141414] dark:hover:text-[#EDEDED] transition-colors ${FOCUS_RING}`}
    >
      {children}
      <ExternalLinkIcon aria-hidden="true" className="h-3.5 w-3.5" />
    </a>
  );
}
