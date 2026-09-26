import { createFileRoute } from "@tanstack/react-router";
import { Skills } from "@/components/portfolio/Skills";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/skills")({
  head: () =>
    pageHead({
      path: "/skills",
      title: "Skills | Keith Ciceron",
      description:
        "The technologies Keith Ciceron works with across frontend, backend, databases, and tools, each linked to the projects where it was used.",
    }),
  component: Skills,
});
