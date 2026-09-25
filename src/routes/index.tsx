import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { About } from "@/components/portfolio/About";
import { Contact } from "@/components/portfolio/Contact";
import { Experience } from "@/components/portfolio/Experience";
import { Preloader } from "@/components/portfolio/Preloader";
import { Projects } from "@/components/portfolio/Projects";
import { Skills } from "@/components/portfolio/Skills";
import { Trainings } from "@/components/portfolio/Trainings";
import { BentoDashboard } from "@/components/portfolio/BentoDashboard";
import { DashboardLayout, type TabId } from "@/components/portfolio/DashboardLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Keith Ciceron | Full Stack Developer" },
      { name: "description", content: "Full Stack Developer passionate about building clean, user-friendly, and efficient digital experiences." },
      { property: "og:title", content: "Keith Ciceron | Full Stack Developer" },
      { property: "og:description", content: "Full Stack Developer passionate about building clean, user-friendly, and efficient digital experiences." },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
    ],
  }),
  component: Index,
});

const VALID_TABS: TabId[] = ["dashboard", "about", "skills", "experience", "projects", "activities", "contact"];

function getTabFromHash(): TabId {
  if (typeof window === "undefined") return "dashboard";
  const hash = window.location.hash.replace(/^#/, "").toLowerCase();
  if (hash === "home") return "dashboard";
  if (hash === "trainings") return "activities";
  return VALID_TABS.includes(hash as TabId) ? (hash as TabId) : "dashboard";
}

function Index() {
  const [introReady, setIntroReady] = useState(false);
  // Server has no URL hash, so render Home first and apply the hash after mount to keep hydration consistent.
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const markIntroReady = useCallback(() => setIntroReady(true), []);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);

  const [activeFilter, setActiveFilter] = useState<string>("All");

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const current = window.location.hash.replace(/^#/, "").toLowerCase();
      if (current !== tab) {
        window.history.pushState(
          null,
          "",
          tab === "dashboard" ? window.location.pathname : `#${tab}`
        );
      }
    }
  }, []);

  return (
    <div className="relative h-screen h-[100dvh] w-screen overflow-hidden bg-[#ECEEEA] border-none outline-none">
      <Preloader onComplete={markIntroReady} />

      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
        {activeTab === "dashboard" && (
          <BentoDashboard
            introReady={introReady}
            onNavigate={handleTabChange}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}
        {activeTab === "about" && <About />}
        {activeTab === "skills" && <Skills />}
        {activeTab === "experience" && <Experience />}
        {activeTab === "projects" && (
          <Projects
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}
        {activeTab === "activities" && <Trainings />}
        {activeTab === "contact" && <Contact />}
      </DashboardLayout>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
