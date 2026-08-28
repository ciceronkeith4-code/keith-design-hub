import { Reveal } from "./Reveal";

const photos = [
  "/images/profile/keith-white-shirt.jpg",
  "/images/profile/keith-brown-shirt.jpg",
  "/images/profile/keith3.jpeg",
  "/images/profile/keith4.jpeg",
  "/images/profile/keith5.jpeg",
];

function PortraitOrbit() {
  return (
    <div className="portrait-stage relative flex h-[310px] w-full items-center justify-center overflow-visible sm:h-[430px]">
      <div className="relative h-[220px] w-[165px] [perspective:1000px] sm:h-[325px] sm:w-[250px]">
        <div className="portrait-orbit relative h-full w-full [transform-style:preserve-3d]">
          {photos.map((photo, index) => (
            <div
              key={photo}
              className="absolute inset-0 overflow-hidden rounded-[1.35rem] sm:rounded-[1.65rem] bg-neutral-900 shadow-[0_22px_55px_rgba(0,0,0,.38)] [backface-visibility:visible]"
              style={{ transform: `rotateY(${index * (360 / photos.length)}deg) translateZ(clamp(110px, 20vw, 250px))`, transformStyle: "preserve-3d" }}
            >
              <img src={photo} alt={`Keith portrait ${index + 1}`} draggable="false" className="h-full w-full select-none object-cover grayscale contrast-[1.1] brightness-[0.9] transition duration-500 hover:grayscale-0 hover:brightness-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="full-page-slide stacked-panel panel-dark z-20 overflow-hidden px-4 py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 overflow-hidden whitespace-nowrap opacity-[0.018]">
        <div className="marquee-track flex min-w-max"><span className="font-display pr-20 text-[18vw] uppercase leading-none">Keith Czimonne Anderson Ciceron</span><span className="font-display pr-20 text-[18vw] uppercase leading-none">Keith Czimonne Anderson Ciceron</span></div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal className="relative flex min-h-[290px] items-center justify-center overflow-hidden sm:min-h-[400px]"><PortraitOrbit /></Reveal>

        <Reveal delay={0.12}>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#E25822]">About Me</span>
          <h2 className="font-display mt-4 text-3xl uppercase leading-[0.92] tracking-tight text-[#F8F1E7] sm:text-4xl lg:text-5xl">Building clean, <span className="text-[#E25822]">modern web experiences.</span></h2>
          <div className="mt-6 text-sm leading-relaxed text-[#D8D0C5] sm:text-base">
            <p>I am a full-stack web developer specializing in building end-to-end web applications—from crafting intuitive, responsive user interfaces to engineering reliable backend APIs and database architectures.</p>
          </div>
          <div className="mt-8 border-t border-white/10 pt-8">
            <div>
              <h3 className="font-display text-sm uppercase tracking-wide text-neutral-100">Core Specializations</h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-neutral-400">Full Stack Development • System Design • UI/UX Prototyping</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

