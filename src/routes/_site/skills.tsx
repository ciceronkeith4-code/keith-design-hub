import { createFileRoute, redirect } from "@tanstack/react-router";

// Skills moved into About (the Stack section).
export const Route = createFileRoute("/_site/skills")({
  beforeLoad: () => {
    throw redirect({ to: "/about", statusCode: 301 });
  },
});
