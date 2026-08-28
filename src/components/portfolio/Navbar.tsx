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
      const nextScrolled = window.scrollY > 20;
      setScrolled((current) => (current === nextScrolled ? current : nextScrolled));

      const section = document.elementFromPoint(window.innerWidth / 2, 78)?.closest("section");
      const nextOverLight = ["home", "skills", "projects", "contact"].includes(section?.id ?? "");
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
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-4xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 sm:px-6",
          scrolled
            ? overLight
              ? "border border-[#E25822]/20 bg-[#F8F1E7]/90 shadow-lg backdrop-blur-xl"
              : "border border-white/10 bg-[#18181A]/90 shadow-lg backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        )}
      >
        <button
          onClick={() => go("home")}
          className="flex items-center transition-transform hover:scale-105"
          aria-label="Go to home"
        >
          <img
            src="/logo-kc.png"
            alt="KC Logo"
            width={34}
            height={34}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover bg-black border border-white/20 shadow-sm"
          />
        </button>

        {/* Desktop Nav Items */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => go(item.id)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors",
                  active === item.id
                    ? "text-[#E25822]"
                    : overLight
                    ? "text-[#5C5549] hover:text-[#18181A]"
                    : "text-[#BDB5A8] hover:text-[#F8F1E7]"
                )}
              >
                {active === item.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-[#E25822]/15"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Hire Me CTA */}
        <button
          onClick={() => go("contact")}
          className={cn(
            "hidden rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] shadow-xs transition-all hover:scale-105 md:block",
            overLight
              ? "bg-[#E25822] text-[#F8F1E7] hover:bg-[#c94b19]"
              : "bg-[#E25822] text-[#F8F1E7] hover:bg-[#c94b19]"
          )}
        >
          Hire Me
        </button>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className={cn(
            "rounded-full border p-2 md:hidden transition-colors",
            overLight ? "border-black/10 bg-white/70 text-[#18181A]" : "border-white/10 bg-white/10 text-white"
          )}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className="absolute inset-x-4 top-[74px] rounded-3xl border border-white/10 bg-[#18181A]/95 p-3 shadow-2xl backdrop-blur-xl md:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={cn(
                  "block w-full rounded-2xl px-4 py-3 text-left text-xs font-bold uppercase tracking-widest transition-colors",
                  active === item.id ? "bg-[#E25822] text-[#F8F1E7]" : "text-[#BDB5A8] hover:bg-white/5 hover:text-white"
                )}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => go("contact")}
              className="mt-2 w-full rounded-2xl bg-[#E25822] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#F8F1E7] transition-colors hover:bg-[#c94b19]"
            >
              Hire Me
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
