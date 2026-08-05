import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center", tone = "light" }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <Reveal className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#EB5E28]">{eyebrow}</span>
      <h2 className={`font-display mt-4 text-4xl uppercase leading-none tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${tone === "dark" ? "text-[#FFFCF2]" : "text-[#252422]"}`}>
        {title}
      </h2>
      {subtitle && <p className={`mx-auto mt-5 max-w-xl text-sm leading-relaxed sm:text-base ${tone === "dark" ? "text-[#CCC5B9]" : "text-neutral-600"}`}>{subtitle}</p>}
    </Reveal>
  );
}
