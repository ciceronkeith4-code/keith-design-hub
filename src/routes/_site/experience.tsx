import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "@/components/portfolio/Experience";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/experience")({
  head: () =>
    pageHead({
      path: "/experience",
      title: "Experience | Keith Ciceron",
      description:
        "Work history of Keith Ciceron: freelance web development, 3+ years testing web and mobile apps at Opoli Technology Inc., and workshops and events.",
    }),
  component: Experience,
});
