import { PROJECTS } from "@/data/projects";

export type TourSide = "top" | "right" | "bottom" | "left";

export type TourStep = {
  /** The page this step is on. The tour opens it first, then waits for the element to appear. */
  path: string;
  /** What to highlight. Several matches are highlighted together as one box. */
  selector: string;
  title: string;
  text: string;
  /** Which side of the highlight the bubble prefers; it moves to another side when this one has no room. */
  placement: TourSide;
  /** Skipped when the window is narrower than this (px), because the element is hidden there. */
  minWidth?: number;
  /** Label for the Next button on the last step. */
  next?: string;
};

// One example case study for the tour: the first project on the Work page.
const CASE_STUDY = `/projects/${PROJECTS[0].slug}`;

/**
 * The tour visits every page in the menu order, then the guestbook. Each step points at one specific thing,
 * marked with data-tour (or data-section on a case study), so what is lit is exactly what the text describes.
 * A step whose element never appears (for instance a case study without a "Technical decisions" section) is
 * skipped rather than shown wrong.
 */
export const TOUR_STEPS: TourStep[] = [
  // Home, and the parts that are on every page.
  {
    path: "/",
    selector: 'nav[aria-label="Main"] > a',
    title: "Menu",
    text: "The five main pages: Home, About, Work, Experience and Contact. This tour visits each one.",
    placement: "right",
  },
  {
    path: "/",
    selector: '[data-tour="links"]',
    minWidth: 640,
    title: "Links",
    text: "GitHub and LinkedIn open in a new tab. Resume opens my CV as a PDF.",
    placement: "bottom",
  },
  {
    path: "/",
    selector: '[data-tour="controls"]',
    title: "Sound and theme",
    text: "Click sounds are on by default. The speaker switches them off, and the other button switches between light and dark.",
    placement: "bottom",
  },
  {
    path: "/",
    selector: 'section[aria-label="People viewing now"]',
    minWidth: 768,
    title: "Who's here",
    text: "People on the site right now. Sign in with Google to show your photo.",
    placement: "right",
  },
  {
    path: "/",
    selector: '[data-tour="hero-actions"]',
    title: "Actions",
    text: "View work opens my projects, and Let's Talk opens the contact form. Like adds a like to the site, once a day.",
    placement: "bottom",
  },

  // About
  {
    path: "/about",
    selector: '[data-tour="about-bio"]',
    title: "About me",
    text: "Who I am, what I build, my years as a Dev Assistant, and my studies.",
    placement: "bottom",
  },
  {
    path: "/about",
    selector: '[data-tour="about-education"]',
    title: "Education",
    text: "My schools, and the honors from each.",
    placement: "left",
  },
  {
    path: "/about",
    selector: '[data-tour="stack-first"]',
    title: "Stack",
    text: "Each tool lists the projects that used it, and each project name opens its case study.",
    placement: "right",
  },
  {
    path: "/about",
    selector: '[data-tour="about-github"]',
    title: "GitHub activity",
    text: "My public GitHub contributions over the past year.",
    placement: "top",
  },

  // Work, and one case study
  {
    path: "/projects",
    selector: 'ol > li:first-child [data-tour="work-info"]',
    title: "Projects",
    text: "Each project shows what it is, its status and the tools it uses, with links to its case study and, where available, the live site and code.",
    placement: "bottom",
  },
  {
    path: "/projects",
    selector: 'ol > li:first-child [data-tour="work-preview"]',
    title: "Previews",
    text: "Switch between Desktop, Tablet and Mobile views of the same project. On a computer, clicking a device opens its screenshots full-size.",
    placement: "left",
  },
  {
    path: CASE_STUDY,
    selector: '[data-section="At a glance"]',
    title: "Case study: at a glance",
    text: "The project's type, client, status and the tools it was built with.",
    placement: "bottom",
  },
  {
    path: CASE_STUDY,
    selector: '[data-section="What I built"]',
    title: "Case study: what I built",
    text: "What the project does, as a short list.",
    placement: "bottom",
  },
  {
    path: CASE_STUDY,
    selector: '[data-section="Technical decisions"]',
    title: "Case study: technical decisions",
    text: "The choices behind how it works, each explained briefly.",
    placement: "top",
  },

  // Experience
  {
    path: "/experience",
    selector: '[data-tour="experience-list"]',
    title: "Work history",
    text: "My roles, newest first, with what I did in each.",
    placement: "bottom",
  },
  {
    path: "/experience",
    selector: '[data-tour="workshops"]',
    title: "Workshops and events",
    text: "Workshops, hackathons and events I've attended, with dates.",
    placement: "top",
  },

  // Contact
  {
    path: "/contact",
    selector: '[data-tour="contact-form"]',
    title: "Contact form",
    text: "Send me a message about a project or a role. Name, email and message are required.",
    placement: "bottom",
  },
  {
    path: "/contact",
    selector: '[data-tour="contact-links"]',
    title: "Direct links",
    text: "LinkedIn, Gmail and GitHub. Hover an icon to see its handle.",
    placement: "right",
  },

  // Guestbook
  {
    path: "/guestbook",
    selector: '[data-tour="guestbook-composer"]',
    title: "Sign the guestbook",
    text: "Sign in with Google to leave a note of up to 140 characters. Each person has one note, and you can replace or delete it.",
    placement: "right",
  },
  {
    path: "/guestbook",
    selector: '[data-tour="guestbook-notes"] > li:first-child, [data-tour="guestbook-empty"]',
    title: "Notes",
    text: "Notes from other visitors, newest first. New ones appear live.",
    placement: "right",
    next: "Done",
  },
];
