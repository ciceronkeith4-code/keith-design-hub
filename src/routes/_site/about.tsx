import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/portfolio/About";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/about")({
  head: () =>
    pageHead({
      path: "/about",
      title: "About | Keith Ciceron",
      description:
        "Keith Ciceron is a full stack developer in Manila who builds web systems end to end, with 3+ years of QA for a leading US ride-hailing app. Education and the stack behind each project.",
    }),
  component: About,
});
