import { createFileRoute } from "@tanstack/react-router";
import { Projects } from "@/components/portfolio/Projects";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/projects/")({
  head: () => {
    const base = pageHead({
      path: "/projects",
      title: "Projects | Keith Ciceron",
      description:
        "Selected work by Keith Ciceron: client systems, school projects, and organization portals, each with a case study, its stack, and live links.",
    });
    return {
      ...base,
      links: [
        ...base.links,
        // Geist and Geist Mono are only used here, so only this page pays for them.
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap",
        },
      ],
    };
  },
  component: ProjectsPage,
});

function ProjectsPage() {
  return <Projects />;
}
