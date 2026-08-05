import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "@/lib/portfolio-data";
import { scrollToSection } from "./useScrollSpy";

const footerLinks = [
  { label: "GitHub", href: "https://github.com/keithciceron" },
  { label: "Facebook", href: "https://www.facebook.com/keith.ciceron" },
  { label: "TikTok", href: "https://www.tiktok.com/@keith_ciceron" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/keith-ciceron" },
] as const;

const revealEase = [0.22, 1, 0.36, 1] as const;

const panelVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: revealEase },
  },
};

const contentVariants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.1,
    },
  },
};

const contentItemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.54, ease: revealEase },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.42, duration: 0.54, ease: revealEase },
  },
};

export function Footer() {
  const reduceMotion = useReducedMotion();

  return (
    <footer className="relative z-[95] bg-[#252422] p-0 text-white">
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "show"}
        viewport={{ once: true, amount: 0.28 }}
        variants={panelVariants}
        className="relative mx-auto flex min-h-[min(34rem,calc(100svh-4rem))] w-full flex-col justify-center overflow-hidden rounded-t-[1rem] border border-white/[0.04] bg-[#252422] px-6 py-14 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.35)] will-change-transform sm:min-h-[min(34rem,calc(100svh-4rem))] md:rounded-t-[1rem] md:px-10 md:py-16"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,252,242,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,252,242,0.015) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      >
        <div className="noise pointer-events-none absolute inset-0 opacity-[0.03]" />

        <motion.div
          variants={contentVariants}
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-12 md:gap-16"
        >
          <motion.div
            variants={contentItemVariants}
            className="relative flex w-full select-none items-center justify-center py-6 will-change-transform"
          >
            <h2 className="font-display whitespace-nowrap text-center text-2xl sm:text-4xl md:text-6xl lg:text-[7.5rem] xl:text-[8.5rem] uppercase leading-none tracking-[-0.04em] text-[#EB5E28]">
              Keith Ciceron
            </h2>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <img
                src="/images/signature.png"
                alt="Keith Ciceron signature"
                className="w-28 sm:w-40 md:w-56 lg:w-[18rem] xl:w-[22rem] [filter:invert(1)_brightness(2)]"
              />
            </div>
          </motion.div>

          <motion.div
            variants={contentItemVariants}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 font-mono text-[0.68rem] tracking-[0.08em] text-[#CCC5B9] will-change-transform sm:text-xs md:gap-x-12"
          >
            <a
              href={"mailto:" + CONTACT.email}
              className="inline-flex items-center gap-2 transition-colors hover:text-[#EB5E28]"
            >
              <Mail className="h-4 w-4 shrink-0 text-[#EB5E28]" />
              {CONTACT.email}
            </a>
            <a
              href="tel:+639944933136"
              className="inline-flex items-center gap-2 transition-colors hover:text-[#EB5E28]"
            >
              <Phone className="h-4 w-4 shrink-0 text-[#EB5E28]" />
              {CONTACT.phone}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-[#EB5E28]" />
              {CONTACT.location}
            </span>
          </motion.div>

          <motion.div
            variants={contentItemVariants}
            className="flex w-full flex-col items-center gap-8 border-t border-white/10 pt-8 will-change-transform md:flex-row md:justify-between"
          >
            <nav aria-label="Social links" className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:justify-start">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#CCC5B9] transition-colors hover:text-[#EB5E28]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <p className="text-center font-mono text-[0.58rem] font-bold uppercase tracking-[0.09em] text-[#807b74] md:text-right">
              © 2026 Keith Ciceron • All rights reserved
            </p>
          </motion.div>
        </motion.div>

        <motion.button
          type="button"
          variants={buttonVariants}
          onClick={() => scrollToSection("home")}
          aria-label="Back to top"
          className="absolute bottom-6 right-6 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EB5E28] text-white transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:bottom-8 sm:right-8"
        >
          <ArrowUp className="h-6 w-6 stroke-[3.5]" />
        </motion.button>
      </motion.div>
    </footer>
  );
}



