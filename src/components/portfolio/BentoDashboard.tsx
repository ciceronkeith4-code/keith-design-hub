import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { TabId } from "./DashboardLayout";

interface BentoDashboardProps {
  onNavigate: (tab: TabId) => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function BentoDashboard({ onNavigate }: BentoDashboardProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between py-2 relative">
      {/* Main Text-First Block */}
      <div className="flex-1 flex flex-col justify-center items-start text-left">
        {/* Name: clamp 40px-72px, weight 600 */}
        <h1 className="font-sans text-[clamp(40px,6.5vw,72px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-none">
          Keith Ciceron
        </h1>

        {/* Shorter bold line below in secondary color */}
        <p className="mt-3 sm:mt-4 font-bold text-sm sm:text-base text-[#6E716B] dark:text-[#A3A3A3]">
          Software Developer & Designer
        </p>

        {/* Body text constrained to about 800px */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base text-[#6E716B] dark:text-[#A3A3A3] max-w-[800px] leading-relaxed font-normal">
          Building modern, scalable web applications with intuitive user interfaces and robust backend systems. Specialized in full-stack web engineering, frontend performance, and human-centered design experiences.
        </p>

        {/* Two actions below: a primary filled button and a secondary text button with an icon */}
        <div className="mt-8 sm:mt-10 flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate("projects")}
            className="rounded-md bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] hover:bg-[#333333] dark:hover:bg-white px-5 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-xs"
          >
            View Projects
          </button>

          <button
            type="button"
            onClick={() => onNavigate("contact")}
            className="px-3 py-2 text-xs sm:text-sm font-medium text-[#161616] dark:text-[#EDEDED] hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Let's Talk</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom right of content area: About → link to next section */}
      <div className="w-full flex justify-end pt-4">
        <button
          type="button"
          onClick={() => onNavigate("about")}
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#6E716B] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors cursor-pointer"
        >
          <span>About</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
