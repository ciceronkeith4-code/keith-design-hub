import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { TabId } from "./DashboardLayout";
import { ParticlePortrait } from "./ParticlePortrait";

interface BentoDashboardProps {
  onNavigate: (tab: TabId) => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  /** False while the intro overlay still covers the page, so the particle fly-in isn't played behind it. */
  introReady?: boolean;
}

// Organic silhouette for the portrait frame; must match ParticlePortrait's COLORS.normal.paper fill (#E1E4DD).
const PORTRAIT_SHAPE = "68% 32% 58% 42% / 44% 56% 44% 56%";

export function BentoDashboard({ onNavigate, introReady = true }: BentoDashboardProps) {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* my-auto centers the hero in the free height but never clips it when the viewport is shorter than the content */}
      <div className="my-auto w-full flex flex-col-reverse lg:flex-row items-start lg:justify-between gap-10 lg:gap-16 py-4">
        <div className="flex flex-col items-start text-left max-w-[620px]">
          <h1 className="font-sans text-[clamp(40px,6.5vw,72px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-none">
            Keith Ciceron
          </h1>

          <p className="mt-4 font-semibold text-sm sm:text-base text-[#62655E] dark:text-[#A3A3A3]">
            Full Stack Developer
          </p>

          <p className="mt-6 text-sm sm:text-base text-[#62655E] dark:text-[#A3A3A3] max-w-[58ch] leading-relaxed">
            Building modern, scalable web applications with intuitive user interfaces and robust backend systems. Specialized in full-stack web engineering, frontend performance, and human-centered design experiences.
          </p>

          <div className="mt-10 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate("projects")}
              className="rounded-md bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] hover:bg-[#333333] dark:hover:bg-white px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer"
            >
              View Projects
            </button>

            <button
              type="button"
              onClick={() => onNavigate("contact")}
              className="rounded-md px-4 py-2.5 text-sm font-medium text-[#161616] dark:text-[#EDEDED] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Let's Talk</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Particle portrait inside an organic shape: particles swirl in within the outline, and the curve clips the
            portrait's flat bottom cut. The shape stays light in both themes so the dots read as a true positive. */}
        <ParticlePortrait
          play={introReady}
          className="shrink-0 h-[300px] sm:h-[360px] lg:h-[min(62vh,500px)] aspect-[4/5] overflow-hidden bg-[#E1E4DD] isolate"
          style={{ borderRadius: PORTRAIT_SHAPE }}
        />
      </div>

      <div className="w-full flex justify-end pt-6">
        <button
          type="button"
          onClick={() => onNavigate("about")}
          className="group inline-flex items-center gap-1.5 text-sm text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors cursor-pointer"
        >
          <span>About</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
