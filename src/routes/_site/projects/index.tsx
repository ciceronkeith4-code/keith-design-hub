import { createFileRoute } from "@tanstack/react-router";
import { Projects } from "@/components/portfolio/Projects";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/projects/")({
  head: () =>
    pageHead({
      path: "/projects",
      title: "Projects | Keith Ciceron",
      description:
        "Selected work by Keith Ciceron: client systems, school projects, and organization portals, each with a case study, its stack, and live links.",
    }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return <Projects />;
}
