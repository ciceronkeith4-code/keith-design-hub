import { createFileRoute, redirect } from "@tanstack/react-router";

// Activities moved into Experience (Workshops & Events).
export const Route = createFileRoute("/_site/activities")({
  beforeLoad: () => {
    throw redirect({ to: "/experience", statusCode: 301 });
  },
});
