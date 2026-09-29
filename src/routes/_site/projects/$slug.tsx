import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { PROJECTS } from "@/data/projects";
import { Lightbox, type LightboxImage } from "@/components/portfolio/Lightbox";
import { pageHead, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/_site/projects/$slug")({
  loader: ({ params }) => {
    const index = PROJECTS.findIndex((p) => p.slug === params.slug);
    if (index === -1) throw notFound();
    return { index };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const project = PROJECTS[loaderData.index];
    const base = pageHead({
      path: `/projects/${project.slug}`,
      title: `${project.name} | Keith Ciceron`,
      description: project.intro,
    });
    const cover = project.images[0];
    if (!cover) return base;
    const image = `${SITE_URL}${cover.src}`;
    return {
      ...base,
      meta: [
        ...base.meta,
        { property: "og:type", content: "article" },
        { property: "og:image", content: image },
        { property: "og:image:alt", content: cover.alt },
        { name: "twitter:image", content: image },
      ],
    };
  },
  component: CaseStudyPage,
});

const MUTED = "text-[#62655E] dark:text-[#A3A3A3]";
const LABEL = `font-mono text-xs ${MUTED}`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="w-full border-t border-[#E3E5E0] dark:border-[#262626] pt-5 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-10 gap-y-3">
      <h2 className="font-mono text-xs font-semibold text-[#161616] dark:text-[#EDEDED]">
        {title}
      </h2>
      <div className="min-w-0 text-sm leading-relaxed text-[#3A3C38] dark:text-[#C8C8C8]">
        {children}
      </div>
    </section>
  );
}

/**
 * Every case study has the same sections in the same order: header, at a glance, what I built,
 * technical decisions, screenshots, next project. A section with no data is skipped.
 */
function CaseStudyPage() {
  const { index } = Route.useLoaderData();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const project = PROJECTS[index];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const [hero, ...screenshots] = project.images;
  const images: LightboxImage[] = project.images.map((image) => ({
    src: image.src,
    alt: image.alt,
    caption: image.alt,
  }));
  const { live, code } = project.links;

  const glance = [
    { term: "Client", value: project.client },
    { term: "Role", value: project.role },
    { term: "Year", value: project.year },
    { term: "Status", value: project.status },
    { term: "Stack", value: project.stack.join(" · ") },
  ].filter((row) => row.value);

  return (
    <>
      <article className="w-full flex flex-col items-start text-left gap-8">
        <Link
          to="/projects"
          className={`font-mono text-xs ${MUTED} hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors`}
        >
          <span aria-hidden="true">← </span>All projects
        </Link>

        <header className="w-full flex flex-col items-start">
          <p className={LABEL}>{project.type}</p>
          <h1 className="mt-3 font-sans text-[clamp(26px,4vw,40px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
            {project.name}
          </h1>
          <p className={`mt-4 max-w-[68ch] text-sm sm:text-base leading-relaxed ${MUTED}`}>
            {project.intro}
          </p>

          {(live || code) && (
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              {live && (
                <a
                  href={live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] hover:bg-[#333333] dark:hover:bg-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  Live site <span aria-hidden="true">↗</span>
                </a>
              )}
              {code && (
                <a
                  href={code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#E3E5E0] dark:border-[#262626] px-4 py-2 text-sm font-medium text-[#161616] dark:text-[#EDEDED] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Code <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          )}
        </header>

        {hero && (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            aria-label={`Enlarge: ${hero.alt}`}
            className="w-full overflow-hidden rounded-[4px] border border-[#E3E5E0] dark:border-[#262626] bg-[#E1E4DD] dark:bg-[#1A1A1A] cursor-zoom-in"
          >
            <img
              src={hero.src}
              alt={hero.alt}
              className="w-full max-h-[460px] object-cover object-top"
            />
          </button>
        )}

        <div className="w-full flex flex-col gap-8">
          {glance.length > 0 && (
            <Section title="At a glance">
              <dl className="grid grid-cols-[80px_1fr] gap-x-6 gap-y-3">
                {glance.map((row) => (
                  <div key={row.term} className="contents">
                    <dt className={`pt-0.5 font-mono text-xs ${MUTED}`}>{row.term}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {project.built.length > 0 && (
            <Section title="What I built">
              <ul className="max-w-[68ch] flex flex-col gap-2 list-disc pl-4 marker:text-[#A3A69E]">
                {project.built.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Section>
          )}

          {project.decisions.length > 0 && (
            <Section title="Technical decisions">
              <div className="max-w-[68ch] flex flex-col gap-4">
                {project.decisions.map((d) => (
                  <div key={d.title}>
                    <h3 className="font-semibold text-[#161616] dark:text-[#EDEDED]">{d.title}</h3>
                    <p className="mt-1">{d.body}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {screenshots.length > 0 && (
            <Section title="Screenshots">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {screenshots.map((image, i) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setLightboxIndex(i + 1)}
                    aria-label={`Enlarge: ${image.alt}`}
                    className="aspect-[16/10] overflow-hidden rounded-[4px] border border-[#E3E5E0] dark:border-[#262626] bg-[#E1E4DD] dark:bg-[#1A1A1A] cursor-zoom-in"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
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
              <span className={`block font-mono text-xs ${MUTED}`}>Next project</span>
              <span className="mt-1 block truncate text-sm font-semibold text-[#161616] dark:text-[#EDEDED] group-hover:underline">
                {next.name}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="shrink-0 text-[#161616] dark:text-[#EDEDED] transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        )}
      </article>

      <Lightbox
        images={images}
        index={lightboxIndex}
        label={`${project.name} screenshots`}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
