import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/portfolio/About";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/about")({
  head: () =>
    pageHead({
      path: "/about",
      title: "About | Keith Ciceron",
      description:
        "Keith Ciceron builds web systems for clients as a freelancer and is finishing a BSIT at San Sebastian College Recoletos Manila. Education and the stack behind each project.",
    }),
  component: About,
});
