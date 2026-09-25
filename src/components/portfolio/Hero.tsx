import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PROJECTS, TRAININGS, EXPERIENCE } from "@/lib/portfolio-data";
import type { TabId } from "./DashboardLayout";

const photos = [
  "/images/profile/keith-white-shirt.jpg",
  "/images/profile/keith-brown-shirt.jpg",
  "/images/profile/keith3.jpeg",
  "/images/profile/keith4.jpeg",
  "/images/profile/keith5.jpeg",
];

interface HeroProps {
  onNavigate?: (tab: TabId) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Asymmetric Two-Column: Text Left, Photo Right */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Left Column: Bio & Core Info */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-between rounded-[6px] border border-[#E5E5E5] bg-[#FAFAFA] p-6 sm:p-8">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E5E5] pb-4">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#111111]" />
                <span className="font-mono text-xs text-[#111111]">
                  Available for work
                </span>
              </div>
              <span className="font-mono text-xs text-[#666666]">
                Manila · PH
              </span>
            </div>

            <div className="mt-6">
              <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#111111]">
                Keith Ciceron
              </h1>
              <h2 className="font-sans mt-2 text-base sm:text-lg font-medium tracking-wide text-[#666666] uppercase">
                Software Developer
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#444444]">
                Building modern, scalable web applications with intuitive user interfaces and robust backend systems.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate?.("projects")}
              className="inline-flex items-center gap-2 rounded-[6px] bg-[#111111] px-4 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#333333] active:scale-[0.99]"
            >
              <span>View Projects</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigate?.("contact")}
              className="inline-flex items-center gap-2 rounded-[6px] bg-[#111111] px-4 py-2 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#333333] active:scale-[0.99]"
            >
              <span>Let&apos;s Talk</span>
            </button>
          </div>
        </div>

        {/* Right Column: Profile Photo Carousel (Full Color Photos) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between rounded-[6px] border border-[#E5E5E5] bg-[#FAFAFA] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <span className="font-mono text-xs text-[#666666]">
              Profile
            </span>
            <span className="font-mono text-xs text-[#111111]">
              {photoIndex + 1} of {photos.length}
            </span>
          </div>

          <div className="relative my-3 mx-auto h-[240px] w-full max-w-[200px] overflow-hidden rounded-[6px] border border-[#E5E5E5] bg-neutral-100">
            <AnimatePresence mode="wait">
              <motion.img
                key={photos[photoIndex]}
                src={photos[photoIndex]}
                alt={`Keith portrait ${photoIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1">
            {photos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPhotoIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`h-1 rounded-full transition-all duration-200 ${
                  photoIndex === idx ? "w-5 bg-[#111111]" : "w-1.5 bg-[#E5E5E5] hover:bg-[#CCCCCC]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Real Data Highlight Blocks */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div
          onClick={() => onNavigate?.("projects")}
          className="rounded-[6px] border border-[#E5E5E5] bg-[#FAFAFA] p-4 cursor-pointer hover:bg-[#F2F2F2] transition-colors"
        >
          <span className="font-mono text-xs text-[#666666]">Projects</span>
          <p className="mt-1 font-sans text-xl font-semibold text-[#111111]">
            {PROJECTS.length} Built
          </p>
          <p className="mt-0.5 text-xs text-[#666666]">Web applications & review portals</p>
        </div>

        <div
          onClick={() => onNavigate?.("experience")}
          className="rounded-[6px] border border-[#E5E5E5] bg-[#FAFAFA] p-4 cursor-pointer hover:bg-[#F2F2F2] transition-colors"
        >
          <span className="font-mono text-xs text-[#666666]">Experience</span>
          <p className="mt-1 font-sans text-xl font-semibold text-[#111111]">
            {EXPERIENCE.length} Positions
          </p>
          <p className="mt-0.5 text-xs text-[#666666]">Opoli Technology Inc. & Self-Employed</p>
        </div>

        <div
          onClick={() => onNavigate?.("activities")}
          className="rounded-[6px] border border-[#E5E5E5] bg-[#FAFAFA] p-4 cursor-pointer hover:bg-[#F2F2F2] transition-colors"
        >
          <span className="font-mono text-xs text-[#666666]">Activities</span>
          <p className="mt-1 font-sans text-xl font-semibold text-[#111111]">
            {TRAININGS.length} Completed
          </p>
          <p className="mt-0.5 text-xs text-[#666666]">Workshops, hackathons & seminars</p>
        </div>
      </div>
    </div>
  );
}
