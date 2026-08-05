import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/portfolio-data";
import { getLenis } from "./SmoothScroll";

export function useScrollSpy() {
  const [active, setActive] = useState<string>("home");

  useEffect(() => {
    const ids = NAV_ITEMS.map((n) => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (visible[0]) {
          const next = visible[0].target.id;
          setActive((current) => (current === next ? current : next));
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.2, 0.5, 1] },
    );

    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}

export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(element, { duration: 1.05, lock: false });
    return;
  }

  element.scrollIntoView({ behavior: "auto", block: "start" });
}
