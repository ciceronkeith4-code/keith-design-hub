import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "@/lib/portfolio-data";
import { scrollToSection } from "./useScrollSpy";

const footerLinks = [
  { label: "GitHub", href: "https://github.com/ciceronkeith4-code/ciceronkeith4-code" },
  { label: "Facebook", href: "https://www.facebook.com/keith.ciceron" },
  { label: "TikTok", href: "https://www.tiktok.com/@keith_ciceron" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/keith-ciceron" },
] as const;

export function Footer() {
  return (
    <footer className="relative z-[95] border-t border-white/10 bg-[#18181A] text-[#F8F1E7]">
      <div className="relative mx-auto w-full max-w-6xl px-6 py-8 sm:py-10 md:px-10">
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          {/* Compact Branding */}
          <div className="relative flex w-full select-none items-center justify-center py-2">
            <h2 className="font-display text-center text-3xl uppercase leading-none tracking-tight text-[#E25822] sm:text-5xl md:text-6xl">
              Keith Ciceron
            </h2>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <img
                src="/images/signature.png"
                alt="Keith Ciceron signature"
                className="w-28 sm:w-40 [filter:invert(1)_brightness(2)] opacity-80"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs tracking-wider text-[#BDB5A8]">
            <a
              href={"mailto:" + CONTACT.email}
              className="inline-flex items-center gap-2 transition-colors hover:text-[#E25822]"
            >
              <Mail className="h-3.5 w-3.5 text-[#E25822]" />
              {CONTACT.email}
            </a>
            <a
              href="tel:+639944933136"
              className="inline-flex items-center gap-2 transition-colors hover:text-[#E25822]"
            >
              <Phone className="h-3.5 w-3.5 text-[#E25822]" />
              {CONTACT.phone}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#E25822]" />
              {CONTACT.location}
            </span>
          </div>

          {/* Socials, Copyright & Back-to-Top inline */}
          <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
            <nav aria-label="Social links" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs font-bold uppercase tracking-wider text-[#BDB5A8] transition-colors hover:text-[#E25822]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A8375]">
                © 2026 Keith Ciceron • All rights reserved
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("home")}
                aria-label="Back to top"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E25822] text-[#F8F1E7] shadow-md transition-transform duration-300 hover:scale-110 focus:outline-none"
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}




