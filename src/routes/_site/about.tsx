import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/portfolio/About";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/about")({
  head: () =>
    pageHead({
      path: "/about",
      title: "About | Keith Ciceron",
      description:
        "Keith Ciceron is a full stack developer and BSIT student at San Sebastian College Recoletos Manila. Background, education, and core specializations.",
    }),
  component: About,
});
