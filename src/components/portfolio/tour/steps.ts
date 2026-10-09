export type TourPlacement = "top" | "right" | "bottom" | "left";

export type TourStep = {
  /** The element to show; omitted for a stop in the open. Steps whose element isn't on screen are skipped. */
  selector?: string;
  title: string;
  text: string;
  /** Which side of the element the hero goes to (phones always go above, with the bubble below). */
  placement: TourPlacement;
  /** Label for the Next button. */
  next?: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome!",
    text: "Hi, I'm Keith's guide. Want a quick tour of the site?",
    placement: "top",
    next: "Show me around",
  },
  {
    selector: 'main a[href="/projects"]',
    title: "My work",
    text: "Real projects I've built, each with its own case study.",
    placement: "right",
  },
  {
    selector: 'nav a[href="/about"]',
    title: "About me",
    text: "My story, my school, and the tools I use.",
    placement: "right",
  },
  {
    selector: 'nav a[href="/experience"]',
    title: "Experience",
    text: "Where I've worked and what I did there.",
    placement: "right",
  },
  {
    selector: 'nav a[href="/contact"]',
    title: "Say hi",
    text: "Want to work together? You can message me here.",
    placement: "right",
  },
  {
    selector: '[data-tour="controls"]',
    title: "Sounds and dark mode",
    text: "Turn the click sounds on or off, or switch to dark mode.",
    placement: "bottom",
  },
  {
    selector: 'section[aria-label="People viewing now"]',
    title: "Who's here",
    text: "See who else is visiting right now.",
    placement: "right",
  },
  {
    selector: '[data-tour="tour-again"]',
    title: "Tour again",
    text: "Tap this any time to watch the tour again.",
    placement: "left",
  },
  {
    title: "Enjoy!",
    text: "That's the tour. Have fun looking around!",
    placement: "top",
    next: "Finish",
  },
];
