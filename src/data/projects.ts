/**
 * Every project on the site. The /projects list, each /projects/<slug> case study, the Skills page,
 * the command palette, and the sitemap all read from this file.
 *
 * TODO(Keith): fill in the empty fields below.
 *   - role and timeline (e.g. "Jan to Apr 2025"): every project
 *   - Freelance Web Developer start month and year: src/lib/portfolio-data.ts
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
  "Gemini API",
  "MySQL",
  "Supabase",
  "Firebase",
  "Redis",
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
    slug: "pingpong-city",
    name: "PingPong City Sports Center",
    type: "Business website",
    intro:
      "I built the website for PingPong City Sports Center, a table tennis venue at Farmers Plaza in Araneta City, Quezon City. Visitors find the location, opening hours, and rates on one page, with a notice that says whether the center is open right now.",
    client: "PingPong City Sports Center",
    role: "",
    timeline: "",
    status: "Live",
    stack: ["HTML", "CSS", "JavaScript", "Tailwind CSS", "Vercel"],
    built: [
      "A one-page site with sections for the location, opening hours, rates, and contact, and a Google Maps link to the venue.",
      "A hero with a 3D table tennis rally, where the table top is printed with the two headline rates.",
      "An Open now or Closed now notice, worked out from the posted hours in Philippine time and refreshed every minute.",
      "A rate board for unlimited play, hourly table rental with racket and ball, and coaching, with the student, senior, and PWD discount noted.",
      "Contact links to the Facebook group, email, Messenger, and TikTok, plus a mobile menu and a nav that follows the section on screen.",
    ],
    decisions: [
      {
        title: "A 3D hero that can fail safely",
        body: "The rally is drawn with three.js, loaded in the browser. If WebGL or the download fails, a plain SVG table stays in its place. The animation pauses when the hero is off screen or the tab is hidden, and with reduced motion on it shows one still frame.",
      },
      {
        title: "Open or closed, worked out in the browser",
        body: "The opening hours sit in a small table in the page script, and the notice reads the time in Asia/Manila, so a visitor in another country still sees the right status. If the script fails, the static hours text remains.",
      },
      {
        title: "No framework, one small stylesheet",
        body: "The site is a single HTML file. Tailwind compiles only the classes it uses into one minified stylesheet at build time, and Vercel serves the folder as static files with caching headers for images and CSS.",
      },
    ],
    links: {
      live: "https://pingpongcitysportscenter.vercel.app/",
      code: "https://github.com/ciceronkeith4-code/pingpongcity",
    },
    images: [
      {
        src: "/images/projects/pingpong-city/desktop-1.webp",
        alt: "Dark home page with the headline Your game. Your city. Your table., a 3D table showing the 100 and 200 peso rates, and sections for location, hours, rates, and contact",
      },
      {
        src: "/images/projects/pingpong-city/desktop-2.webp",
        alt: "Rates section with unlimited play from 100 pesos, hourly table rental at 200 pesos, and coaching at 500 pesos for one student",
      },
      {
        src: "/images/projects/pingpong-city/desktop-3.webp",
        alt: "Opening hours section listing Monday to Thursday and Sunday from 10 AM to 9 PM, Friday and Saturday to 10 PM, and a box showing whether the center is open now",
      },
    ],
    heroDevice: "mobile",
    // Captured from the live site with reduced motion on, so the 3D hero is one still frame.
    screens: captures("pingpong-city", 3),
  },
  {
    slug: "booking-system-demo",
    name: "Booking System Demo",
    type: "Booking system",
    intro:
      "I built a booking system that a business owner can try right away, with no sign-up. Customers book, look up, move, and cancel appointments, and each change shows up in the admin side straight away.",
    client: "Personal project",
    role: "",
    timeline: "",
    status: "Live",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Vercel"],
    built: [
      "A four-step booking flow: choose a service and a staff member (or whoever is free), pick a date and time, enter contact details, and review. Customers get a reference code to look up, reschedule, or cancel the booking later.",
      "Only real openings are offered. Times respect business hours, break time, closed dates, each staff member's working days, and the bookings already made. Group classes show how many spots are left.",
      "An optional GCash down payment, with payment steps and an upload for the payment screenshot.",
      "An admin side with a dashboard, day, week, and month calendars, a searchable bookings list, walk-in bookings, and pages for services, staff, opening hours, customers, and settings.",
      "Four business types (dental clinic, salon and spa, gym, resort), each with its own services, staff, labels, and colors, plus a guided tour that makes one booking by itself.",
    ],
    decisions: [
      {
        title: "One store checks every booking",
        body: "Customer pages and admin pages share one Zustand store. Every new booking and every reschedule goes through it and checks the slot again before saving, so a time that was just taken is refused instead of double booked.",
      },
      {
        title: "Everything runs on Philippine time",
        body: "Dates are kept as YYYY-MM-DD and times as HH:mm in Manila time. A visitor in another country sees the same open times, and the same times counted as past, as the business does.",
      },
      {
        title: "A demo that leaves nothing behind",
        body: "There is no backend, database, or localStorage. Everything lives in memory and a reload clears it, so a prospect can try anything without leaving data behind. The SMS and email a booking would trigger are written to an admin log instead of being sent.",
      },
    ],
    links: {
      live: "https://bookingsystemdemo.vercel.app/",
      code: "https://github.com/ciceronkeith4-code/Booking-System-Demo",
    },
    images: [
      {
        src: "/images/projects/booking-system-demo/desktop-1.webp",
        alt: "Home page with the headline Online booking for your dental clinic, buttons to pick a business type, and a phone preview of the booking screen",
      },
      {
        src: "/images/projects/booking-system-demo/desktop-2.webp",
        alt: "Date and time step with an October calendar, open morning, afternoon, and evening times, and 10:00 AM selected",
      },
      {
        src: "/images/projects/booking-system-demo/desktop-3.webp",
        alt: "Admin calendar for one week with confirmed and pending bookings, a shaded lunch break, and a blocked Saturday",
      },
    ],
    heroDevice: "mobile",
    // Captured from the live demo. The calendar shot has ten made-up bookings entered through the app itself.
    screens: captures("booking-system-demo", 3),
  },
  {
    slug: "mgl-food-hub",
    name: "MGL Food Hub",
    type: "Food delivery",
    intro:
      "I built MGL Food Hub, a scheduled food delivery site where customers order from 13 Malabon stores in one cart. They pick a delivery date and time slot, pay by cash on delivery or GCash, MariBank, or GoTyme, and track the order from a private link.",
    client: "MGL Food Hub",
    role: "",
    timeline: "",
    status: "Live",
    stack: ["React", "Vite", "Tailwind CSS", "Supabase", "Vercel"],
    built: [
      "One cart across all 13 partner stores, with menus, product search, and extra toppings.",
      "A checkout that books a delivery date and time slot and takes a payment screenshot for online payments.",
      "Private order tracking by link, with order lookup by order number and phone, re-uploading payment proof, and cancellation requests.",
      "An admin dashboard with live new orders, payments to verify, COD orders to call, and a delivery calendar.",
      "A daily prep list of what to order from each merchant, revenue reports, and CSV export.",
    ],
    decisions: [
      {
        title: "Realtime orders from Supabase",
        body: "Orders, products, and settings live in Supabase Postgres, and payment screenshots go to Supabase Storage. The admin dashboard subscribes to database changes, so new orders appear without a refresh.",
      },
      {
        title: "Ordering rules as settings",
        body: "The next-day cutoff time, how far ahead customers can book, blocked dates, the per-phone daily order limit, and the ordering guidelines are all edited from the admin panel. Checkout reads the same settings, so changing a rule needs no code change.",
      },
    ],
    links: { live: "https://mglfoodhub.vercel.app/" },
    images: [
      {
        src: "/images/projects/mgl-food-hub/desktop-1.webp",
        alt: "Home page with the headline Malabon's favorites, a Start your order button, and the partner stores below",
      },
    ],
    heroDevice: "mobile",
    screens: captures("mgl-food-hub"),
  },
  {
    slug: "kabisadeck",
    name: "Kabisadeck",
    type: "Board exam reviewer",
    intro:
      "Kabisadeck is a board exam reviewer for nursing students. Students upload their own reviewer as a PDF or pick a nursing topic, and it builds a timed practice quiz with a rationale for every answer.",
    client: "Personal project",
    role: "",
    timeline: "",
    status: "Live",
    stack: ["HTML", "CSS", "JavaScript", "Node.js", "Express", "Gemini API", "Redis", "Vercel"],
    built: [
      "Quizzes from an uploaded PDF or any nursing topic, in 10 to 50 questions across four difficulty levels.",
      "Grading on the server, so correct answers never reach the browser before the quiz is submitted.",
      "A Review Mistakes deck that turns every missed question into a flashcard.",
      "Exam rules: copy and right-click are blocked, each question is watermarked with the username, and leaving fullscreen or switching tabs three times forfeits the quiz.",
      "A dashboard with scores, pass rate, study time, topic mastery, and a full quiz history.",
    ],
    decisions: [
      {
        title: "Every question is checked twice",
        body: "One AI pass writes the questions, and code rejects any without four distinct choices and a rationale for each. A second pass fact-checks every question and answer, and wrong or repeated items are replaced.",
      },
      {
        title: "Built to run on Gemini's free tier",
        body: "A 10-question deck takes only a few large AI calls. When one Gemini model reaches its daily limit, the server switches to the next one, so students can keep reviewing.",
      },
      {
        title: "PDFs never leave the device",
        body: "The PDF is read in the browser with pdf.js, and only its text is sent to the server.",
      },
    ],
    links: {
      live: "https://kabisadeck.vercel.app/",
      code: "https://github.com/ciceronkeith4-code/kabisadeck",
    },
    images: [
      {
        src: "/images/projects/kabisadeck/desktop-1.webp",
        alt: "Choose a topic screen with nursing subjects such as Pharmacology and Pediatric Nursing, and a field for a custom topic",
      },
      {
        src: "/images/projects/kabisadeck/desktop-2.webp",
        alt: "Upload your reviewer screen with a drag and drop area for a PDF of up to 20 MB",
      },
      {
        src: "/images/projects/kabisadeck/desktop-3.webp",
        alt: "Kabisadeck sign-in card with username and password fields",
      },
    ],
    heroDevice: "mobile",
    // Captured from a local run, since the live site opens on the login: topic picker, PDF upload, login.
    screens: captures("kabisadeck", 3),
  },
  {
    slug: "freelanceos",
    name: "FreelanceOS",
    type: "Freelance CRM",
    intro:
      "FreelanceOS is a CRM I built to run a freelance IT business in one place. It follows each job from lead to quotation, project, invoice, and payment, and tracks renewals, expenses, and profit along the way.",
    client: "Personal project",
    role: "",
    timeline: "",
    status: "Live",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Shadcn UI", "Supabase", "Vercel"],
    built: [
      "A sales pipeline with a drag-and-drop lead board, and quotations that become projects in one click.",
      "Projects with milestones, tasks, time logs, change requests, and a note of where each client login is kept, never the password itself.",
      "Quotations and invoices with automatic numbers like INV-2026-0001, discounts, and a print-ready layout.",
      "Hosting, domain, and software renewals: marking one renewed records the payment and its cost, then sets the next due date.",
      "A dashboard and reports for income, unpaid balances, profit, and the effective hourly rate on each project.",
    ],
    decisions: [
      {
        title: "Business rules in the database",
        body: "Document numbers, renewals, and the dashboard and report figures run as Postgres functions and views. A renewal is one transaction, so a payment is never saved without its expense and new due date.",
      },
      {
        title: "Row-level security instead of a custom API",
        body: "Every table only returns rows owned by the signed-in user. The app queries Supabase directly from the browser, with no backend server to run.",
      },
      {
        title: "Sample data on demand",
        body: "One button in Settings fills the app with example leads, clients, projects, and invoices for a demo. Another removes them without touching real records.",
      },
    ],
    links: {
      live: "https://crm-freelance-six.vercel.app/",
      code: "https://github.com/ciceronkeith4-code/CRM-FREELANCE",
    },
    images: [
      {
        src: "/images/projects/freelanceos/desktop-1.webp",
        alt: "FreelanceOS sign-in page",
      },
    ],
    heroDevice: "mobile",
    screens: captures("freelanceos"),
  },
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
    status: "Live",
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
    links: { live: "https://satisfactionsystem.vercel.app/" },
    images: [
      {
        src: "/images/projects/sscrecoletos-connect/desktop-1.webp",
        alt: "Start of the outreach program evaluation form for organizers, with a privacy notice, step 1 of 7, and a Begin Survey button",
      },
      {
        src: "/images/projects/connect-dashboard.png",
        alt: "Dashboard loading, with placeholder cards under a red banner and two published forms in the Recent Forms list",
      },
    ],
    heroDevice: "mobile",
    screens: captures("sscrecoletos-connect"),
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
    // No code link: the repository is private (it returns 404), so there is nothing for visitors to open.
    // Add it back once the repo is public. The live site renders blank until the Vercel project's
    // VITE_BASE_URL variable is removed (its vite.config.ts already defaults to base "/").
    links: {
      live: "https://final-sscr-library.vercel.app/",
    },
    images: [
      {
        src: "/images/projects/library-login.png",
        alt: "Sign-in page with the San Sebastian College Recoletos seal and a school ID and password form",
      },
      {
        src: "/images/projects/sscr-library/desktop-1.webp",
        alt: "Student dashboard with active loans, the next due date, library hours, and a book list with Borrow buttons",
      },
      {
        src: "/images/projects/sscr-library/desktop-2.webp",
        alt: "Librarian catalog with tabs for borrowers and reservations, an Add Book button, and edit and delete actions",
      },
      {
        src: "/images/projects/sscr-library/desktop-3.webp",
        alt: "Supervisor user management with catalog and borrower counts and a table of student accounts",
      },
    ],
    heroDevice: "mobile",
    // Captured from a local build (the live deploy renders blank): student, librarian, supervisor.
    screens: captures("sscr-library", 3),
  },
];

export const PROJECTS: Project[] = projects.map((p) => ({
  ...p,
  stack: [...p.stack].sort(byStackOrder),
}));
