/**
 * What the site assistant knows that isn't already in the site's other data files (projects.ts and
 * portfolio-data.ts, which it reads directly). Everything here is public: it comes from Keith's
 * "Services and Pricing" guide (Aug 2026) and his resume, and the assistant is told to say it
 * doesn't know anything that isn't written down.
 *
 * Prices are starting rates in Philippine pesos. Update them here and the assistant follows.
 */

export type ServicePackage = {
  name: string;
  /** As written in the guide, e.g. "Starting at ₱10,000 to ₱15,000 (negotiable)". */
  price: string;
  summary: string;
  includes: string[];
  bestFor: string[];
};

export const PACKAGES: ServicePackage[] = [
  {
    name: "Basic Website",
    price: "Starting at ₱10,000 to ₱15,000 (negotiable)",
    summary:
      "A modern, responsive website for individuals, startups and small businesses that want a professional online presence.",
    includes: [
      "Up to 5 responsive pages",
      "Custom website design",
      "Mobile-friendly layout",
      "Contact form",
      "Basic SEO setup",
      "Social media links",
      "Google Maps integration (if needed)",
      "Deployment to a live domain",
      "One round of revisions",
    ],
    bestFor: [
      "Personal portfolios",
      "Freelancers",
      "Startup businesses",
      "Company profile websites",
      "Restaurants and cafés",
      "Clinics",
      "Salons",
      "Local businesses",
    ],
  },
  {
    name: "Business Website",
    price: "Starting at ₱20,000 to ₱30,000 (negotiable)",
    summary:
      "A professional website with extra functionality for businesses that need content management and user interaction.",
    includes: [
      "Up to 10 responsive pages",
      "Custom website design",
      "Content Management System (CMS)",
      "Blog or news section (optional)",
      "Contact and inquiry forms",
      "Basic database integration",
      "User login (if required)",
      "SEO optimization",
      "Performance optimization",
      "Deployment to production",
      "Two rounds of revisions",
    ],
    bestFor: [
      "Growing businesses",
      "Schools",
      "Real estate companies",
      "Hotels",
      "Corporate websites",
      "Service providers",
      "Organizations",
      "Membership websites",
    ],
  },
  {
    name: "Custom Web Application",
    price: "Starting at ₱50,000 to ₱100,000+ (negotiable)",
    summary:
      "A fully customized web-based system built to streamline business operations and manage data efficiently.",
    includes: [
      "Custom web application",
      "Secure user authentication",
      "Role-based access",
      "Dashboard",
      "Database integration",
      "Admin panel",
      "API integration",
      "Payment gateway integration (optional)",
      "Reporting features",
      "Deployment",
      "Three rounds of revisions",
    ],
    bestFor: [
      "School management systems",
      "Inventory systems",
      "Booking systems",
      "Human resource systems",
      "Customer management systems (CRM)",
      "Learning management systems (LMS)",
      "Business portals",
      "Custom management systems",
    ],
  },
  {
    name: "Website Redesign",
    price: "₱25,000 to ₱30,000+",
    summary:
      "A professional redesign of an existing website to improve its look, UI/UX, responsiveness and usability, keeping existing functionality where applicable.",
    includes: [
      "UI/UX redesign",
      "Modern visual layout",
      "Responsive optimization",
      "Improved typography, spacing and visual hierarchy",
      "Navigation and usability improvements",
      "Mobile, tablet and desktop optimization",
      "Existing functionality preserved where applicable",
      "Implementation of the approved redesign",
      "One to two rounds of revisions",
    ],
    bestFor: [],
  },
];

export const PRICING_NOTES = [
  "All prices are starting rates in Philippine pesos (PHP). The final quotation depends on the project's scope, required features, integrations and complexity, and Keith prepares each quotation individually.",
  "Projects are quoted as a fixed total project fee agreed before development begins, not billed hourly.",
  "Payment is released progressively as agreed tasks or milestones are completed and accepted; the remaining balance is settled when all agreed deliverables are done.",
  "Additional features, major revisions or anything beyond the agreed scope may be quoted separately, and timelines are estimates that can change if requirements are added.",
  "For redesigns, existing functionality is preserved where technically feasible; new functionality may need a separate quotation.",
  "After a quotation is approved, a Project Development Agreement may be prepared covering scope, fee, payment schedule, deliverables, timeline, revisions and support.",
];

export const EVERY_PROJECT_INCLUDES = [
  "Project consultation and planning",
  "Responsive website or application development",
  "Clean and maintainable code",
  "Basic security implementation",
  "Cross-browser and mobile compatibility testing",
  "Performance optimization",
  "Deployment assistance",
  "Progress updates throughout development",
  "Limited post-launch support, depending on the package",
];

export const NOT_INCLUDED = [
  "Domain registration",
  "Web hosting services",
  "Paid APIs or third-party services",
  "Premium software licenses",
  "Stock images or premium assets",
  "Logo design and branding",
  "Content writing or data entry",
  "Ongoing maintenance beyond the agreed support period",
];

export const SERVICES = [
  "Website development: professional, responsive websites",
  "Custom web applications: tailored web-based systems for business processes and data",
  "Front-end development: clean, modern, responsive interfaces",
  "Back-end development: data processing, business logic, user management, system integration",
  "Database design: structured, secure databases",
  "API integration: payment gateways, authentication providers, email services, cloud platforms and other external systems",
  "Authentication and security: secure login, access control",
  "Dashboard development: admin dashboards to manage content, monitor activity and generate reports",
  "Payment gateway integration: PayMongo, GCash, Maya, credit and debit cards, QR payments",
  "UI/UX implementation: turning design concepts into responsive interfaces",
  "Performance optimization: loading speed, responsiveness and search visibility",
  "Deployment and cloud services: hosting setup, deployment, domains, SSL",
  "Maintenance and technical support: updates, enhancements, bug fixes, security improvements",
];

/** The tools Keith's pricing guide lists for client work, by group. */
export const TECH_STACK: Record<string, string[]> = {
  Frontend: [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript (ES6+)",
    "Tailwind CSS",
    "HTML5",
    "CSS3",
  ],
  Backend: ["Node.js", "Firebase", "Supabase", "REST APIs"],
  Database: ["MySQL", "Firestore", "Supabase PostgreSQL"],
  "Cloud and deployment": ["Vercel", "Hostinger", "GitHub"],
  "Design and development tools": ["Git", "Figma", "Visual Studio Code", "Canva", "Stitch"],
};

/** From Keith's resume (the PDF linked from the site's navigation). Personal contact details are left out. */
export const RESUME_FACTS = [
  "Resume title: Junior Full Stack Developer, BSIT. The resume describes him as an AI-assisted full stack developer who builds responsive, database-driven web applications with React, TypeScript, JavaScript and Supabase.",
  "As a Dev Assistant he did manual testing across web and mobile apps, documenting 50+ functional and usability issues, helping resolve and verify 50+ issues, and running regression and functional tests across 10+ features.",
  "As a freelance photo editor he delivered 95%+ of completed projects within the agreed deadlines.",
  "At San Sebastian College Recoletos Manila he earned the OAR Scholarship, was BSIT Program President for 2 terms, and made Dean's List for all terms.",
  "He built the official JPCS and IT Department website and portal for his school, a project on this site as SSCR Manila IT Department.",
];

export const SITE_FACTS = [
  "Pages: Home (/), About (/about), Work (/projects) with a case study per project (/projects/<name>), Experience (/experience), Certifications (/certifications), Contact (/contact), and a public Guestbook (/guestbook).",
  "Resume: a PDF at /Keith-Ciceron-Resume.pdf, also linked in the top navigation next to GitHub and LinkedIn.",
  "Contact page: a message form (name, email and message are required) plus LinkedIn, Gmail and GitHub links.",
  "Guestbook: visitors sign in with Google and leave a note of up to 140 characters, one note each.",
  "Home has a like button (one like per visitor per day), and the site has a guided tour (the Tour button) that visits every page.",
  "The site has a light and dark theme and optional click sounds.",
];
