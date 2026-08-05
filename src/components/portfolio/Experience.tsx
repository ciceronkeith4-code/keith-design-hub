import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { EXPERIENCE } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";

export function Experience() {
  const [index, setIndex] = useState(0);
  const [details, setDetails] = useState(false);
  const item = EXPERIENCE[index];
  const move = (amount: number) => { setDetails(false); setIndex((current) => (current + amount + EXPERIENCE.length) % EXPERIENCE.length); };
  return <section id="experience" className="stacked-panel panel-mid z-40 px-4 py-24 sm:py-32">
    <div className="relative mx-auto max-w-4xl"><SectionHeading tone="dark" eyebrow="Experience" title={<>Where I've <span className="text-[#EB5E28]">worked</span></>} subtitle="Hands-on roles in quality assurance, testing, and creative production." />
      <div className="mt-14 flex flex-col items-center"><div className="relative h-[420px] w-full max-w-2xl sm:h-[380px]">
        <AnimatePresence mode="wait"><motion.button key={`${index}-${details}`} initial={{ opacity: 0, rotateY: details ? -45 : 45 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: details ? 45 : -45 }} transition={{ duration: 0.4 }} onClick={() => setDetails((value) => !value)} className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#252422] text-left shadow-2xl [transform-style:preserve-3d]">
          {details ? <div className="flex h-full flex-col justify-between p-8 text-[#FFFCF2] sm:p-10"><div><div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4"><div><h3 className="font-display text-2xl uppercase tracking-wide">{item.role}</h3><p className="mt-1 text-sm font-semibold text-neutral-400">{item.company}</p></div><span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#EB5E28]">{item.period}</span></div><ul className="mt-6 space-y-3.5">{item.points.map((point) => <li key={point} className="flex gap-3 text-sm leading-relaxed text-neutral-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EB5E28]" />{point}</li>)}</ul></div><div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#EB5E28]"><RotateCcw className="h-3.5 w-3.5" />Click to view photo</div></div> : <><img src={item.image} alt={item.role} className="absolute inset-0 h-full w-full object-cover grayscale contrast-125 brightness-[0.72] transition duration-700 hover:grayscale-0 hover:brightness-100" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10"><span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#EB5E28]">{item.period}</span><h3 className="font-display mt-2 text-3xl uppercase tracking-wide sm:text-4xl">{item.role}</h3><p className="mt-1 text-sm font-semibold text-neutral-300">{item.company}</p><div className="mt-6 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400"><RotateCcw className="h-3.5 w-3.5" />Click to reveal details</div></div></>}
        </motion.button></AnimatePresence>
        <button onClick={() => move(-1)} aria-label="Previous experience" className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#252422]/80 text-white shadow-lg backdrop-blur transition hover:scale-105 hover:border-transparent hover:bg-[#EB5E28] sm:left-[-3rem]"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={() => move(1)} aria-label="Next experience" className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#252422]/80 text-white shadow-lg backdrop-blur transition hover:scale-105 hover:border-transparent hover:bg-[#EB5E28] sm:right-[-3rem]"><ChevronRight className="h-5 w-5" /></button>
      </div><div className="mt-8 flex gap-2.5">{EXPERIENCE.map((item, itemIndex) => <button key={item.role} onClick={() => { setDetails(false); setIndex(itemIndex); }} aria-label={`Go to experience ${itemIndex + 1}`} className={`h-2 rounded-full transition-all ${index === itemIndex ? "w-6 bg-[#EB5E28]" : "w-2 bg-white/30 hover:bg-white/50"}`} />)}</div></div>
    </div>
  </section>;
}
