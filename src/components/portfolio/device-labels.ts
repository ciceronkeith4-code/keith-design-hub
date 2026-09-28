import type { Device, Project } from "@/lib/projects";

export const DEVICE_NOUN: Record<Device, string> = {
  desktop: "laptop",
  tablet: "tablet",
  mobile: "phone",
};

/** "NCLEX Amplified Interns" from "NCLEX Amplified Interns – Internship Landing Page". */
export const siteName = (project: Project) => project.title.split(" – ")[0];

/** e.g. "Iconic Cards PH on a tablet". */
export const screenAlt = (project: Project, device: Device) =>
  `${siteName(project)} on a ${DEVICE_NOUN[device]}`;
