/**
 * Every project on the site: the /projects index, the case study pages, the Skills page, the
 * command palette, and the sitemap all read from this list. Adding a project means adding an entry
 * here (plus its write-up in case-studies.ts); no component changes needed.
 *
 * Screenshots live at /images/projects/<slug>/<device>-<n>.webp, captured full-page at the
 * viewports in DEVICES. Run `node scripts/capture-screens.mjs <slug>` to (re)capture them.
 */

export type Device = "desktop" | "tablet" | "mobile";

/** The viewport each device's screenshots are captured at, in CSS pixels. */
export const DEVICES: Record<Device, { label: string; width: number; height: number }> = {
  desktop: { label: "Desktop", width: 1440, height: 900 },
  tablet: { label: "Tablet", width: 834, height: 1194 },
  mobile: { label: "Mobile", width: 390, height: 844 },
};

export type Project = {
  slug: string;
  /** Position in the index, shown as 01, 02, … */
  index: number;
  title: string;
  /** Compact name for tight spots, e.g. the Skills page. */
  shortTitle: string;
  /** One sentence. */
  summary: string;
  type: "Client" | "School" | "Organization";
  /** Leave empty to hide it; the meta line skips empty values. */
  year: string;
  role: string;
  stack: string[];
  featured?: boolean;
  /** caseStudy is always /projects/<slug>; that page's write-up lives in case-studies.ts. */
  links: { caseStudy: string; live?: string; repo?: string };
  /** Full-page captures per device. An empty list shows a "Screenshot coming soon" frame. */
  screens: Record<Device, string[]>;
  /** PNG used for link previews (og:image) and the case study header. */
  cover: string;
  /** Extra screenshots for the case study gallery. */
  gallery: string[];
};

/** The conventional screenshot paths for a project: <device>-1.webp … <device>-<count>.webp. */
function captures(slug: string, count = 1): Project["screens"] {
  const list = (device: Device) =>
    Array.from({ length: count }, (_, i) => `/images/projects/${slug}/${device}-${i + 1}.webp`);
  return { desktop: list("desktop"), tablet: list("tablet"), mobile: list("mobile") };
}

const NO_SCREENS: Project["screens"] = { desktop: [], tablet: [], mobile: [] };

export const PROJECTS: Project[] = [
  {
    slug: "nclex-amplified-interns",
    index: 1,
    title: "NCLEX Amplified Interns – Internship Landing Page",
    shortTitle: "NCLEX Interns",
    summary:
      "The official internship and OJT landing page for NCLEX Amplified Review Center, with an interactive 500-hour IT/CS curriculum roadmap and a multi-step application form.",
    type: "Client",
    year: "", // TODO(Keith)
    role: "", // TODO(Keith): e.g. "Solo developer"
    stack: ["HTML5", "CSS3", "JavaScript"],
    featured: true,
    links: {
      caseStudy: "/projects/nclex-amplified-interns",
      live: "https://interns.nclexamplifiedreviewcenter.com",
    },
    screens: captures("nclex-amplified-interns"),
    cover: "/images/projects/nclex-amplified.png",
    gallery: [
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
    index: 2,
    title: "Iconic Cards PH – Point of Sale System",
    shortTitle: "Iconic Cards",
    summary:
      "An adaptive web and mobile point-of-sale and ordering system for Iconic Cards PH, with a searchable card catalog, cart and checkout, and an admin panel for managing products and orders with Excel export.",
    type: "Client",
    year: "", // TODO(Keith)
    role: "", // TODO(Keith)
    stack: ["JavaScript", "Node.js", "Express", "HTML5", "CSS3"],
    links: {
      caseStudy: "/projects/iconic-cards-pos",
      live: "https://iconiccards.vercel.app/",
    },
    screens: captures("iconic-cards-pos"),
    cover: "/images/projects/iconiccards-1.png",
    gallery: ["/images/projects/iconiccards-1.png", "/images/projects/iconiccards-2.png"],
  },
  {
    slug: "one-cainta",
    index: 3,
    title: "ONE CAINTA APP",
    shortTitle: "One Cainta",
    summary:
      "A unified municipal portal and public service application for Cainta, Rizal providing digital community services, public announcements, and local government resources.",
    type: "Client", // TODO(Keith): confirm; built for the Municipality of Cainta.
    year: "", // TODO(Keith)
    role: "", // TODO(Keith)
    stack: ["PHP", "JavaScript", "HTML5", "CSS3", "MySQL"],
    links: { caseStudy: "/projects/one-cainta", live: "https://onecainta.com" },
    screens: captures("one-cainta"),
    cover: "/images/projects/onecainta.png",
    gallery: ["/images/projects/onecainta.png"],
  },
  {
    slug: "jpcs-sscr-manila",
    index: 4,
    title: "SSCRMNL IT DEPARTMENT OFFICIAL PAGE",
    shortTitle: "JPCS Portal",
    summary:
      "A student-led computing community website for technical learning, leadership, innovation, professional connection, and service.",
    type: "Organization",
    year: "", // TODO(Keith)
    role: "", // TODO(Keith)
    stack: ["React", "Vite", "Tailwind CSS", "Supabase", "Vercel"],
    links: { caseStudy: "/projects/jpcs-sscr-manila", live: "https://jpcs-sscrmnl.vercel.app/" },
    screens: captures("jpcs-sscr-manila"),
    cover: "/images/projects/sscrmnl-itdept-1.png",
    gallery: [
      "/images/projects/sscrmnl-itdept-1.png",
      "/images/projects/sscrmnl-itdept-2.png",
      "/images/projects/sscrmnl-itdept-3.png",
    ],
  },
  {
    slug: "cicerra-realty",
    index: 5,
    title: "Cicerra Realty Services",
    shortTitle: "Cicerra Realty",
    summary:
      "A professional real estate listing and services platform with modern property discovery, detailed listing views, a seamless contact system, and fully responsive layouts.",
    type: "Client",
    year: "", // TODO(Keith)
    role: "", // TODO(Keith)
    stack: ["React", "TypeScript", "TanStack Start", "Tailwind CSS", "Vercel"],
    links: {
      caseStudy: "/projects/cicerra-realty",
      live: "https://cicerra-realty-services.vercel.app/",
    },
    screens: captures("cicerra-realty"),
    cover: "/images/projects/cicerra-1.png",
    gallery: ["/images/projects/cicerra-1.png"],
  },
  {
    slug: "sscrecoletos-connect",
    index: 6,
    title: "SSCRecoletos Connect",
    shortTitle: "SSCR Connect",
    summary:
      "An outcome-based monitoring and evaluation portal for outreach satisfaction surveys, with custom forms, emoji rating metrics, response logging, and visual dashboards.",
    type: "School",
    year: "", // TODO(Keith)
    role: "", // TODO(Keith)
    stack: ["React", "TypeScript", "Tailwind CSS", "Shadcn UI", "Supabase", "Vite"],
    links: { caseStudy: "/projects/sscrecoletos-connect" },
    // No public deployment to capture yet.
    screens: NO_SCREENS,
    cover: "/images/projects/connect-dashboard.png",
    gallery: ["/images/projects/connect-dashboard.png"],
  },
  {
    slug: "sscr-library",
    index: 7,
    title: "Web Based Library Management System",
    shortTitle: "SSCR Library",
    summary:
      "A customized school library portal featuring authentication, active book-loan checkouts, and student and librarian management tables.",
    type: "School",
    year: "", // TODO(Keith)
    role: "", // TODO(Keith)
    stack: ["React", "TypeScript", "Tailwind CSS", "Shadcn UI", "Vite"],
    links: {
      caseStudy: "/projects/sscr-library",
      live: "https://final-sscr-library.vercel.app/",
      repo: "https://github.com/keithciceron2004-star/FINAL-SSCR-LIBRARY",
    },
    // The live deploy renders blank (its assets 404 under the /FINAL-SSCR-LIBRARY/ base path);
    // switch to captures("sscr-library") once it's fixed and recaptured.
    screens: NO_SCREENS,
    cover: "/images/projects/library-login.png",
    gallery: ["/images/projects/library-login.png"],
  },
];
