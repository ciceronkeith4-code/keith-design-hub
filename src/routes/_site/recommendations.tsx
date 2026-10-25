import { createFileRoute } from "@tanstack/react-router";
import { Recommendations } from "@/components/portfolio/Recommendations";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/recommendations")({
  head: () => {
    const head = pageHead({
      path: "/recommendations",
      title: "Recommendations | Keith Ciceron",
      description:
        "Recommendations for Keith Ciceron. Sign in with Google to write one; your name and photo appear with it.",
    });
    // The page lists visitors' names and photos, so it stays out of search results.
    return { ...head, meta: [...head.meta, { name: "robots", content: "noindex" }] };
  },
  component: Recommendations,
});
