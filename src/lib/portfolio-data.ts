import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiTailwindcss,
  SiNodedotjs,
  SiMysql,
  SiFirebase,
  SiFigma,
  SiGit,
  SiGithub,
  SiVercel,
  SiSupabase,
  SiPhp,
  SiExpress,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import { TbUserSearch } from "react-icons/tb";
import { PhotoshopMark } from "@/components/portfolio/SkillMarks";

export const SKILLS = [
  { name: "HTML5", icon: SiHtml5, group: "Frontend" },
  { name: "CSS3", icon: SiCss, group: "Frontend" },
  { name: "JavaScript", icon: SiJavascript, group: "Frontend" },
  { name: "TypeScript", icon: SiTypescript, group: "Frontend" },
  { name: "React", icon: SiReact, group: "Frontend" },
  { name: "Tailwind CSS", icon: SiTailwindcss, group: "Frontend" },
  { name: "Node.js", icon: SiNodedotjs, group: "Backend" },
  { name: "Express", icon: SiExpress, group: "Backend" },
  { name: "PHP", icon: SiPhp, group: "Backend" },
  { name: "MySQL", icon: SiMysql, group: "Database" },
  { name: "Firebase", icon: SiFirebase, group: "Database" },
  { name: "Supabase", icon: SiSupabase, group: "Database" },
  { name: "Figma", icon: SiFigma, group: "Design" },
  { name: "Photoshop", icon: PhotoshopMark, group: "Design" },
  { name: "Git", icon: SiGit, group: "Tools & DevOps" },
  { name: "GitHub", icon: SiGithub, group: "Tools & DevOps" },
  { name: "Vercel", icon: SiVercel, group: "Tools & DevOps" },
  { name: "VS Code", icon: VscVscode, group: "Tools & DevOps" },
  { name: "QA Testing", icon: TbUserSearch, group: "Additional Skills" },
];

export const EXPERIENCE = [
  {
    role: "Dev Assistant",
    company: "Opoli Technology Inc.",
    period: "Sep 2022 to Dec 2025",
    image: "/images/ojt/opoli-bounty.jpg",
    points: [
      "Performed manual testing on web and mobile applications.",
      "Identified bugs, functional defects, and usability issues.",
      "Created detailed bug reports with clear reproduction steps.",
      "Assisted quality assurance processes across releases.",
    ],
  },
  {
    role: "Freelance Photo & Video Editor",
    company: "Self-Employed",
    period: "Jan 2023 to Apr 2024",
    image: "/images/profile/keith-brown-shirt.jpg",
    points: [
      "Edited social media content for multiple platforms.",
      "Produced marketing visuals and digital media.",
      "Enhanced photos and videos through post-production.",
      "Improved digital media quality and visual consistency.",
    ],
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
