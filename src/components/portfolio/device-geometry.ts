import { DEVICES, type Device, type Project } from "@/lib/projects";

/**
 * True sizes of the CSS device mockups, in CSS pixels at scale 1. Every device is drawn at this
 * size and scaled as a whole, so bezels, radii, and cameras stay in proportion.
 */

export const RIM = 2; // aluminum edge

/** A screen `width` wide at the aspect ratio of that device's captures. */
const screenOf = (device: Device, width: number) => ({
  w: width,
  h: Math.round((width * DEVICES[device].height) / DEVICES[device].width),
});

const laptopScreen = screenOf("desktop", 640);
const laptopBezel = { x: 10, top: 14, bottom: 18 };
const laptopLid = {
  w: laptopScreen.w + (laptopBezel.x + RIM) * 2,
  h: laptopScreen.h + laptopBezel.top + laptopBezel.bottom + RIM * 2,
};
const laptopDeck = { h: 44, inset: 40 };
const laptopLip = 8;

export const LAPTOP = {
  screen: laptopScreen,
  bezel: laptopBezel,
  lid: laptopLid,
  deck: laptopDeck,
  lip: laptopLip,
  w: laptopLid.w + laptopDeck.inset * 2,
  h: laptopLid.h + laptopDeck.h + laptopLip,
};

const tabletScreen = screenOf("tablet", 600);
const tabletBezel = 14;
export const TABLET = {
  screen: tabletScreen,
  bezel: tabletBezel,
  w: tabletScreen.w + (tabletBezel + RIM) * 2,
  h: tabletScreen.h + (tabletBezel + RIM) * 2,
};

const phoneScreen = screenOf("mobile", 200);
const phoneBezel = 8;
export const PHONE = {
  screen: phoneScreen,
  bezel: phoneBezel,
  w: phoneScreen.w + (phoneBezel + RIM) * 2,
  h: phoneScreen.h + (phoneBezel + RIM) * 2,
};

export const DEVICE_NOUN: Record<Device, string> = {
  desktop: "laptop",
  tablet: "tablet",
  mobile: "phone",
};

/** "NCLEX Amplified Interns" from "NCLEX Amplified Interns – Internship Landing Page". */
export const siteName = (project: Project) => project.title.split(" – ")[0];

export const screenAlt = (project: Project, device: Device) =>
  `${siteName(project)} on a ${DEVICE_NOUN[device]}`;
