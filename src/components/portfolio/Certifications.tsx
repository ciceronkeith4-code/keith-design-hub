import { useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { CERTIFICATIONS } from "@/lib/portfolio-data";
import { Lightbox, type LightboxImage } from "./Lightbox";

type Certificate = (typeof CERTIFICATIONS)[number];

const MUTED = "text-[#62655E] dark:text-[#A3A3A3]";
const SUBHEAD = "font-sans text-sm font-semibold text-[#161616] dark:text-[#EDEDED]";
const LINK =
  "underline decoration-[#C9CCC4] dark:decoration-[#3A3A3A] underline-offset-2 hover:text-[#161616] dark:hover:text-[#EDEDED] hover:decoration-current";
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3F4A3A] dark:focus-visible:outline-[#B4C0A4]";

// Each print leans a little, as if pinned up by hand, and straightens when pointed at.
const TILT = [-1.6, 1.2, 1.3, -1.1, -1.2, 1.5];

// The site a verify link confirms the certificate on, named in the link's label.
const VERIFIERS: [RegExp, string][] = [
  [/(^|\.)credly\.com$/, "Credly"],
  [/(^|\.)simplilearn\.com$|^simpli-web\.app\.link$/, "Simplilearn"],
  [/(^|\.)educourse\.co\.za$/, "EduCourse"],
];
const verifyLabel = (url: string) => {
  const host = new URL(url).hostname;
  const site = VERIFIERS.find(([pattern]) => pattern.test(host))?.[1];
  return site ? `Verify on ${site}` : "Verify";
};

/** Fields in the order they first appear, so the newest certificate's field comes first. */
const GROUPS = CERTIFICATIONS.reduce<{ field: string; certs: Certificate[] }[]>((groups, cert) => {
  const group = groups.find((g) => g.field === cert.field);
  if (group) group.certs.push(cert);
  else groups.push({ field: cert.field, certs: [cert] });
  return groups;
}, []);

// The viewer steps through the prints in the order they appear on the page.
const ON_PAGE = GROUPS.flatMap((g) => g.certs);
const IMAGES: LightboxImage[] = ON_PAGE.map((cert) => ({
  src: cert.image.src,
  alt: `${cert.title}, ${cert.kind.toLowerCase()} from ${cert.issuer}`,
  caption: `${cert.title} · ${cert.kind} · ${cert.issuer} · ${cert.date}`,
}));

function Print({ cert, onOpen }: { cert: Certificate; onOpen: () => void }) {
  const at = ON_PAGE.indexOf(cert);
  // A portrait certificate is drawn narrower, so it stands about as tall as the landscape prints beside it.
  const portrait = cert.image.height > cert.image.width;
  return (
    <figure className="flex flex-col">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Enlarge: ${IMAGES[at].alt}`}
        style={{ "--tilt": `${TILT[at % TILT.length]}deg` } as CSSProperties}
        className={`block ${portrait ? "w-[56%]" : "w-full"} cursor-zoom-in rounded-[3px] bg-white p-1.5 sm:p-2 ring-1 ring-black/[0.06] dark:bg-[#1E1E1E] dark:ring-white/[0.08] rotate-(--tilt) shadow-[0_1px_2px_rgba(22,22,22,0.08),0_12px_24px_-14px_rgba(22,22,22,0.4)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_24px_-12px_rgba(0,0,0,0.8)] transition-[rotate,translate,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-0 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(22,22,22,0.08),0_24px_40px_-18px_rgba(22,22,22,0.45)] dark:hover:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_24px_40px_-16px_rgba(0,0,0,0.9)] focus-visible:rotate-0 focus-visible:-translate-y-1 motion-reduce:transition-none ${FOCUS}`}
      >
        <img
          src={cert.image.src}
          alt={IMAGES[at].alt}
          width={cert.image.width}
          height={cert.image.height}
          loading="lazy"
          style={{ aspectRatio: `${cert.image.width} / ${cert.image.height}` }}
          className="block h-auto w-full object-cover"
        />
      </button>

      <figcaption className="mt-5">
        <span className="block text-sm font-medium text-[#161616] dark:text-[#EDEDED]">
          {cert.title}
        </span>
        <span className={`mt-0.5 block text-xs ${MUTED}`}>
          {cert.issuerShort} · <span className="font-mono whitespace-nowrap">{cert.date}</span>
        </span>
        {cert.verify && (
          <a
            href={cert.verify}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 inline-flex items-center gap-1 text-xs ${MUTED} ${LINK}`}
          >
            {verifyLabel(cert.verify)}
            <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
          </a>
        )}
      </figcaption>
    </figure>
  );
}

/**
 * Certificates as prints, grouped by field: the field on the left, its prints beside it. Clicking a
 * print opens it full-size; the viewer's arrows step through every print in page order.
 */
export function Certifications() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="w-full flex flex-col text-left">
        <h1 className="mb-6 sm:mb-8 font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
          Certifications
        </h1>

        {GROUPS.map((group, g) => (
          <section
            key={group.field}
            aria-labelledby={`field-${g}`}
            className="grid grid-cols-1 xl:grid-cols-[11rem_minmax(0,1fr)] gap-x-10 gap-y-6 border-t border-[#E5E5E0] dark:border-[#262626] pt-6 pb-12 sm:pb-14"
          >
            <h2 id={`field-${g}`} className={SUBHEAD}>
              {group.field}
            </h2>
            <ul
              data-tour={g === 0 ? "certifications-list" : undefined}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12 px-1 xl:pt-2"
            >
              {group.certs.map((cert) => (
                <li key={cert.image.src}>
                  <Print cert={cert} onOpen={() => setLightboxIndex(ON_PAGE.indexOf(cert))} />
                </li>
              ))}
            </ul>
          </section>
        ))}
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
