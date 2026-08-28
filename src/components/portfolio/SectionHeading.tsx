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
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#E25822]">{eyebrow}</span>
      <h2 className={`font-display mt-4 text-4xl uppercase leading-none tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${tone === "dark" ? "text-[#F8F1E7]" : "text-[#18181A]"}`}>
        {title}
      </h2>
      {subtitle && <p className={`mx-auto mt-5 max-w-xl text-sm leading-relaxed sm:text-base ${tone === "dark" ? "text-[#BDB5A8]" : "text-[#5C5549]"}`}>{subtitle}</p>}
    </Reveal>
  );
}
