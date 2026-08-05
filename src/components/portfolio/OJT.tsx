import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { OJT_PHOTOS } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const responsibilities = [
  "Managing and testing the online LMS and review portal",
  "Assisting developers in coding, code updates, and bug fixes",
  "Providing dev support and resolving system integration issues",
  "Documenting system bugs and verifying system performance"
];
const skills = ["LMS Administration", "Dev Support", "Coding Assistance", "Technical QA"];
const tech = ["LMS Platforms", "Web Dev & Coding", "QA Testing", "Dev Support Tools"];

export function OJT() {
  const [index, setIndex] = useState(0);
  const photo = OJT_PHOTOS[index];
  const move = (amount: number) => setIndex((current) => (current + amount + OJT_PHOTOS.length) % OJT_PHOTOS.length);
  
  return (
    <section id="ojt" className="stacked-panel panel-dark z-[60] px-4 py-20">
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          tone="dark"
          eyebrow="Internship"
          title={<>OJT <span className="text-[#EB5E28]">Experience</span></>}
          subtitle="My on-the-job training as a Development Assistant Intern."
        />
        <Reveal className="mt-14">
          <div className="overflow-hidden rounded-[24px] border border-white/[0.05] bg-[#252422] p-7 shadow-[0_15px_35px_rgba(0,0,0,0.25)] sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-display text-lg uppercase tracking-wide text-white">
                    Development Assistant Intern
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-neutral-400">
                    Legasynch Group of Companies, Inc.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#403D39] px-4 py-2 font-mono text-[10px] tracking-widest text-neutral-300">
                INTERNSHIP
              </span>
            </div>
            
            <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="mb-8 max-w-2xl text-sm leading-relaxed text-neutral-300">
                  Participated in manual testing, bug reporting, and quality assurance processes for web and mobile applications, helping identify usability and functional defects.
                </p>
                <div className="grid gap-6 sm:grid-cols-3">
                  <InfoList title="Responsibilities" items={responsibilities} />
                  <TagList title="Skills Gained" items={skills} />
                  <TagList title="Technologies" items={tech} />
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div className="relative mx-auto flex h-[255px] max-w-sm items-center justify-center">
                  <motion.img
                    key={photo.src}
                    initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    src={photo.src}
                    alt={photo.caption}
                    className="h-[min(220px,60vw)] w-[min(300px,82vw)] rounded-[1.25rem] border border-white/20 object-cover shadow-2xl grayscale transition hover:grayscale-0"
                  />
                  <button
                    onClick={() => move(-1)}
                    aria-label="Previous OJT photo"
                    className="absolute left-[-8px] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#403D39]/90 text-white transition hover:bg-[#EB5E28]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => move(1)}
                    aria-label="Next OJT photo"
                    className="absolute right-[-8px] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#403D39]/90 text-white transition hover:bg-[#EB5E28]"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-2 flex justify-center gap-2.5">
                  {OJT_PHOTOS.map((item, photoIndex) => (
                    <button
                      key={item.src}
                      onClick={() => setIndex(photoIndex)}
                      className={`h-2 rounded-full transition ${index === photoIndex ? "w-6 bg-[#EB5E28]" : "w-2 bg-white/30"}`}
                      aria-label={`Go to snapshot ${photoIndex + 1}`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-widest text-[#CCC5B9]/60">
                  OJT Snapshot {index + 1} of {OJT_PHOTOS.length}
                </p>
                <p className="mt-1 text-center text-xs italic text-[#FFFCF2]">“{photo.caption}”</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-display mb-3 text-[11px] uppercase tracking-wider text-neutral-300">{title}</h4>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs leading-relaxed text-neutral-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EB5E28]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TagList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-display mb-3 text-[11px] uppercase tracking-wider text-neutral-300">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-white/10 bg-[#403D39] px-3 py-1.5 text-xs text-neutral-200">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
