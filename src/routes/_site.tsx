import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { DashboardLayout } from "@/components/portfolio/DashboardLayout";
import { Preloader } from "@/components/portfolio/Preloader";
import { IntroReadyContext } from "@/lib/intro";

// Shared shell for every page: sidebar, top bar, and the one-time intro. It stays mounted across
// navigations, so moving between sections never replays the intro.
export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  const pathname = useLocation({ select: (l) => l.pathname });
  // Case studies are deep links people share; they open straight to the content.
  const [showIntro] = useState(() => !pathname.startsWith("/projects/"));
  const [introReady, setIntroReady] = useState(!showIntro);
  const markIntroReady = useCallback(() => setIntroReady(true), []);

  return (
    <div className="relative h-screen h-[100dvh] w-screen overflow-hidden bg-[#ECEEEA] border-none outline-none">
      {showIntro && <Preloader onComplete={markIntroReady} />}

      <IntroReadyContext.Provider value={introReady}>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </IntroReadyContext.Provider>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
