import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PROJECTS, STACK_TAGS, type Project } from "@/data/projects";
import { DeviceStage } from "./DeviceStage";

/** Only tags some project actually uses, in stack order. */
const FILTER_TAGS = ["All", ...STACK_TAGS];

const pad = (n: number) => String(n).padStart(2, "0");

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F4A3A] dark:focus-visible:outline-[#B4C0A4]";

const MUTED = "text-[#5E615A] dark:text-[#A3A3A3]";

export function Projects() {
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.stack.includes(filter));

  return (
    <div className="w-full font-display text-[#141414] dark:text-[#EDEDED]">
      <header>
        <div
          className={`flex items-center justify-between gap-4 font-display-mono text-[11px] ${MUTED}`}
        >
          <span>/projects</span>
          <span aria-live="polite">
            {pad(shown.length)} {shown.length === 1 ? "project" : "projects"}
          </span>
        </div>
        <h1 className="mt-5 text-[clamp(32px,4.4vw,46px)] font-semibold leading-[1.02] tracking-[-0.035em]">
          Selected works
        </h1>
        <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-[#3A3C38] dark:text-[#C8C8C8]">
          Client systems, school projects, and organization portals, each shown at desktop, tablet,
          and mobile widths.
        </p>

        {/* Plain text filters; the row scrolls sideways on phones instead of wrapping. */}
        <div
          role="group"
          aria-label="Filter projects by technology"
          className="no-scrollbar -mx-6 mt-8 flex gap-5 overflow-x-auto border-b border-black/12 px-6 font-display-mono text-xs sm:mx-0 sm:flex-wrap sm:gap-x-6 sm:gap-y-1 sm:overflow-visible sm:px-0 dark:border-white/12"
        >
          {FILTER_TAGS.map((tag) => {
            const active = filter === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setFilter(tag)}
                aria-pressed={active}
                className={`shrink-0 whitespace-nowrap py-3 cursor-pointer underline-offset-[7px] transition-colors ${FOCUS_RING} ${
                  active
                    ? "text-[#141414] underline decoration-[#3F4A3A] decoration-2 dark:text-[#EDEDED] dark:decoration-[#B4C0A4]"
                    : `${MUTED} hover:text-[#141414] dark:hover:text-[#EDEDED]`
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </header>

      {shown.length === 0 ? (
        <div className="py-12">
          <p className={`font-display-mono text-xs ${MUTED}`}>No projects tagged {filter} yet.</p>
          <button
            type="button"
            onClick={() => setFilter("All")}
            className={`mt-3 text-sm font-medium underline decoration-black/30 underline-offset-4 hover:decoration-current cursor-pointer dark:decoration-white/30 ${FOCUS_RING}`}
          >
            Show all projects
          </button>
        </div>
      ) : (
        <ol>
          {shown.map((project) => (
            <ProjectRow
              key={project.slug}
              project={project}
              number={PROJECTS.indexOf(project) + 1}
              total={PROJECTS.length}
            />
          ))}
        </ol>
      )}
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
  const [ref, reveal] = useRevealOnScroll<HTMLLIElement>();
  const titleId = `project-${project.slug}`;
  const meta = [project.status, project.year, project.role].filter(Boolean);
  const { live, code } = project.links;

  return (
    <li
      ref={ref}
      className={`border-b border-black/12 py-10 sm:py-14 dark:border-white/12 ${
        reveal === "waiting"
          ? "translate-y-[10px] opacity-0"
          : reveal === "shown"
            ? "translate-y-0 opacity-100 transition-[opacity,transform] duration-300 ease-out"
            : ""
      }`}
    >
      {/* Desktop: text | scene on one grid row with bottoms aligned; the tabs sit on a second
          row under the scene. Narrower: text, scene, tabs stacked. */}
      <article
        aria-labelledby={titleId}
        className="grid grid-cols-1 lg:grid-cols-12 lg:items-end lg:gap-x-10"
      >
        <div className="flex flex-col lg:col-span-5 lg:row-start-1">
          <div className={`flex items-center gap-3 font-display-mono text-[11px] ${MUTED}`}>
            <span>
              <span className="text-[#141414] dark:text-[#EDEDED]">{pad(number)}</span> /{" "}
              {pad(total)}
            </span>
            {project.featured && (
              <span className="rounded-[2px] border border-black/20 px-1.5 py-px text-[#141414] dark:border-white/25 dark:text-[#EDEDED]">
                Featured
              </span>
            )}
          </div>

          <p className={`mt-4 font-display-mono text-[11px] ${MUTED}`}>{project.type}</p>
          <h2
            id={titleId}
            className="mt-1.5 text-[clamp(22px,2.6vw,28px)] font-semibold leading-[1.15] tracking-[-0.025em] text-balance"
          >
            {project.name}
          </h2>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-[#3A3C38] dark:text-[#C8C8C8]">
            {project.summary}
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
              className={`font-medium underline decoration-black/30 underline-offset-4 hover:decoration-current dark:decoration-white/30 ${FOCUS_RING}`}
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
      className={`${MUTED} hover:text-[#141414] dark:hover:text-[#EDEDED] transition-colors ${FOCUS_RING}`}
    >
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

/**
 * Rows already on screen at load render as-is; rows further down wait below the fold and then
 * fade and rise 10px as they scroll in. Skipped entirely with reduced motion.
 */
function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState<"static" | "waiting" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setState("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("shown");
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, state] as const;
}
