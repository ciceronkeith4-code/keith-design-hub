import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { About } from "@/components/portfolio/About";
import { BackgroundFX } from "@/components/portfolio/BackgroundFX";
import { Contact } from "@/components/portfolio/Contact";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import { Experience } from "@/components/portfolio/Experience";
import { Footer } from "@/components/portfolio/Footer";
import { Hero } from "@/components/portfolio/Hero";
import { Navbar } from "@/components/portfolio/Navbar";
import { Preloader } from "@/components/portfolio/Preloader";
import { Projects } from "@/components/portfolio/Projects";
import { ScrollProgress } from "@/components/portfolio/ScrollProgress";
import { Skills } from "@/components/portfolio/Skills";
import { SmoothScroll } from "@/components/portfolio/SmoothScroll";
import { Trainings } from "@/components/portfolio/Trainings";

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
      { rel: "preload", href: "/fonts/anton-latin.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preload", href: "/fonts/poppins-400.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "canonical", href: "/" },
    ],
  }),
  component: Index,
});

function Index() {
  const [introReady, setIntroReady] = useState(false);
  const markIntroReady = useCallback(() => setIntroReady(true), []);

  return (
    <SmoothScroll>
      <div className="relative min-h-screen overflow-x-clip">
        <Preloader onComplete={markIntroReady} />
        <BackgroundFX active={introReady} />
        <CustomCursor active={introReady} />
        <ScrollProgress />
        <Navbar ready={introReady} />
        <main className="full-page-main">
          <Hero ready={introReady} />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Trainings />
          <Contact />
        </main>
        <Footer />
        <Toaster position="bottom-right" richColors />
      </div>
    </SmoothScroll>
  );
}
