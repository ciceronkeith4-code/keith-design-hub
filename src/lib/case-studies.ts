/**
 * Long-form write-ups for /projects/<slug>, keyed by Project.slug.
 *
 * Features and technical decisions are drawn from each project's code and live site. Sections set to
 * `null` are hidden on the page until filled in; the TODO beside each one says what belongs there.
 */
export interface CaseStudy {
  /** Who the project was built for. */
  builtFor: string;
  /** Your role and scope, e.g. "Solo developer: design, frontend, backend, deployment". */
  role: string | null;
  /** One-paragraph overview shown under the title. */
  summary: string;
  /** What was wrong or missing before this existed. */
  problem: string | null;
  features: string[];
  decisions: { title: string; body: string }[];
  /** The hardest part and how you solved it. */
  challenges: string | null;
  /** Results: usage, adoption, feedback, anything measurable. */
  outcome: string | null;
}

export const CASE_STUDIES: Record<string, CaseStudy> = {
  "nclex-amplified-interns": {
    builtFor: "NCLEX Amplified Review Center",
    role: null, // TODO(Keith): your role and scope on this build.
    summary:
      "The official landing page for NCLEX Amplified's internship and OJT program. It explains the 500-hour IT/CS track, introduces each department, and takes applications from BSIT and BSCS students.",
    problem: null, // TODO(Keith): how applicants found and applied to the program before this page.
    features: [
      "A scroll-driven hero: a 3D app dashboard mockup that flattens into a centered layout as the visitor scrolls.",
      "The 500-hour curriculum as a five-phase interactive roadmap covering frontend, backend, DevOps/LAN, and a capstone.",
      "A multi-step application modal that checks the applicant's program (BSIT or BSCS only) and routes them by department.",
      "A testimonial carousel with auto-rotation, arrow controls, dots, and touch swipe.",
      "An FAQ accordion and per-department detail drawers.",
    ],
    decisions: [
      {
        title: "No framework, no build step",
        body: "The site is plain HTML, CSS, and JavaScript served as static files, with a small Node.js server for local development. Nothing needs compiling, so updating copy or a department is a direct file edit.",
      },
      {
        title: "Motion that respects the visitor",
        body: "Scroll reveals run on IntersectionObserver rather than scroll listeners, and are skipped entirely when the visitor has reduced motion turned on.",
      },
    ],
    challenges: null, // TODO(Keith): e.g. getting the 3D hero transition smooth on phones.
    outcome: null, // TODO(Keith): applications received, feedback from the review center.
  },

  "iconic-cards-pos": {
    builtFor: "Iconic Cards PH",
    role: null, // TODO(Keith): your role and scope.
    summary:
      "A point-of-sale and ordering system for a trading card shop that works on desktop and mobile. Customers browse and order from the catalog; staff manage products and orders from an admin panel.",
    problem: null, // TODO(Keith): how the shop took orders and tracked stock before.
    features: [
      "A searchable card catalog loaded from the store's product API.",
      "Cart and checkout that submit orders straight to the backend.",
      "An admin panel behind a login for adding, editing, and photographing products.",
      "Order management for staff, including batch resets.",
      "Excel export of orders for the shop's own records.",
    ],
    decisions: [
      {
        title: "One REST API for storefront and admin",
        body: "The storefront and the admin panel share one Express API. Public routes serve products and store info and accept orders; everything under /api/admin requires a login token.",
      },
    ],
    challenges: null, // TODO(Keith)
    outcome: null, // TODO(Keith): orders processed, time saved for staff.
  },

  "one-cainta": {
    builtFor: "Municipality of Cainta, Rizal",
    role: null, // TODO(Keith): your role and scope.
    summary:
      "A unified municipal portal for Cainta, Rizal that brings public announcements, digital community services, and local government resources into one place.",
    problem: null, // TODO(Keith): where residents found this information before.
    features: [
      "Public announcements from the local government.",
      "Digital access to community services.",
      "A directory of local government resources.",
      "Installable on phones as a Progressive Web App.",
    ],
    decisions: [
      {
        title: "A Progressive Web App on a PHP and MySQL stack",
        body: "Server-rendered PHP pages backed by MySQL, plus a web app manifest, so residents can install the portal on their home screen without an app store.",
      },
    ],
    challenges: null, // TODO(Keith)
    outcome: null, // TODO(Keith)
  },

  "jpcs-sscr-manila": {
    builtFor: "JPCS – San Sebastian College Recoletos Manila",
    role: null, // TODO(Keith): your role and scope.
    summary:
      "The public website and student portal of the Junior Philippine Computer Society chapter at SSCR Manila. The public side presents the organization; behind the login, students track their academic records against the BSIT curriculum.",
    problem: null, // TODO(Keith): how students tracked grades and award eligibility before.
    features: [
      "A public site presenting the organization, its officers, and announcements.",
      "Student accounts with semester-by-semester grade records mapped to the BSIT curriculum.",
      "A grade simulator that shows how changing a grade affects the student's general average and award eligibility.",
      "Grade import from a photo or screenshot of a grade sheet, read with OCR in the browser.",
      "Admin tools for announcements, award rules, the curriculum, and student accounts.",
    ],
    decisions: [
      {
        title: "OCR in the browser",
        body: "Grade sheets are read with Tesseract.js on the student's own device, so nobody retypes every subject and no images are sent to a third-party OCR service.",
      },
      {
        title: "Award rules as data",
        body: "Award thresholds live in an award_settings table that admins edit from the portal. The simulator and dashboards read the same rules, so a policy change needs no code change.",
      },
      {
        title: "Supabase as the backend",
        body: "Supabase provides the Postgres database and file storage, which let a student-run organization ship a full portal without running its own server.",
      },
    ],
    challenges: null, // TODO(Keith): e.g. parsing grade sheets reliably with OCR.
    outcome: null, // TODO(Keith): number of students using it.
  },

  "cicerra-realty": {
    builtFor: "Cicerra Realty Services",
    role: null, // TODO(Keith): your role and scope.
    summary:
      "A marketing and listings site for a real estate brokerage, with property search, detailed listings, and an admin panel the broker uses to manage properties without a developer.",
    problem: null, // TODO(Keith): how listings were published before.
    features: [
      "Property discovery with search and a featured-listings slider.",
      "Detailed listing views and dedicated pages for services, the team, and contact.",
      "An embedded AI chat agent (Jotform) that answers visitor questions.",
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
        body: "The listings are one small JSON document, so they are stored in Vercel KV rather than a full database, with nothing extra to provision or maintain.",
      },
    ],
    challenges: null, // TODO(Keith)
    outcome: null, // TODO(Keith): inquiries generated, broker feedback.
  },

  "sscrecoletos-connect": {
    builtFor: "San Sebastian College Recoletos (school project)",
    role: null, // TODO(Keith): your role and scope.
    summary:
      "A monitoring and evaluation portal for outreach programs. Organizers build satisfaction surveys, share them by link or QR code, and read the results on a dashboard.",
    problem: null, // TODO(Keith): how outreach feedback was collected before (paper forms? Google Forms?).
    features: [
      "A form builder with 13 question types: text, choice, ranking, date, and several rating styles.",
      "A five-point emoji satisfaction scale made for quick answers on a phone.",
      "A public link for every form (/f/<slug>) plus a downloadable QR code for printed materials.",
      "A response log with CSV and JSON export.",
      "An analytics dashboard with a response trend, responses per form, and the overall emoji satisfaction breakdown.",
    ],
    decisions: [
      {
        title: "A normalized survey schema",
        body: "Postgres tables for forms, questions, responses, and answers. Each answer references its question, so analytics can aggregate every emoji-scale answer across all forms with a single join.",
      },
      {
        title: "Shareable by slug",
        body: "Every form gets a readable slug, so the same link works typed, clicked, or scanned from the generated QR code, and respondents need no account.",
      },
    ],
    challenges: null, // TODO(Keith)
    outcome: null, // TODO(Keith): number of programs and responses collected.
  },

  "sscr-library": {
    builtFor: "San Sebastian College Recoletos (school project)",
    role: null, // TODO(Keith): your role and scope.
    summary:
      "A library management prototype for the school library, with separate dashboards for borrowers, librarians, and a supervisor.",
    problem: null, // TODO(Keith): what the library's current process is.
    features: [
      "Sign-in with a school ID, with role-based dashboards for students, faculty, librarians, and a supervisor.",
      "A book catalog with filters by genre and year level.",
      "Librarians scoped to a year level: each sees and adds books only for their own section.",
      "Loan checkout and tracking with due dates.",
      "A supervisor dashboard for managing accounts, including role changes.",
      "Cascading deletes, so removing a book or user also cleans up the related loans.",
    ],
    decisions: [
      {
        title: "Prototype first, backend later",
        body: "All data lives in the browser's localStorage behind a small typed store module. The full borrowing flow can be demoed without a server, and the store is the single place to swap in a real API.",
      },
    ],
    challenges: null, // TODO(Keith)
    outcome: null, // TODO(Keith): grade or feedback from the class or library staff.
  },
};
