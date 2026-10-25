import { createFileRoute, redirect } from "@tanstack/react-router";

// The guestbook became Recommendations (same entries).
export const Route = createFileRoute("/_site/guestbook")({
  beforeLoad: () => {
    throw redirect({ to: "/recommendations", statusCode: 301 });
  },
});
