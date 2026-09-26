import { createFileRoute } from "@tanstack/react-router";
import { Trainings } from "@/components/portfolio/Trainings";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/activities")({
  head: () =>
    pageHead({
      path: "/activities",
      title: "Activities | Keith Ciceron",
      description:
        "Workshops, hackathons, and events Keith Ciceron has joined, including the DEVCON Hackathon and sessions on AWS and practical AI.",
    }),
  component: Trainings,
});
