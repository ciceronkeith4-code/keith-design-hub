import { useState } from "react";
import { CERTIFICATIONS } from "@/lib/portfolio-data";
import { Lightbox, type LightboxImage } from "./Lightbox";

const MUTED = "text-[#62655E] dark:text-[#A3A3A3]";

const IMAGES: LightboxImage[] = CERTIFICATIONS.map((cert) => ({
  src: cert.image.src,
  alt: `${cert.title}, ${cert.kind.toLowerCase()} from ${cert.issuer}`,
  caption: `${cert.title} · ${cert.issuer} · ${cert.date}`,
}));

export function Certifications() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="w-full flex flex-col text-left">
        <h1 className="mb-6 sm:mb-8 font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
          Certifications
        </h1>

        <ul
          data-tour="certifications-list"
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10"
        >
          {CERTIFICATIONS.map((cert, i) => (
            <li key={cert.code} className="flex flex-col">
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={`Enlarge: ${IMAGES[i].alt}`}
                className="w-full overflow-hidden rounded-[4px] border border-[#E3E5E0] dark:border-[#262626] bg-[#E1E4DD] dark:bg-[#1A1A1A] cursor-zoom-in"
              >
                <img
                  src={cert.image.src}
                  alt={IMAGES[i].alt}
                  width={cert.image.width}
                  height={cert.image.height}
                  className="block aspect-[1122/789] h-auto w-full object-cover"
                />
              </button>

              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h2 className="font-sans text-base font-semibold text-[#161616] dark:text-[#EDEDED]">
                  {cert.title}
                </h2>
                <span className={`font-mono text-xs ${MUTED} shrink-0`}>{cert.date}</span>
              </div>
              <p className={`mt-0.5 text-sm ${MUTED}`}>
                {cert.kind}, {cert.issuer}
              </p>

              <p className="mt-3 text-xs sm:text-[13px] leading-relaxed text-[#4A4D47] dark:text-[#CCCCCC]">
                {cert.detail}.{cert.topics.length > 0 && <> Topics: {cert.topics.join(", ")}.</>}
              </p>
              <p className={`mt-2 text-xs ${MUTED}`}>
                Certificate code <span className="font-mono">{cert.code}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      <Lightbox
        images={IMAGES}
        index={lightboxIndex}
        label="Certificates"
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
