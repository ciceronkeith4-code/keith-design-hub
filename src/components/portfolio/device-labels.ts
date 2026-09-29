import type { Device, Project } from "@/data/projects";

export const DEVICE_NOUN: Record<Device, string> = {
  desktop: "laptop",
  tablet: "tablet",
  mobile: "phone",
};

/** e.g. "Iconic Cards PH home page on a tablet". */
export const screenAlt = (project: Project, device: Device) =>
  `${project.name} home page on a ${DEVICE_NOUN[device]}`;

/** e.g. "Tablet at 1194 × 834". */
export const viewportCaption = (spec: { label: string; width: number; height: number }) =>
  `${spec.label} at ${spec.width} × ${spec.height}`;
