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
    <div className="portrait-stage relative flex h-[360px] w-full items-center justify-center overflow-visible sm:h-[430px]">
      <div className="relative h-[260px] w-[200px] [perspective:1000px] sm:h-[325px] sm:w-[250px]">
        <div className="portrait-orbit relative h-full w-full [transform-style:preserve-3d]">
          {photos.map((photo, index) => (
            <div
              key={photo}
              className="absolute inset-0 overflow-hidden rounded-[1.65rem] bg-neutral-900 shadow-[0_22px_55px_rgba(0,0,0,.38)] [backface-visibility:visible]"
              style={{ transform: `rotateY(${index * (360 / photos.length)}deg) translateZ(clamp(150px, 22vw, 250px))`, transformStyle: "preserve-3d" }}
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
    <section id="about" className="full-page-slide stacked-panel panel-dark z-20 px-4 py-28 sm:py-36 md:py-44">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 overflow-hidden whitespace-nowrap opacity-[0.018]">
        <div className="marquee-track flex min-w-max"><span className="font-display pr-20 text-[18vw] uppercase leading-none">Keith Czimonne Anderson Ciceron</span><span className="font-display pr-20 text-[18vw] uppercase leading-none">Keith Czimonne Anderson Ciceron</span></div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <Reveal className="relative flex min-h-[360px] items-center justify-center overflow-visible sm:min-h-[430px]"><PortraitOrbit /></Reveal>

        <Reveal delay={0.12}>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#EB5E28]">About Me</span>
          <h2 className="font-display mt-5 text-4xl uppercase leading-[0.92] tracking-tight text-white sm:text-5xl lg:text-6xl">High-fidelity development for <span className="text-[#EB5E28]">modern web experiences.</span></h2>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-300 sm:text-base">
            <p>Passionate about software development and modern web technologies, I specialize in designing and building scalable digital solutions that solve real-world problems. My expertise spans both front-end and back-end development, with a strong focus on creating intuitive user experiences backed by reliable, high-performance systems.</p>
            <p>My development philosophy centers on clean architecture, maintainable code, and thoughtful user interface design. I believe that exceptional software is built by combining technical excellence with user-centered design, bridging the gap between visually engaging interfaces and robust, efficient application logic.</p>
          </div>
          <div className="mt-10 grid gap-6 border-t border-white/10 pt-10 sm:grid-cols-2"><div><h3 className="font-display text-sm uppercase tracking-wide text-neutral-100">Education & honors</h3><p className="mt-2 text-xs font-medium leading-relaxed text-neutral-400">BS Information Technology<br />San Sebastian College – Recoletos Manila<br />Consistent Academic Dean's Lister</p></div><div><h3 className="font-display text-sm uppercase tracking-wide text-neutral-100">Core specializations</h3><p className="mt-2 text-xs font-medium leading-relaxed text-neutral-400">Software Dev & Web Dev<br />System Design & Desktop Logic<br />UI/UX Prototyping in Figma</p></div></div>
        </Reveal>
      </div>
    </section>
  );
}

