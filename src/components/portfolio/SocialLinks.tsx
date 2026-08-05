import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaViber } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import type { IconType } from "react-icons";
import { SOCIALS } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";
const icons: Record<string, IconType> = { facebook: FaFacebookF, instagram: FaInstagram, tiktok: FaTiktok, linkedin: FaLinkedinIn, gmail: SiGmail, viber: FaViber };
export function SocialLinks({ className }: { className?: string }) { return <div className={cn("flex items-center gap-3", className)}>{SOCIALS.map((social) => { const Icon = icons[social.id]; return <a key={social.id} href={social.url} aria-label={social.label} {...(social.url.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })} className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#CCC5B9] transition hover:-translate-y-1 hover:border-[#EB5E28] hover:bg-[#EB5E28] hover:text-white"><Icon className="h-[17px] w-[17px]" /></a>; })}</div>; }
