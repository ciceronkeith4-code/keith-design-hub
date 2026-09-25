import { useState, useEffect } from "react";
import { ExternalLink, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { PROJECTS } from "@/lib/portfolio-data";
import { Lightbox, type LightboxImage } from "./Lightbox";

const FILTER_TAGS = [
  "All",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "PHP",
  "MySQL",
  "Next.js",
  "Supabase",
] as const;

interface ProjectsProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

const ITEMS_PER_PAGE = 3;

export function Projects({ activeFilter = "All", onFilterChange }: ProjectsProps) {
  const [internalFilter, setInternalFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [lightbox, setLightbox] = useState<{ images: LightboxImage[]; index: number } | null>(null);

  const currentFilter = onFilterChange ? activeFilter : internalFilter;
  const setFilter = onFilterChange || setInternalFilter;

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilter]);

  const filteredProjects = currentFilter === "All"
    ? PROJECTS
    : PROJECTS.filter((p) => p.tech.some((t) => t.toLowerCase() === currentFilter.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full flex flex-col text-left">
      {/* Page Title & Filter Pills */}
      <div className="shrink-0 flex flex-col mb-4">
        <h2 className="mb-6 sm:mb-8 font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
          Selected Works
        </h2>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto card-scrollbar py-0.5" role="group" aria-label="Filter projects by technology">
          {FILTER_TAGS.map((tag) => {
            const isActive = currentFilter === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setFilter(tag)}
                aria-pressed={isActive}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616]"
                    : "bg-white/80 dark:bg-[#141414] text-[#161616] dark:text-[#EDEDED] border border-[#E3E5E0] dark:border-[#262626] hover:bg-[#ECEEEA] dark:hover:bg-[#1F1F1F]"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Flat Rows separated by thin 1px dividers */}
      {filteredProjects.length === 0 ? (
        <div className="flex-1 min-h-0 flex flex-col items-start justify-center py-8">
          <p className="font-mono text-xs sm:text-sm text-[#62655E] dark:text-[#A3A3A3]">
            No projects match the selected filter.
          </p>
          <button
            type="button"
            onClick={() => setFilter("All")}
            className="mt-3 rounded-md bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] px-4 py-1.5 text-xs font-medium hover:bg-[#333333] dark:hover:bg-white transition-colors cursor-pointer"
          >
            Show all projects
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col justify-between">
          {/* List of Flat Project Rows */}
          <div className="divide-y divide-[#E3E5E0] dark:divide-[#262626] border-t border-b border-[#E3E5E0] dark:border-[#262626]">
            {paginatedProjects.map((project, idx) => {
              const isFirstCardOnPage1 = validPage === 1 && idx === 0 && currentFilter === "All";

              return (
                <article
                  key={project.title}
                  className="flex flex-row items-center gap-4 sm:gap-5 py-4 min-h-0 shrink-0 group"
                >
                  {/* Thumbnail (Permitted card/thumbnail container) */}
                  <div className="w-[120px] sm:w-[150px] h-[80px] sm:h-[92px] shrink-0 relative overflow-hidden rounded-lg border border-[#E3E5E0] dark:border-[#262626] bg-[#ECEEEA] dark:bg-[#1A1A1A]">
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  {/* Text Information */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isFirstCardOnPage1 && (
                          <span className="rounded-full bg-[#E3F27A] dark:bg-[#E3F27A] text-[#161616] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider shrink-0">
                            Featured
                          </span>
                        )}

                        <h3 className="font-sans text-xs sm:text-sm font-semibold text-[#161616] dark:text-[#EDEDED] leading-snug">
                          {project.title}
                        </h3>
                      </div>

                      <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-[#62655E] dark:text-[#A3A3A3] line-clamp-2">
                        {project.description}
                      </p>

                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {project.tech.slice(0, 5).map((tech) => (
                          <span
                            key={tech}
                            className="font-mono text-[10px] text-[#62655E] dark:text-[#A3A3A3] after:content-[','] last:after:content-[''] pr-1"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setLightbox({
                            images: (project.shots ?? [project.image]).map((src) => ({
                              src,
                              caption: `${project.title} — ${project.description}`,
                            })),
                            index: 0,
                          })
                        }
                        aria-label={`View screenshots for ${project.title}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#161616] dark:text-[#EDEDED] hover:underline cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Screenshots</span>
                      </button>

                      {project.demo ? (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#161616] dark:text-[#EDEDED] hover:underline cursor-pointer"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="font-mono text-[10px] text-[#62655E] dark:text-[#A3A3A3]">
                          (School Project)
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Clean Pagination Controls Bar */}
          {totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validPage <= 1}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <span className="font-mono text-xs text-[#62655E] dark:text-[#A3A3A3] font-medium tracking-wider">
                {validPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validPage >= totalPages}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal Overlay */}
      <Lightbox
        images={lightbox?.images ?? []}
        index={lightbox?.index ?? null}
        onClose={() => setLightbox(null)}
        onIndexChange={(next) =>
          setLightbox((current) => (current ? { ...current, index: next } : current))
        }
      />
    </div>
  );
}
