import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiTailwindcss,
  SiNodedotjs,
  SiMysql,
  SiVercel,
  SiSupabase,
  SiPhp,
  SiExpress,
  SiGooglegemini,
  SiRedis,
} from "react-icons/si";
import { TbUserSearch } from "react-icons/tb";

/**
 * The Stack section on /about. Each entry lists the projects that used it (from src/data/projects.ts),
 * and an entry no project uses is hidden. QA Testing points to the QA entry on /experience instead.
 */
export const SKILLS = [
  { name: "HTML", icon: SiHtml5, group: "Frontend" },
  { name: "CSS", icon: SiCss, group: "Frontend" },
  { name: "JavaScript", icon: SiJavascript, group: "Frontend" },
  { name: "TypeScript", icon: SiTypescript, group: "Frontend" },
  { name: "React", icon: SiReact, group: "Frontend" },
  { name: "Tailwind CSS", icon: SiTailwindcss, group: "Frontend" },
  { name: "Node.js", icon: SiNodedotjs, group: "Backend" },
  { name: "Express", icon: SiExpress, group: "Backend" },
  { name: "PHP", icon: SiPhp, group: "Backend" },
  { name: "Gemini API", icon: SiGooglegemini, group: "Backend" },
  { name: "MySQL", icon: SiMysql, group: "Database" },
  { name: "Supabase", icon: SiSupabase, group: "Database" },
  { name: "Redis", icon: SiRedis, group: "Database" },
  { name: "Vercel", icon: SiVercel, group: "Hosting" },
  { name: "QA Testing", icon: TbUserSearch, group: "Testing" },
];

/** Work history on /experience, newest first. `id` is the anchor other pages link to. */
export const EXPERIENCE = [
  {
    id: "freelance",
    role: "Freelance Web Developer",
    company: "Self-employed",
    // TODO(Keith): start month and year, e.g. "Jan 2025 to present".
    period: "",
    points: [
      "Design, build, and launch web systems for businesses and organizations, from the database to the public site.",
      "Delivered a point-of-sale and ordering system for Iconic Cards PH, a multi-store delivery platform for MGL Food Hub, and a listings site for Cicerra Realty.",
      "Build admin panels so clients manage their own products, listings, and orders without needing a developer.",
    ],
  },
  {
    id: "qa",
    role: "Dev Assistant",
    company: "One of the leading ride-hailing apps in the US",
    period: "Sep 2022 to Dec 2025",
    points: [
      "Manually tested the company's web and mobile apps across releases, covering new features, functionality, and usability.",
      "Reported bugs, functional defects, and usability issues with clear steps to reproduce, so developers could confirm and fix them quickly.",
    ],
  },
  {
    id: "editing",
    role: "Freelance Photo & Video Editor",
    company: "Self-employed",
    period: "Jan 2023 to Apr 2024",
    points: ["Edited photos and videos for social media content."],
  },
];

export const EDUCATION = [
  {
    school: "San Sebastian College Recoletos Manila",
    detail: "BS Information Technology",
    period: "2023 to present",
    badge: "Dean's Lister",
  },
  {
    school: "The Lady Mediatrix Institute Inc.",
    detail: "STEM",
    period: "2020 to 2023",
    badge: "With High Honors",
  },
  {
    school: "Recto Memorial National High School",
    detail: "Junior High School",
    period: "2019 to 2020",
    badge: "With Honors",
  },
];

export const TRAININGS = [
  { title: "JPCS Leadership Trainee Workshop", role: "Delegate", date: "Jan 2026" },
  { title: "DEVCON Hackathon", role: "Participant", date: "Oct 2025" },
  { title: "RADENTA: Harnessing the Power of AWS", role: "Delegate", date: "Sep 2025" },
  {
    title: "RADENTA: Practical Uses of Artificial Intelligence",
    role: "Delegate",
    date: "Aug 2025",
  },
];

// Projects live in ./projects.ts.

export const CONTACT = { email: "ciceronkeith4@gmail.com", location: "Manila, Philippines" };
