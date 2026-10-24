import { createFileRoute } from "@tanstack/react-router";
import { Certifications } from "@/components/portfolio/Certifications";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/certifications")({
  head: () =>
    pageHead({
      path: "/certifications",
      title: "Certifications | Keith Ciceron",
      description:
        "Keith Ciceron's certificates: Basic Java Programming and Java Programming with GUI, from Project Tuklas Teknolohiya webinars in 2026.",
    }),
  component: Certifications,
});
