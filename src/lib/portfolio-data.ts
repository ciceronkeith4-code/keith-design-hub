import { SiHtml5, SiCss, SiJavascript, SiTypescript, SiReact, SiTailwindcss, SiNodedotjs, SiMysql, SiFirebase, SiFigma, SiGit, SiGithub, SiVercel, SiSupabase } from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import { TbUserSearch } from "react-icons/tb";
import { PhotoshopMark } from "@/components/portfolio/SkillMarks";

export const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
] as const;

export const SKILLS = [
  { name: "HTML5", icon: SiHtml5, color: "#E34F26", group: "Frontend" },
  { name: "CSS3", icon: SiCss, color: "#1572B6", group: "Frontend" },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E", group: "Frontend" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6", group: "Frontend" },
  { name: "React", icon: SiReact, color: "#61DAFB", group: "Frontend" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4", group: "Frontend" },
  { name: "Node.js", icon: SiNodedotjs, color: "#5FA04E", group: "Backend" },
  { name: "MySQL", icon: SiMysql, color: "#4479A1", group: "Database" },
  { name: "Firebase", icon: SiFirebase, color: "#FFCA28", group: "Database" },
  { name: "Supabase", icon: SiSupabase, color: "#3FCF8E", group: "Database" },
  { name: "Figma", icon: SiFigma, color: "#F24E1E", group: "Design" },
  { name: "Photoshop", icon: PhotoshopMark, color: "#31A8FF", group: "Design" },
  { name: "Git", icon: SiGit, color: "#F05032", group: "Tools & DevOps" },
  { name: "GitHub", icon: SiGithub, color: "#181717", group: "Tools & DevOps" },
  { name: "Vercel", icon: SiVercel, color: "#111111", group: "Tools & DevOps" },
  { name: "VS Code", icon: VscVscode, color: "#007ACC", group: "Tools & DevOps" },
  { name: "QA Testing", icon: TbUserSearch, color: "#7C3AED", group: "Additional Skills" },
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
  { school: "San Sebastian College Recoletos Manila", detail: "BS Information Technology", period: "2023 to present", badge: "Dean's Lister" },
  { school: "The Lady Mediatrix Institute Inc.", detail: "STEM", period: "2020 to 2023", badge: "With High Honors" },
  { school: "Recto Memorial National High School", detail: "Junior High School", period: "2019 to 2020", badge: "With Honors" },
];

export const TRAININGS = [
  { title: "JPCS Leadership Trainee Workshop", role: "Delegate", date: "Jan 2026" },
  { title: "DEVCON Hackathon", role: "Participant", date: "Oct 2025" },
  { title: "RADENTA: Harnessing the Power of AWS", role: "Delegate", date: "Sep 2025" },
  { title: "RADENTA: Practical Uses of Artificial Intelligence", role: "Delegate", date: "Aug 2025" },
];

export const PROJECTS = [
  {
    title: "NCLEX Amplified Review Center - Intern Portal",
    description: "An intern management and review center portal providing learning tools, intern resources, and administrative monitoring for NCLEX Amplified Review Center.",
    image: "/images/projects/nclex-amplified.png",
    tech: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Vercel"],
    demo: "https://interns.nclexamplifiedreviewcenter.com",
    github: null,
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
    title: "Iconic Cards PH - Point of Sale System",
    description: "An adaptive web and mobile point-of-sale and ordering system for Iconic Cards PH, with a searchable card catalog, cart and checkout, and an admin panel for managing products and orders with Excel export.",
    image: "/images/projects/iconiccards-1.png",
    tech: ["JavaScript", "Node.js", "Express", "HTML5", "CSS3", "Vercel"],
    demo: "https://iconiccards.vercel.app/",
    github: null,
    shots: [
      "/images/projects/iconiccards-1.png",
      "/images/projects/iconiccards-2.png",
    ],
  },
  {
    title: "ONE CAINTA APP",
    description: "A unified municipal portal and public service application for Cainta, Rizal providing digital community services, public announcements, and local government resources.",
    image: "/images/projects/onecainta.png",
    tech: ["PHP", "JavaScript", "HTML5", "CSS3", "MySQL", "PWA"],
    demo: "https://onecainta.com",
    github: null,
    shots: ["/images/projects/onecainta.png"],
  },
  {
    title: "SSCRMNL IT DEPARTMENT OFFICIAL PAGE",
    description: "A student-led computing community website for technical learning, leadership, innovation, professional connection, and service.",
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
    title: "Cicerra Realty Services",
    description: "A professional real estate listing and services platform with modern property discovery, detailed listing views, a seamless contact system, and fully responsive layouts.",
    image: "/images/projects/cicerra-1.png",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"],
    demo: "https://cicerra-realty-services.vercel.app/",
    github: null,
    shots: ["/images/projects/cicerra-1.png"],
  },
  {
    title: "SSCRecoletos Connect",
    description: "An outcome-based monitoring and evaluation portal for outreach satisfaction surveys, with custom forms, emoji rating metrics, response logging, and visual dashboards.",
    image: "/images/projects/connect-dashboard.png",
    tech: ["React", "TypeScript", "Tailwind CSS", "Shadcn UI", "Supabase", "Vite"],
    demo: null,
    github: null,
    shots: ["/images/projects/connect-dashboard.png"],
    isSchoolProject: true,
  },
  {
    title: "Web Based Library Management System",
    description: "A customized school library portal featuring authentication, active book-loan checkouts, and student and librarian management tables.",
    image: "/images/projects/library-login.png",
    tech: ["Tailwind CSS", "CSS", "Java", "MySQL", "PHP", "NodeJS"],
    demo: null,
    github: null,
    shots: ["/images/projects/library-login.png"],
    isSchoolProject: true,
  },
];

export const OJT_PHOTOS = [
  { src: "/images/ojt/ojt-1.jpg", caption: "IT support setup at Legasynch office" },
  { src: "/images/ojt/ojt-2.jpg", caption: "LMS review portal system verification" },
  { src: "/images/ojt/ojt-3.jpg", caption: "Review software and hardware maintenance" },
];

export const SOCIALS = [
  { id: "facebook", label: "Facebook", detail: "Keith Ciceron", action: "Send Message", url: "https://www.facebook.com/keith.ciceron", color: "#1877F2" },
  { id: "instagram", label: "Instagram", detail: "@mon.czii", action: "Send DM", url: "https://www.instagram.com/mon.czii", color: "#E4405F" },
  { id: "tiktok", label: "TikTok", detail: "@keith_ciceron", action: "Watch Content", url: "https://www.tiktok.com/@keith_ciceron", color: "#111111" },
  { id: "linkedin", label: "LinkedIn", detail: "Keith Ciceron", action: "Connect", url: "https://www.linkedin.com/in/keith-ciceron", color: "#0A66C2" },
  { id: "gmail", label: "Gmail", detail: "ciceronkeith4@gmail.com", action: "Send Email", url: "mailto:ciceronkeith4@gmail.com", color: "#EA4335" },
  { id: "viber", label: "Viber", detail: "+63 9944933136", action: "Chat on Viber", url: "viber://chat?number=%2B639944933136", color: "#7360F2" },
] as const;

export const CONTACT = { email: "ciceronkeith4@gmail.com", phone: "+63 9944933136", location: "Manila, Philippines" };














