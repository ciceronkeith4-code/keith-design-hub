/**
 * Every project on the site. The /projects list, each /projects/<slug> case study, the Skills page,
 * the command palette, and the sitemap all read from this file.
 *
 * TODO(Keith): fill in the empty fields below.
 *   - role and timeline (e.g. "Jan to Apr 2025"): every project
 *   - Freelance Web Developer start month and year: src/lib/portfolio-data.ts
 *   - status: SSCRecoletos Connect (no public deployment yet)
 *   - status: SSCR Library (the live URL loads a blank page; its assets 404 under the
 *     /FINAL-SSCR-LIBRARY/ base path)
 *
 * Device screenshots live at /images/projects/<slug>/<device>-<n>.webp. Recapture them with
 * `node --experimental-strip-types scripts/capture-screens.mjs <slug>`.
 */

export type Device = "desktop" | "tablet" | "mobile";

/** The viewport each device's screenshots are captured at, in CSS pixels. */
export const DEVICES: Record<Device, { label: string; width: number; height: number }> = {
  desktop: { label: "Desktop", width: 1440, height: 900 },
  tablet: { label: "Tablet", width: 1194, height: 834 },
  mobile: { label: "Mobile", width: 390, height: 844 },
};

export type Project = {
  slug: string;
  /** Client or product name only. */
  name: string;
  /** Short sentence-case label shown above the name. */
  type: string;
  /** Two sentences at most, for the top of the case study. The first also describes the project on /projects. */
  intro: string;
  client: string;
  role: string;
  /** e.g. "Jan to Apr 2025". Empty hides it. */
  timeline: string;
  status: string;
  stack: string[];
  /** 3 to 5 bullets for "What I built". */
  built: string[];
  /** Two or more show as "Technical decisions"; a single one shows as "How it works". */
  decisions: { title: string; body: string }[];
  links: { live?: string; code?: string };
  /** The first image is the case study hero and the link preview image. */
  images: { src: string; alt: string }[];
  /** The device shown largest and in front of the preview scene. */
  heroDevice: Device;
  /** Only the devices the project is used on. Defaults to all three. */
  devices?: Device[];
  /** A real photo of the work; when set, the "All" preview shows it instead of the devices. */
  photo?: string;
  /** Full-page captures per device. An empty list shows a "Screenshot coming soon" screen. */
  screens: Record<Device, string[]>;
};

/** Tags in display order: frontend, backend, database, then hosting. */
export const STACK_ORDER = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "TanStack Start",
  "Vite",
  "Tailwind CSS",
  "Shadcn UI",
  "Node.js",
  "Express",
  "PHP",
  "MySQL",
  "Supabase",
  "Firebase",
  "Vercel",
];

const byStackOrder = (a: string, b: string) => STACK_ORDER.indexOf(a) - STACK_ORDER.indexOf(b);

/** The conventional screenshot paths for a project: <device>-1.webp … <device>-<count>.webp. */
function captures(slug: string, count = 1): Project["screens"] {
  const list = (device: Device) =>
    Array.from({ length: count }, (_, i) => `/images/projects/${slug}/${device}-${i + 1}.webp`);
  return { desktop: list("desktop"), tablet: list("tablet"), mobile: list("mobile") };
}

const NO_SCREENS: Project["screens"] = { desktop: [], tablet: [], mobile: [] };

const projects: Project[] = [
  {
    slug: "nclex-amplified-interns",
    name: "NCLEX Amplified Interns",
    type: "Internship landing page",
    intro:
      "I built the official landing page for the NCLEX Amplified internship and OJT program. It walks BSIT and BSCS students through the 500-hour IT/CS track and each department, then takes their application.",
    client: "NCLEX Amplified Review Center",
    role: "",
    timeline: "",
    status: "Live",
    stack: ["HTML", "CSS", "JavaScript"],
    built: [
      "A scroll-driven hero where a 3D dashboard mockup flattens into a centered layout as you scroll.",
      "The 500-hour curriculum as a five-phase roadmap covering frontend, backend, DevOps and LAN, and a capstone.",
      "A multi-step application form that checks the applicant's program (BSIT or BSCS only) and routes them by department.",
      "A testimonial carousel with auto-rotation, arrow controls, dots, and touch swipe.",
      "An FAQ accordion and a detail drawer for each department.",
    ],
    decisions: [
      {
        title: "No framework, no build step",
        body: "The site is plain HTML, CSS, and JavaScript served as static files, with a small Node.js server for local development. Nothing needs compiling, so changing copy or a department is a direct file edit.",
      },
      {
        title: "Scroll reveals that respect reduced motion",
        body: "Sections reveal with IntersectionObserver instead of scroll listeners. Visitors who turn on reduced motion skip the reveals entirely.",
      },
    ],
    links: { live: "https://interns.nclexamplifiedreviewcenter.com" },
    images: [
      {
        src: "/images/projects/nclex-amplified.png",
        alt: "Landing page hero with the headline Start Your Internship and an Apply for Internship button",
      },
      {
        src: "/images/projects/nclex-shot-1.png",
        alt: "Loading screen with the NCLEX Amplified Interns logo and a progress bar",
      },
      {
        src: "/images/projects/nclex-shot-2.png",
        alt: "Section listing what interns get: real experience, practical skills, and a career portfolio",
      },
      {
        src: "/images/projects/nclex-shot-3.png",
        alt: "Row of black and white photos of interns at work, above a line about hands-on training",
      },
      {
        src: "/images/projects/nclex-shot-4.png",
        alt: "Testimonial carousel showing an intern's review with a five-star rating",
      },
      {
        src: "/images/projects/nclex-shot-5.png",
        alt: "Closing call to apply above the footer with navigation, working hours, and contact details",
      },
    ],
    heroDevice: "mobile",
    screens: captures("nclex-amplified-interns"),
  },
  {
    slug: "iconic-cards-pos",
    name: "Iconic Cards PH",
    type: "Point of sale",
    intro:
      "I built a point-of-sale and ordering system for Iconic Cards PH that works on desktop and mobile. Customers browse the card catalog and place orders, and staff manage products and orders from an admin panel.",
    client: "Iconic Cards PH",
    role: "",
    timeline: "",
    status: "Live",
    stack: ["HTML", "CSS", "JavaScript", "Node.js", "Express"],
    built: [
      "A searchable card catalog loaded from the store's product API.",
      "A cart and checkout that send orders straight to the backend.",
      "An admin panel behind a login for adding, editing, and photographing products.",
      "Order management for staff, including batch resets.",
      "Excel export of orders for the shop's own records.",
    ],
    decisions: [
      {
        title: "One REST API for the storefront and the admin panel",
        body: "The storefront and the admin panel share one Express API. Public routes serve products and store info and accept orders. Everything under /api/admin needs a login token.",
      },
    ],
    links: { live: "https://iconiccards.vercel.app/" },
    images: [
      {
        src: "/images/projects/iconiccards-1.png",
        alt: "Desktop product catalog with a card search bar, a trading card listing, and an empty cart panel with order totals",
      },
      {
        src: "/images/projects/iconiccards-2.png",
        alt: "Mobile catalog with the card search bar, one card listing, and a bottom bar with Home and My Cart",
      },
    ],
    heroDevice: "mobile",
    screens: captures("iconic-cards-pos"),
  },
  {
    slug: "one-cainta",
    name: "One Cainta",
    type: "Municipal portal",
    intro:
      "One Cainta puts the town's public announcements, digital community services, and local government resources on one site. Residents can install it on their phones like an app.",
    client: "Municipality of Cainta, Rizal",
    role: "",
    timeline: "",
    status: "Live",
    stack: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
    built: [
      "Public announcements from the local government.",
      "Online access to community services.",
      "A directory of local government resources.",
      "A Progressive Web App setup, so residents can install the portal on their phones.",
    ],
    decisions: [
      {
        title: "A Progressive Web App on PHP and MySQL",
        body: "Pages are rendered on the server with PHP and backed by MySQL. A web app manifest lets residents add the portal to their home screen without an app store.",
      },
    ],
    links: { live: "https://onecainta.com" },
    images: [
      {
        src: "/images/projects/onecainta.png",
        alt: "Dashboard with a Hello, Cainteño greeting card, the latest announcements heading, and an hourly weather forecast for Cainta",
      },
    ],
    heroDevice: "mobile",
    screens: captures("one-cainta"),
  },
  {
    slug: "jpcs-sscr-manila",
    name: "SSCR Manila IT Department",
    type: "Department website",
    intro:
      "This is the public website and student portal of the Junior Philippine Computer Society chapter at SSCR Manila. Behind the login, students track their grades against the BSIT curriculum.",
    client: "JPCS, San Sebastian College Recoletos Manila",
    role: "",
    timeline: "",
    status: "Live",
    stack: ["React", "Vite", "Tailwind CSS", "Supabase", "Vercel"],
    built: [
      "A public site presenting the organization, its officers, and announcements.",
      "Student accounts with grade records for each semester, mapped to the BSIT curriculum.",
      "A grade simulator that shows how changing a grade moves the general average and award eligibility.",
      "Grade import from a photo or screenshot of a grade sheet, read with OCR in the browser.",
      "Admin tools for announcements, award rules, the curriculum, and student accounts.",
    ],
    decisions: [
      {
        title: "OCR in the browser",
        body: "Grade sheets are read with Tesseract.js on the student's own device. Nobody retypes every subject, and no images go to a third-party OCR service.",
      },
      {
        title: "Award rules as data",
        body: "Award thresholds live in an award_settings table that admins edit from the portal. The simulator and dashboards read the same rules, so a policy change needs no code change.",
      },
      {
        title: "Supabase as the backend",
        body: "Supabase provides the Postgres database and file storage. That let a student-run organization ship a full portal without running its own server.",
      },
    ],
    links: { live: "https://jpcs-sscrmnl.vercel.app/" },
    images: [
      {
        src: "/images/projects/sscrmnl-itdept-1.png",
        alt: "Home page with a large headline about future computing professionals beside a BSIT program poster",
      },
      {
        src: "/images/projects/sscrmnl-itdept-2.png",
        alt: "Intro screen with the SSCR and JPCS logos on a dark red background and a Skip intro link",
      },
      {
        src: "/images/projects/sscrmnl-itdept-3.png",
        alt: "About the department section with a large headline beside a photo of two speakers at a podium",
      },
    ],
    heroDevice: "mobile",
    screens: captures("jpcs-sscr-manila"),
  },
  {
    slug: "cicerra-realty",
    name: "Cicerra Realty",
    type: "Real estate website",
    intro:
      "I built the website for Cicerra Realty Services, a real estate brokerage. Visitors search and browse listings, and the broker adds, edits, and removes properties from an admin panel without a developer.",
    client: "Cicerra Realty Services",
    role: "",
    timeline: "",
    status: "Live",
    stack: ["React", "TypeScript", "TanStack Start", "Tailwind CSS", "Vercel"],
    built: [
      "Property search and a featured listings slider.",
      "Detailed listing views, plus pages for services, the team, and contact.",
      "An embedded Jotform AI chat agent that answers visitor questions.",
      "An admin panel for adding, editing, and removing listings.",
      "Responsive layouts from phone to desktop.",
    ],
    decisions: [
      {
        title: "Full-stack React with TanStack Start",
        body: "Pages and the listings API live in one TanStack Start app. A server route reads and writes the listings, so there is no separate backend to deploy.",
      },
      {
        title: "Vercel KV instead of a database server",
        body: "The listings are one small JSON document, so they're stored in Vercel KV rather than a full database. There is nothing extra to provision or maintain.",
      },
    ],
    links: { live: "https://cicerra-realty-services.vercel.app/" },
    images: [
      {
        src: "/images/projects/cicerra-1.png",
        alt: "Home page hero over a photo of a house at dusk, with buy, rent, and sell tabs and a property search bar",
      },
    ],
    heroDevice: "mobile",
    screens: captures("cicerra-realty"),
  },
  {
    slug: "sscrecoletos-connect",
    name: "SSCRecoletos Connect",
    type: "Survey portal",
    intro:
      "SSCRecoletos Connect helps outreach organizers at San Sebastian College Recoletos collect feedback. They build a survey, share it by link or QR code, and read the responses on a dashboard.",
    client: "San Sebastian College Recoletos (school project)",
    role: "",
    timeline: "",
    status: "",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Shadcn UI", "Supabase"],
    built: [
      "A form builder with 13 question types, including text, choice, ranking, date, and several rating styles.",
      "A five-point emoji satisfaction scale made for quick answers on a phone.",
      "A public link for every form (/f/<slug>) and a downloadable QR code for printed materials.",
      "A response log with CSV and JSON export.",
      "An analytics dashboard with a response trend, responses per form, and the overall satisfaction breakdown.",
    ],
    decisions: [
      {
        title: "A normalized survey schema",
        body: "Postgres tables hold forms, questions, responses, and answers. Each answer references its question, so analytics can add up every emoji-scale answer across all forms with a single join.",
      },
      {
        title: "Shareable by slug",
        body: "Every form gets a readable slug, so the same link works typed, clicked, or scanned from the QR code. Respondents don't need an account.",
      },
    ],
    links: {},
    images: [
      {
        src: "/images/projects/connect-dashboard.png",
        alt: "Dashboard loading, with placeholder cards under a red banner and two published forms in the Recent Forms list",
      },
    ],
    heroDevice: "mobile",
    // No public deployment to capture yet.
    screens: NO_SCREENS,
  },
  {
    slug: "sscr-library",
    name: "SSCR Library",
    type: "Library system",
    intro:
      "I built a library management prototype for the SSCR school library. Students and faculty borrow books, each librarian manages the books for their year level, and a supervisor manages accounts.",
    client: "San Sebastian College Recoletos (school project)",
    role: "",
    timeline: "",
    status: "",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Shadcn UI"],
    built: [
      "Sign-in with a school ID and separate dashboards for students, faculty, librarians, and a supervisor.",
      "A book catalog with filters by genre and year level.",
      "Librarians limited to their own year level, so each sees and adds books only for their section.",
      "Loan checkout and tracking with due dates.",
      "A supervisor dashboard for managing accounts, including role changes.",
    ],
    decisions: [
      {
        title: "Prototype first, backend later",
        body: "All data lives in the browser's localStorage behind a small typed store module. The full borrowing flow can be demoed without a server, and the store is the one place to swap in a real API.",
      },
    ],
    links: {
      live: "https://final-sscr-library.vercel.app/",
      code: "https://github.com/keithciceron2004-star/FINAL-SSCR-LIBRARY",
    },
    images: [
      {
        src: "/images/projects/library-login.png",
        alt: "Sign-in page with the San Sebastian College Recoletos seal and a school ID and password form",
      },
    ],
    heroDevice: "mobile",
    // The live deploy renders blank; switch to captures("sscr-library") once it's fixed.
    screens: NO_SCREENS,
  },
];

export const PROJECTS: Project[] = projects.map((p) => ({
  ...p,
  stack: [...p.stack].sort(byStackOrder),
}));
