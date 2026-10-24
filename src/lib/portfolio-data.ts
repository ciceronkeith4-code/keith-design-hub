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

/**
 * Certificates on /certifications, newest first. Images are in public/images/certificates/.
 * Grouped on the page by `field`, in the order the fields first appear. `verify` is a public page that
 * confirms the certificate (Credly for Cisco); leave it empty when there is none.
 */
export const CERTIFICATIONS = [
  {
    title: "Introduction to Modern AI",
    kind: "Certificate of course completion",
    issuer: "Cisco Networking Academy",
    issuerShort: "Cisco Networking Academy",
    date: "Oct 2026",
    detail:
      "Student-level credential for completing the Introduction to Modern AI course, Oct 24, 2026",
    topics: [
      "AI and machine learning basics",
      "object detection and image segmentation",
      "machine translation",
      "how large language models work and how to prompt them",
      "LLM chatbots with tools like web search",
    ],
    code: "",
    field: "AI",
    verify: "https://www.credly.com/badges/9c874468-0697-4487-8aa2-d1d586257f62",
    image: {
      src: "/images/certificates/cisco-intro-to-modern-ai.webp",
      width: 1055,
      height: 817,
    },
  },
  {
    title: "Python Essentials 1",
    kind: "Statement of achievement",
    issuer: "Cisco Networking Academy with OpenEDG Python Institute",
    issuerShort: "Cisco Networking Academy",
    date: "Oct 2026",
    detail: "Student-level credential for completing the Python Essentials 1 course, Oct 24, 2026",
    topics: ["Python 3", "algorithmic thinking", "the Python Standard Library"],
    code: "",
    field: "Python",
    verify: "https://www.credly.com/badges/9b3a7db3-c3e9-4150-897b-8631540b8913",
    image: {
      src: "/images/certificates/cisco-python-essentials-1.webp",
      width: 1056,
      height: 818,
    },
  },
  {
    title: "Introduction to SQL",
    kind: "Certificate of completion",
    issuer: "Simplilearn SkillUp",
    issuerShort: "Simplilearn SkillUp",
    date: "Oct 2026",
    detail: "Completed the Introduction to SQL online course, Oct 24, 2026",
    topics: [],
    code: "10938096",
    field: "Database",
    verify: "",
    image: {
      src: "/images/certificates/simplilearn-intro-to-sql.webp",
      width: 1121,
      height: 792,
    },
  },
  {
    title: "Introduction to Internet of Things",
    kind: "Certificate of course completion",
    issuer: "Cisco Networking Academy",
    issuerShort: "Cisco Networking Academy",
    date: "Oct 2026",
    detail:
      "Student-level credential for completing the Introduction to Internet of Things course, Oct 24, 2026",
    topics: [
      "IoT and digital transformation",
      "automation and AI",
      "intent-based networking",
      "security",
    ],
    code: "",
    field: "IoT",
    verify: "https://www.credly.com/badges/9d545a2d-f167-42dd-a0eb-fd51a215dd84",
    image: {
      src: "/images/certificates/cisco-intro-to-iot.webp",
      width: 1056,
      height: 815,
    },
  },
  {
    title: "Java Programming with GUI, Part 2",
    kind: "Certificate of attendance",
    issuer: "Project Tuklas Teknolohiya",
    issuerShort: "Project Tuklas Teknolohiya",
    date: "Sep 2026",
    detail: "3-hour webinar on Google Meet, Sep 19, 2026",
    topics: [
      "JFrame",
      "JLabel",
      "JTextField",
      "JButton",
      "GridLayout",
      "ActionListener",
      "ActionEvent",
    ],
    code: "PTTC08-076",
    field: "Java",
    verify: "",
    image: { src: "/images/certificates/java-gui-part-2.webp", width: 1122, height: 789 },
  },
  {
    title: "Full Stack Developer Internship",
    kind: "Certificate of completion",
    issuer: "Legasynch Group of Companies Inc. (NCLEX Amplified Review Center)",
    issuerShort: "NCLEX Amplified Review Center",
    date: "Sep 2026",
    detail:
      "Completed the 500-hour internship program as a Full Stack Developer Intern in the IT department, Sep 14, 2026",
    topics: [],
    code: "",
    field: "Internship",
    verify: "",
    image: {
      src: "/images/certificates/nclex-amplified-internship.webp",
      width: 1491,
      height: 1055,
    },
  },
  {
    title: "Basic Java Programming",
    kind: "Certificate of attendance",
    issuer: "Project Tuklas Teknolohiya",
    issuerShort: "Project Tuklas Teknolohiya",
    date: "Aug 2026",
    detail: "3-hour webinar on Google Meet, Aug 22, 2026",
    topics: [],
    code: "PTTC02-036",
    field: "Java",
    verify: "",
    image: { src: "/images/certificates/basic-java-programming.webp", width: 799, height: 563 },
  },
  {
    title: "Internship Program Orientation",
    kind: "Certificate of attendance",
    issuer: "Legasynch Group of Companies Inc. (NCLEX Amplified Review Center)",
    issuerShort: "NCLEX Amplified Review Center",
    date: "Jun 2026",
    detail: "Orientation for the IT department's internship programs, Jun 8, 2026",
    topics: [],
    code: "",
    field: "Internship",
    verify: "",
    image: {
      src: "/images/certificates/nclex-amplified-orientation.webp",
      width: 1600,
      height: 1131,
    },
  },
];

// Projects live in ./projects.ts.

export const CONTACT = { email: "ciceronkeith4@gmail.com", location: "Manila, Philippines" };
