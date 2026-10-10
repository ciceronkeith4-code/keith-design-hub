import { createFileRoute } from "@tanstack/react-router";
import { Guestbook } from "@/components/portfolio/Guestbook";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/guestbook")({
  head: () => {
    const head = pageHead({
      path: "/guestbook",
      title: "Guestbook | Keith Ciceron",
      description:
        "Leave a note for Keith Ciceron. Sign in with Google and your name and photo appear with it.",
    });
    // The page lists visitors' names and photos, so it stays out of search results.
    return { ...head, meta: [...head.meta, { name: "robots", content: "noindex" }] };
  },
  component: Guestbook,
});
