import { motion } from "framer-motion";
import { SKILLS } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const leftGroups = ["Frontend", "Design", "Backend"];
const rightGroups = ["Tools & DevOps", "Database", "Additional Skills"];
const coreOrbitSkills = SKILLS.filter((skill) => skill.group !== "AI Tools").slice(0, 12);
const aiOrbitSkills = SKILLS.filter((skill) => skill.group === "AI Tools");

type Skill = (typeof SKILLS)[number];

export function Skills() {
  return (
    <section id="skills" className="stacked-panel panel-light z-30 px-4 py-24 sm:py-32 md:py-40">
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[38rem] w-[38rem] rounded-full bg-[#EB5E28]/[0.035] blur-[110px]" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Tech Stack"
          title={
            <>
              Tools I <span className="text-[#EB5E28]">build with</span>
            </>
          }
          subtitle="Core development tools, with a focused set of AI tools I am currently exploring."
        />

        <div className="mt-16 grid items-center gap-x-12 gap-y-10 lg:grid-cols-[1fr_1.35fr_1fr]">
          <div className="order-2 space-y-8 lg:order-1">
            {leftGroups.map((group, index) => (
              <SkillGroup key={group} group={group} delay={index * 0.08} />
            ))}
          </div>

          <Reveal className="order-1 flex items-center justify-center lg:order-2">
            <SkillOrbit />
          </Reveal>

          <div className="order-3 space-y-8">
            {rightGroups.map((group, index) => (
              <SkillGroup key={group} group={group} delay={index * 0.08 + 0.1} />
            ))}
          </div>
        </div>
        <AiExploringRow />
      </div>
    </section>
  );
}

function AiExploringRow() {
  return (
    <Reveal delay={0.34} className="mx-auto mt-12 w-full max-w-6xl">
      <div className="rounded-2xl border border-neutral-200 bg-white/70 p-4 shadow-[0_16px_30px_-28px_rgba(37,36,34,0.22)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EB5E28]" />
          <h3 className="font-display text-sm uppercase tracking-wide text-neutral-800">AI Tools</h3>
          <span className="rounded-full border border-neutral-200 bg-[#FFFCF2] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Currently exploring
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
          {aiOrbitSkills.map((skill) => (
            <motion.div
              key={skill.name}
              whileHover={{ y: -2 }}
              className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm"
            >
              <skill.icon className="h-4 w-4 shrink-0" style={{ color: skill.color }} />
              <span className="truncate">{skill.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function SkillOrbit() {
  return (
    <div className="relative flex h-[min(350px,90vw)] w-[min(350px,90vw)] max-w-full items-center justify-center sm:h-[520px] sm:w-[520px]" data-cursor>
      <div className="pointer-events-none absolute inset-[8%] rounded-full border border-[#EB5E28]/15" />
      <div className="pointer-events-none absolute h-[69%] w-[69%] rounded-full border border-[#EB5E28]/14 [transform:rotateX(66deg)_rotateZ(28deg)]" />
      <div className="pointer-events-none absolute h-[57%] w-[57%] rounded-full border border-neutral-300/60 [transform:rotateY(66deg)_rotateZ(-28deg)]" />
      <div className="pointer-events-none absolute h-[42%] w-[42%] rounded-full border border-neutral-200" />
      <div className="pointer-events-none absolute inset-[19%] rounded-full bg-[radial-gradient(circle,rgba(235,94,40,0.045),transparent_66%)]" />

      <OrbitRing skills={coreOrbitSkills} radiusX={41} radiusY={33} duration={62} />
      <OrbitRing skills={aiOrbitSkills} radiusX={29} radiusY={23} duration={44} reverse ai />

      <div className="relative z-20 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-neutral-200 bg-white text-center shadow-[0_22px_40px_-24px_rgba(37,36,34,0.48)] sm:h-36 sm:w-36">
        <span className="font-display text-2xl uppercase tracking-tight text-[#252422] sm:text-3xl">Build</span>
        <span className="mt-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-[#EB5E28] sm:text-[8px]">
          Explore · Refine
        </span>
        <span className="mt-1 font-mono text-[6px] font-bold uppercase tracking-[0.18em] text-[#EB5E28]">
          Core + AI
        </span>
      </div>
    </div>
  );
}

function OrbitRing({
  skills,
  radiusX,
  radiusY,
  duration,
  reverse = false,
  ai = false,
}: {
  skills: Skill[];
  radiusX: number;
  radiusY: number;
  duration: number;
  reverse?: boolean;
  ai?: boolean;
}) {
  return (
    <motion.div
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, ease: "linear", repeat: Infinity }}
      className="absolute inset-0 will-change-transform"
    >
      {skills.map((skill, index) => {
        const angle = (index / skills.length) * Math.PI * 2 - Math.PI / 2;
        const left = 50 + Math.cos(angle) * radiusX;
        const top = 50 + Math.sin(angle) * radiusY;

        return (
          <motion.div
            key={skill.name}
            style={{ left: left + "%", top: top + "%" }}
            whileHover={{ scale: 1.16, zIndex: 30 }}
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{ rotate: reverse ? 360 : -360 }}
              transition={{ duration, ease: "linear", repeat: Infinity }}
              className={ai ? "relative flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-[0_12px_24px_-18px_rgba(37,36,34,0.42)] sm:h-12 sm:w-12" : "relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E7E1D7] bg-[#FFFCF2]/95 shadow-[0_12px_24px_-18px_rgba(37,36,34,0.56)] sm:h-14 sm:w-14"}
            >
              <skill.icon className={ai ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5 sm:h-7 sm:w-7"} style={{ color: skill.color }} />
              {ai && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-white bg-[#EB5E28]" />}
              <span className="pointer-events-none absolute -bottom-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-[#252422] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.08em] text-white shadow-lg group-hover:block">
                {skill.name}
              </span>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function SkillGroup({ group, delay }: { group: string; delay: number }) {
  const items = SKILLS.filter((skill) => skill.group === group);

  return (
    <Reveal delay={delay}>
      <div>
        <div className="mb-3 flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EB5E28]" />
          <h3 className="font-display text-sm uppercase tracking-wide text-neutral-800">{group}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {items.map((skill) => (
            <motion.div
              key={skill.name}
              whileHover={{ x: 4 }}
              className="flex items-center gap-2 rounded-xl border border-neutral-200/50 bg-white/55 px-3 py-2 text-xs font-semibold text-neutral-600 shadow-sm"
            >
              <skill.icon className="h-4 w-4 shrink-0" style={{ color: skill.color }} />
              <span className="truncate">{skill.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}


