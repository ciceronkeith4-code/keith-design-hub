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

export interface Project {
  /** URL segment for the case study page: /projects/<slug> */
  slug: string;
  title: string;
  /** Compact name for tight spots, e.g. the Skills page. */
  shortTitle: string;
  description: string;
  image: string;
  tech: string[];
  demo: string | null;
  github: string | null;
  shots: string[];
  isSchoolProject?: boolean;
}

export const PROJECTS: Project[] = [
  {
    slug: "nclex-amplified-interns",
    shortTitle: "NCLEX Interns",
    title: "NCLEX Amplified Interns - Internship Landing Page",
    description:
      "The official internship and OJT landing page for NCLEX Amplified Review Center, with an interactive 500-hour IT/CS curriculum roadmap and a multi-step application form.",
    image: "/images/projects/nclex-amplified.png",
    tech: ["HTML5", "CSS3", "JavaScript"],
    demo: "https://interns.nclexamplifiedreviewcenter.com",
    github: "https://github.com/ciceronkeith4-code/Intern-Landing-Page",
    shots: [
      "/images/projects/nclex-amplified.png",
      "/images/projects/nclex-shot-1.png",
      "/images/projects/nclex-shot-2.png",
      "/images/projects/nclex-shot-3.png",
      "/images/projects/nclex-shot-4.png",
      "/images/projects/nclex-shot-5.png",
    ],
  },
  {
    slug: "iconic-cards-pos",
    shortTitle: "Iconic Cards",
    title: "Iconic Cards PH - Point of Sale System",
    description:
      "An adaptive web and mobile point-of-sale and ordering system for Iconic Cards PH, with a searchable card catalog, cart and checkout, and an admin panel for managing products and orders with Excel export.",
    image: "/images/projects/iconiccards-1.png",
    tech: ["JavaScript", "Node.js", "Express", "HTML5", "CSS3", "Vercel"],
    demo: "https://iconiccards.vercel.app/",
    github: null,
    shots: ["/images/projects/iconiccards-1.png", "/images/projects/iconiccards-2.png"],
  },
  {
    slug: "one-cainta",
    shortTitle: "One Cainta",
    title: "ONE CAINTA APP",
    description:
      "A unified municipal portal and public service application for Cainta, Rizal providing digital community services, public announcements, and local government resources.",
    image: "/images/projects/onecainta.png",
    tech: ["PHP", "JavaScript", "HTML5", "CSS3", "MySQL", "PWA"],
    demo: "https://onecainta.com",
    github: null,
    shots: ["/images/projects/onecainta.png"],
  },
  {
    slug: "jpcs-sscr-manila",
    shortTitle: "JPCS Portal",
    title: "SSCRMNL IT DEPARTMENT OFFICIAL PAGE",
    description:
      "A student-led computing community website for technical learning, leadership, innovation, professional connection, and service.",
    image: "/images/projects/sscrmnl-itdept-1.png",
    tech: ["React", "Vite", "Tailwind CSS", "Supabase", "Vercel"],
    demo: "https://jpcs-sscrmnl.vercel.app/",
    github: null,
    shots: [
      "/images/projects/sscrmnl-itdept-1.png",
      "/images/projects/sscrmnl-itdept-2.png",
      "/images/projects/sscrmnl-itdept-3.png",
    ],
  },
  {
    slug: "cicerra-realty",
    shortTitle: "Cicerra Realty",
    title: "Cicerra Realty Services",
    description:
      "A professional real estate listing and services platform with modern property discovery, detailed listing views, a seamless contact system, and fully responsive layouts.",
    image: "/images/projects/cicerra-1.png",
    tech: ["React", "TypeScript", "TanStack Start", "Tailwind CSS", "Vercel"],
    demo: "https://cicerra-realty-services.vercel.app/",
    github: null,
    shots: ["/images/projects/cicerra-1.png"],
  },
  {
    slug: "sscrecoletos-connect",
    shortTitle: "SSCR Connect",
    title: "SSCRecoletos Connect",
    description:
      "An outcome-based monitoring and evaluation portal for outreach satisfaction surveys, with custom forms, emoji rating metrics, response logging, and visual dashboards.",
    image: "/images/projects/connect-dashboard.png",
    tech: ["React", "TypeScript", "Tailwind CSS", "Shadcn UI", "Supabase", "Vite"],
    demo: null,
    github: null,
    shots: ["/images/projects/connect-dashboard.png"],
    isSchoolProject: true,
  },
  {
    slug: "sscr-library",
    shortTitle: "SSCR Library",
    title: "Web Based Library Management System",
    description:
      "A customized school library portal featuring authentication, active book-loan checkouts, and student and librarian management tables.",
    image: "/images/projects/library-login.png",
    tech: ["React", "TypeScript", "Tailwind CSS", "Shadcn UI", "Vite"],
    demo: "https://final-sscr-library.vercel.app/",
    github: "https://github.com/keithciceron2004-star/FINAL-SSCR-LIBRARY",
    shots: ["/images/projects/library-login.png"],
    isSchoolProject: true,
  },
];

export const CONTACT = { email: "ciceronkeith4@gmail.com", location: "Manila, Philippines" };
