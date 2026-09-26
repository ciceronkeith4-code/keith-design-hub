import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BentoDashboard } from "@/components/portfolio/BentoDashboard";
import { SECTION_PATHS } from "@/components/portfolio/DashboardLayout";
import { useIntroReady } from "@/lib/intro";
import { pageHead, SITE_DESCRIPTION } from "@/lib/seo";

// Sections used to be tabs addressed by hash (/#projects). Old shared links still land on the right page.
const LEGACY_HASHES: Record<string, string> = {
  ...SECTION_PATHS,
  home: "/",
  trainings: SECTION_PATHS.activities,
};

export const Route = createFileRoute("/_site/")({
  head: () =>
    pageHead({
      path: "/",
      title: "Keith Ciceron | Full Stack Developer",
      description: SITE_DESCRIPTION,
    }),
  component: Home,
});

function Home() {
  const introReady = useIntroReady();
  const navigate = useNavigate();

  useEffect(() => {
    const target = LEGACY_HASHES[window.location.hash.replace(/^#/, "").toLowerCase()];
    if (target && target !== "/") navigate({ to: target, replace: true });
  }, [navigate]);

  return <BentoDashboard introReady={introReady} />;
}
