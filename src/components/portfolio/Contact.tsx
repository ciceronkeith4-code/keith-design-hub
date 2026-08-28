import { motion } from "framer-motion";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaViber } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import type { IconType } from "react-icons";
import { SOCIALS } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";
import { Stagger, staggerItem } from "./Reveal";
import React from "react";

const icons: Record<string, IconType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
  gmail: SiGmail,
  viber: FaViber,
};

export function Contact() {
  return (
    <section id="contact" className="stacked-panel panel-light z-[90] px-4 py-10 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(235,94,40,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(235,94,40,0.055) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#E25822]/[0.08] blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl">
        <SectionHeading
          eyebrow="Contact"
          title={
            <>
              Let&apos;s <span className="text-[#E25822]">Work Together</span>
            </>
          }
          subtitle="Choose your preferred platform and let&apos;s start a conversation."
        />

        <Stagger className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {SOCIALS.map((social) => {
            const Icon = icons[social.id];

            return (
              <motion.a
                variants={staggerItem}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                key={social.id}
                href={social.url}
                {...(social.url.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                style={{ "--brand-color": social.color } as React.CSSProperties}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[#E25822]/20 bg-white/70 p-4 shadow-sm transition-all duration-300 hover:border-[#E25822]/40 hover:bg-white hover:shadow-md"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8F1E7]/60 text-[#E25822] transition-all duration-300 group-hover:bg-[var(--brand-color)] group-hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold tracking-tight text-[#18181A]">{social.label}</h3>
                  <p className="mt-0.5 truncate text-xs text-[#6f6a62]">{social.detail}</p>
                </div>

                <span className="text-xs font-bold text-neutral-400 transition-colors duration-300 group-hover:text-[var(--brand-color)] mr-1">
                  →
                </span>
              </motion.a>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
