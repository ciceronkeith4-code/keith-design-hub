export type TourSide = "top" | "right" | "bottom" | "left";

export type TourStep = {
  /** What to highlight. Several matches are highlighted together as one box. */
  selector: string;
  title: string;
  text: string;
  /** Which side of the highlight the bubble prefers; it moves to another side when this one has no room. */
  placement: TourSide;
  /** Label for the Next button on the last step. */
  next?: string;
};

/**
 * Every step points at something on the page. A step whose element isn't on screen is skipped, so a page or
 * a phone that lacks it (the viewer list is desktop-only, the like button and guestbook link live on Home)
 * simply gets a shorter tour.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    selector: 'nav[aria-label="Main"] > a',
    title: "Menu",
    text: "Home, About, Work, Experience and Contact. Work has a case study for each project.",
    placement: "right",
  },
  {
    selector: '[data-tour="controls"]',
    title: "Sound and theme",
    text: "Click sounds are on by default. The speaker switches them off, and the other button switches the theme.",
    placement: "bottom",
  },
  {
    selector: 'section[aria-label="People viewing now"]',
    title: "Who's here",
    text: "People on the site right now. Sign in with Google to show your photo.",
    placement: "right",
  },
  {
    selector: '[data-tour="like"]',
    title: "Like",
    text: "You can like the site once a day.",
    placement: "bottom",
  },
  {
    selector: 'a[href="/guestbook"]',
    title: "Guestbook",
    text: "Leave a note. You sign in with Google, and it shows up for everyone right away.",
    placement: "top",
    next: "Done",
  },
];
