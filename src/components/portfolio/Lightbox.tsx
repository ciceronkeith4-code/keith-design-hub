import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface LightboxImage {
  src: string;
  caption?: string;
  /** Defaults to the caption. */
  alt?: string;
  /** Display size in CSS pixels. Images taller than the screen (full-page captures) scroll. */
  width?: number;
  height?: number;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  /** Accessible name for the dialog. */
  label?: string;
}

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const pad = (n: number) => String(n).padStart(2, "0");

const CONTROL =
  "rounded-[2px] border border-white/15 bg-[#141414] text-white hover:bg-white hover:text-[#141414] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
  label = "Image viewer",
}: LightboxProps) {
  const open = index !== null;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Portals need document.body, which only exists after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const next = useCallback(() => {
    if (index === null) return;
    onIndexChange((index + 1) % images.length);
  }, [index, images.length, onIndexChange]);

  const prev = useCallback(() => {
    if (index === null) return;
    onIndexChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onIndexChange]);

  // Esc closes, arrows cycle, and Tab stays inside the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Tab" && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        const outside = !dialogRef.current.contains(active);
        if (e.shiftKey && (active === first || outside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || outside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, next, prev, onClose]);

  // Focus moves into the dialog on open and back to whatever opened it on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus();
  }, [open]);

  if (!mounted) return null;

  const image = open ? images[index] : null;

  return createPortal(
    <AnimatePresence>
      {image && index !== null && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[90] flex flex-col bg-[#0B0B0B]/90 p-4 sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <div className="flex shrink-0 items-center justify-between gap-4">
            <span className="font-mono text-xs text-[#B5B5B5]">
              {pad(index + 1)} / {pad(images.length)}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close viewer"
              className={`p-2 ${CONTROL}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Previous image"
                  className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 p-2.5 ${CONTROL}`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Next image"
                  className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 p-2.5 ${CONTROL}`}
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
              className="flex max-h-full min-h-0 w-full min-w-0 max-w-5xl flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Scrolls when the image is taller than the screen; focusable so arrow/page keys work. */}
              <div
                tabIndex={0}
                className="screen-scrollbar min-h-0 w-fit max-w-full overflow-y-auto overscroll-contain rounded-[4px] border border-white/15 bg-[#141414] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <img
                  src={image.src}
                  alt={image.alt ?? image.caption ?? "Gallery image"}
                  width={image.width}
                  height={image.height}
                  className="block h-auto max-w-full"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
              {image.caption && (
                <figcaption className="mt-3 shrink-0 text-center font-mono text-xs text-[#B5B5B5]">
                  {image.caption}
                </figcaption>
              )}
            </motion.figure>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
