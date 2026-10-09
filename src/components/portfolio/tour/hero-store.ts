/**
 * Shared, mutable state of the tour hero. The tour (DOM side) tweens these values with GSAP; the 3D canvas
 * reads them every frame. A plain object rather than React state, so 60 fps motion never re-renders React.
 * Positions are in screen px (CSS pixels from the top-left of the viewport).
 */
export const HERO_ACTIONS = [
  "Idle",
  "Climbing",
  "Jumping",
  "FallingIdle",
  "HangingIdle",
  "Pointing",
  "Waving",
] as const;
export type HeroAction = (typeof HERO_ACTIONS)[number];

export const hero = {
  /** His feet. */
  x: -80,
  y: 0,
  /** Height in px: smaller on phones. */
  height: 96,
  /** 1 faces right, -1 faces left. */
  facing: 1 as 1 | -1,
  action: "Idle" as HeroAction,
  /** Pointing elevation in radians (0 straight ahead, positive up). */
  aim: 0,
  /** Holding the cable while at rest (keeps one arm up). */
  hanging: false,
  /** The cable from his wrist to an anchor; `grow` runs 0 to 1 while it shoots out. */
  cable: { on: false, ax: 0, ay: 0, grow: 1 },
};

/** Roughly where his hand is when he hangs (feet minus this share of his height). */
export const HAND_RISE = 1.05;
