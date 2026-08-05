import { motion, AnimatePresence } from "framer-motion";
import { Expand } from "lucide-react";
import { useMemo, useState } from "react";
import { GALLERY_PHOTOS, OJT_PHOTOS, PROJECTS } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";
import { Lightbox, type LightboxImage } from "./Lightbox";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "photos", label: "My Photos" },
  { id: "ojt", label: "OJT Photos" },
  { id: "projects", label: "Project Screenshots" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Gallery() {
  const [tab, setTab] = useState<TabId>("photos");
  const [index, setIndex] = useState<number | null>(null);

  const images: LightboxImage[] = useMemo(() => {
    if (tab === "photos") return GALLERY_PHOTOS;
    if (tab === "ojt") return OJT_PHOTOS;
    return PROJECTS.flatMap((p) =>
      p.shots.map((s) => ({ src: s, caption: p.title })),
    );
  }, [tab]);

  return (
    <section id="gallery" className="relative px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Gallery"
          title="A Closer Look"
          subtitle="Photos, internship moments, and project screens — click any image to expand."
        />

        {/* tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setIndex(null);
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-foreground/30 bg-foreground text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {images.map((photo, i) => (
              <button
                key={photo.src + i}
                onClick={() => setIndex(i)}
                className="group hover-lift relative overflow-hidden rounded-2xl border border-border glass-card hover:border-foreground/25"
                aria-label={`Open image: ${photo.caption ?? "Gallery image"}`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.caption ?? "Gallery image"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-background/85 via-background/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <Expand className="h-3.5 w-3.5" />
                    {photo.caption}
                  </span>
                </span>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <Lightbox
        images={images}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </section>
  );
}
