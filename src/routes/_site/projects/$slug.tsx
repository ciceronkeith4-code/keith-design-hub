import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { PROJECTS } from "@/lib/portfolio-data";
import { CASE_STUDIES } from "@/lib/case-studies";
import { Lightbox, type LightboxImage } from "@/components/portfolio/Lightbox";
import { pageHead, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/_site/projects/$slug")({
  loader: ({ params }) => {
    const index = PROJECTS.findIndex((p) => p.slug === params.slug);
    const study = CASE_STUDIES[params.slug];
    if (index === -1 || !study) throw notFound();
    return { index };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const project = PROJECTS[loaderData.index];
    const study = CASE_STUDIES[params.slug];
    const base = pageHead({
      path: `/projects/${project.slug}`,
      title: `${project.title} | Keith Ciceron`,
      description: study.summary,
    });
    const image = `${SITE_URL}${project.image}`;
    return {
      ...base,
      meta: [
        ...base.meta,
        { property: "og:type", content: "article" },
        { property: "og:image", content: image },
        { name: "twitter:image", content: image },
      ],
    };
  },
  component: CaseStudyPage,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="w-full border-t border-[#E3E5E0] dark:border-[#262626] pt-5 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-10 gap-y-3">
      <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#161616] dark:text-[#EDEDED]">
        {title}
      </h2>
      <div className="min-w-0 text-sm leading-relaxed text-[#3A3C38] dark:text-[#C8C8C8]">
        {children}
      </div>
    </section>
  );
}

function CaseStudyPage() {
  const { index } = Route.useLoaderData();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const project = PROJECTS[index];
  const study = CASE_STUDIES[project.slug];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const images: LightboxImage[] = project.shots.map((src) => ({ src, caption: project.title }));

  return (
    <>
      <article className="w-full flex flex-col items-start text-left gap-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All projects
        </Link>

        <header className="w-full flex flex-col items-start">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#62655E] dark:text-[#A3A3A3]">
            {study.builtFor}
          </p>
          <h1 className="mt-3 font-sans text-[clamp(26px,4vw,40px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
            {project.title}
          </h1>
          <p className="mt-4 max-w-[68ch] text-sm sm:text-base leading-relaxed text-[#62655E] dark:text-[#A3A3A3]">
            {study.summary}
          </p>

          {(project.demo || project.github) && (
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] hover:bg-[#333333] dark:hover:bg-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  Live site
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#E3E5E0] dark:border-[#262626] px-4 py-2 text-sm font-medium text-[#161616] dark:text-[#EDEDED] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <FaGithub className="h-3.5 w-3.5" />
                  Source code
                </a>
              )}
            </div>
          )}
        </header>

        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          aria-label={`View screenshots of ${project.title}`}
          className="w-full overflow-hidden rounded-xl border border-[#E3E5E0] dark:border-[#262626] bg-[#E1E4DD] dark:bg-[#1A1A1A] cursor-zoom-in"
        >
          <img
            src={project.image}
            alt={`${project.title} screenshot`}
            className="w-full max-h-[460px] object-cover object-top"
          />
        </button>

        <div className="w-full flex flex-col gap-8">
          <Section title="At a glance">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {study.role && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-[#62655E] dark:text-[#A3A3A3]">
                    Role
                  </dt>
                  <dd className="mt-1">{study.role}</dd>
                </div>
              )}
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-[#62655E] dark:text-[#A3A3A3]">
                  Stack
                </dt>
                <dd className="mt-1">{project.tech.join(" · ")}</dd>
              </div>
            </dl>
          </Section>

          {study.problem && (
            <Section title="The problem">
              <p className="max-w-[68ch]">{study.problem}</p>
            </Section>
          )}

          <Section title="What I built">
            <ul className="max-w-[68ch] flex flex-col gap-2 list-disc pl-4 marker:text-[#A3A69E]">
              {study.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </Section>

          <Section title="Technical decisions">
            <div className="max-w-[68ch] flex flex-col gap-4">
              {study.decisions.map((d) => (
                <div key={d.title}>
                  <h3 className="font-semibold text-[#161616] dark:text-[#EDEDED]">{d.title}</h3>
                  <p className="mt-1">{d.body}</p>
                </div>
              ))}
            </div>
          </Section>

          {study.challenges && (
            <Section title="Challenges">
              <p className="max-w-[68ch]">{study.challenges}</p>
            </Section>
          )}

          {study.outcome && (
            <Section title="Outcome">
              <p className="max-w-[68ch]">{study.outcome}</p>
            </Section>
          )}

          {project.shots.length > 1 && (
            <Section title="Screenshots">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.shots.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Open screenshot ${i + 1} of ${project.shots.length}`}
                    className="aspect-[16/10] overflow-hidden rounded-lg border border-[#E3E5E0] dark:border-[#262626] bg-[#E1E4DD] dark:bg-[#1A1A1A] cursor-zoom-in"
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            </Section>
          )}
        </div>

        {next.slug !== project.slug && (
          <Link
            to="/projects/$slug"
            params={{ slug: next.slug }}
            className="group w-full border-t border-[#E3E5E0] dark:border-[#262626] pt-5 flex items-center justify-between gap-4"
          >
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#62655E] dark:text-[#A3A3A3]">
                Next project
              </span>
              <span className="mt-1 block truncate text-sm font-semibold text-[#161616] dark:text-[#EDEDED] group-hover:underline">
                {next.title}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#161616] dark:text-[#EDEDED] transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </article>

      <Lightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
