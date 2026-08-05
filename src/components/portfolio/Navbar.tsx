import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "@/lib/portfolio-data";
import { scrollToSection, useScrollSpy } from "./useScrollSpy";
import { cn } from "@/lib/utils";

interface NavbarProps {
  ready?: boolean;
}

export function Navbar({ ready = true }: NavbarProps) {
  const active = useScrollSpy();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overLight, setOverLight] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    const update = () => {
      const nextScrolled = window.scrollY > 32;
      setScrolled((current) => (current === nextScrolled ? current : nextScrolled));

      const section = document.elementFromPoint(window.innerWidth / 2, 78)?.closest("section");
      const nextOverLight = ["home", "skills", "projects", "education", "contact"].includes(section?.id ?? "");
      setOverLight((current) => (current === nextOverLight ? current : nextOverLight));
      frame.current = 0;
    };

    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const go = useCallback((id: string) => {
    setOpen(false);
    scrollToSection(id);
  }, []);

  const ink = overLight ? "text-[#252422]" : "text-[#FFFCF2]";

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : { y: -70, opacity: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-full px-3.5 py-2.5 transition-[background-color,border-color,box-shadow] duration-300 sm:px-6",
          scrolled && (overLight ? "border border-black/10 bg-[#FFFCF2]/85 shadow-lg backdrop-blur-xl" : "border border-white/10 bg-[#252422]/85 shadow-lg backdrop-blur-xl"),
        )}
      >
        <button onClick={() => go("home")} className={cn("flex items-center gap-2 font-display text-lg uppercase tracking-wide transition-colors", ink)} aria-label="Go to home">
          <img src="/logo-kc.png" alt="KC Logo" width={28} height={28} className={cn("h-7 w-7 rounded-full border object-cover transition", overLight ? "border-black/15" : "border-white/20 invert")} />
          <span className="hidden sm:inline">Keith</span>
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button onClick={() => go(item.id)} className={cn("relative rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition", active === item.id ? "text-[#EB5E28]" : overLight ? "text-neutral-500 hover:text-neutral-950" : "text-[#CCC5B9] hover:text-white")}>
                {active === item.id && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-[#EB5E28]/10" />} {item.label}
              </button>
            </li>
          ))}
        </ul>

        <button onClick={() => go("contact")} className={cn("hidden rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] shadow-sm transition hover:-translate-y-0.5 md:block", overLight ? "bg-[#252422] text-white hover:bg-[#EB5E28]" : "bg-[#FFFCF2] text-[#252422] hover:bg-[#EB5E28] hover:text-white")}>
          Hire Me
        </button>
        <button onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className={cn("rounded-full border p-2 md:hidden", overLight ? "border-black/10 bg-white/60 text-[#252422]" : "border-white/10 bg-white/5 text-white")}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} className="absolute inset-x-4 top-[74px] rounded-[1.75rem] border border-white/10 bg-[#252422]/95 p-3 shadow-2xl backdrop-blur-xl md:hidden">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => go(item.id)} className={cn("block w-full rounded-2xl px-4 py-3 text-left text-xs font-bold uppercase tracking-widest", active === item.id ? "bg-[#EB5E28] text-white" : "text-[#CCC5B9] hover:bg-white/5 hover:text-white")}>
                {item.label}
              </button>
            ))}
            <button onClick={() => go("contact")} className="mt-1 w-full rounded-2xl bg-[#FFFCF2] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#252422]">
              Hire Me
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
