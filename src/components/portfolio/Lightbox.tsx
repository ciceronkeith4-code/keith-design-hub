import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect } from "react";

export interface LightboxImage {
  src: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}

export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const open = index !== null;

  const next = useCallback(() => {
    if (index === null) return;
    onIndexChange((index + 1) % images.length);
  }, [index, images.length, onIndexChange]);

  const prev = useCallback(() => {
    if (index === null) return;
    onIndexChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, next, prev, onClose]);

  return (
    <AnimatePresence>
      {open && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          {/* Top Bar / Close */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
            <span className="font-mono text-xs text-[#A0A0A0] bg-[#1C1C1C] border border-[#2E2E2E] rounded-full px-3 py-1 pointer-events-auto">
              {index + 1} of {images.length}
            </span>
            <button
              onClick={onClose}
              aria-label="Close viewer"
              className="rounded-full border border-[#2E2E2E] bg-[#1C1C1C] p-2 text-white hover:bg-white hover:text-[#161616] transition-colors pointer-events-auto cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-[#2E2E2E] bg-[#1C1C1C] p-2.5 text-white hover:bg-white hover:text-[#161616] transition-colors z-10 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-[#2E2E2E] bg-[#1C1C1C] p-2.5 text-white hover:bg-white hover:text-[#161616] transition-colors z-10 cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <motion.figure
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="relative max-h-[85vh] max-w-5xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[index].src}
              alt={images[index].caption ?? "Gallery image"}
              className="max-h-[75vh] w-auto rounded-[16px] border border-[#2E2E2E] object-contain shadow-none"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            {images[index].caption && (
              <figcaption className="mt-3 text-center font-mono text-xs text-neutral-400">
                {images[index].caption}
              </figcaption>
            )}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
