import { createFileRoute } from "@tanstack/react-router";
import { Certifications } from "@/components/portfolio/Certifications";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/certifications")({
  head: () =>
    pageHead({
      path: "/certifications",
      title: "Certifications | Keith Ciceron",
      description:
        "Keith Ciceron's certificates, from a 500-hour full stack internship to courses in CSS, Azure, AI, Python, SQL, IoT and Java.",
    }),
  component: Certifications,
});
