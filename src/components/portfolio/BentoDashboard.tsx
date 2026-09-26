import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { ParticlePortrait } from "./ParticlePortrait";

function HeroLink({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug }}
      className="font-medium text-[#161616] dark:text-[#EDEDED] underline decoration-[#C9CCC4] dark:decoration-[#3A3A3A] underline-offset-[3px] hover:decoration-current transition-colors"
    >
      {children}
    </Link>
  );
}

interface BentoDashboardProps {
  /** False while the intro overlay still covers the page, so the particle fly-in isn't played behind it. */
  introReady?: boolean;
}

// Organic silhouette for the portrait frame; must match ParticlePortrait's COLORS.normal.paper fill (#E1E4DD).
const PORTRAIT_SHAPE = "68% 32% 58% 42% / 44% 56% 44% 56%";

export function BentoDashboard({ introReady = true }: BentoDashboardProps) {
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

          {/* Concrete proof over adjectives. The project names are real links, so crawlers reach the case studies from Home. */}
          <p className="mt-6 text-sm sm:text-base text-[#62655E] dark:text-[#A3A3A3] max-w-[58ch] leading-relaxed">
            I build and ship web systems for real clients: a point-of-sale system for{" "}
            <HeroLink slug="iconic-cards-pos">Iconic Cards PH</HeroLink>, a municipal portal for{" "}
            <HeroLink slug="one-cainta">Cainta, Rizal</HeroLink>, and a listings site for{" "}
            <HeroLink slug="cicerra-realty">Cicerra Realty</HeroLink>. Backed by 3+ years testing
            web and mobile apps as a Dev Assistant at Opoli Technology.
          </p>

          <div className="mt-10 flex items-center gap-2 flex-wrap">
            <Link
              to="/projects"
              className="rounded-md bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] hover:bg-[#333333] dark:hover:bg-white px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer"
            >
              View Projects
            </Link>

            <Link
              to="/contact"
              className="rounded-md px-4 py-2.5 text-sm font-medium text-[#161616] dark:text-[#EDEDED] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Let's Talk</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
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
        <Link
          to="/about"
          className="group inline-flex items-center gap-1.5 text-sm text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors cursor-pointer"
        >
          <span>About</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
