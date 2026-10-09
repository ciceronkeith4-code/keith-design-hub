import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "@/components/portfolio/Experience";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/experience")({
  head: () =>
    pageHead({
      path: "/experience",
      title: "Experience | Keith Ciceron",
      description:
        "Keith Ciceron's experience: freelance full stack development for businesses and organizations, 3+ years of QA for one of the leading ride-hailing apps in the US, and workshops and events.",
    }),
  component: Experience,
});
