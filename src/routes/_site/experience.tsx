import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "@/components/portfolio/Experience";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/experience")({
  head: () =>
    pageHead({
      path: "/experience",
      title: "Experience | Keith Ciceron",
      description:
        "Work history of Keith Ciceron: 3+ years as a Dev Assistant testing web and mobile apps at Opoli Technology Inc., plus freelance photo and video editing.",
    }),
  component: Experience,
});
