import { motion } from "framer-motion";
import { Code2, Server, Database, GitBranch, Palette, ShieldCheck } from "lucide-react";
import { SKILLS } from "@/lib/portfolio-data";
import { SectionHeading } from "./SectionHeading";
import { Stagger, staggerItem } from "./Reveal";

const CORE_CATEGORIES = [
  {
    id: "frontend",
    title: "Front-end Development",
    icon: Code2,
    skills: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Tailwind CSS"],
  },
  {
    id: "backend",
    title: "Back-end Development",
    icon: Server,
    skills: ["Node.js", "REST API", "Server Logic"],
  },
  {
    id: "database",
    title: "Database Management",
    icon: Database,
    skills: ["MySQL", "Supabase", "Firebase"],
  },
  {
    id: "version-control",
    title: "Version Control & Tools",
    icon: GitBranch,
    skills: ["Git", "GitHub", "Vercel", "VS Code"],
  },
  {
    id: "uiux",
    title: "UI/UX & Design",
    icon: Palette,
    skills: ["Figma", "Photoshop", "UI/UX Design"],
  },
  {
    id: "qa-testing",
    title: "QA & Bug Testing",
    icon: ShieldCheck,
    skills: ["QA Testing", "Debugging"],
  },
];

export function Skills() {
  return (
    <section id="skills" className="stacked-panel panel-light z-30 px-4 py-12 sm:py-16">
      <div className="relative z-10 mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="My Skills"
          title={
            <>
              Technology <span className="text-[#E25822]">Stack</span>
            </>
          }
        />

        {/* Minimal Category Grid — No Boxes, Logos Only */}
        <Stagger className="mt-12 grid gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {CORE_CATEGORIES.map((cat) => {
            const CategoryIcon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                variants={staggerItem}
                className="flex flex-col items-center text-center"
              >
                {/* Category Minimal Line Icon */}
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E25822]/10 text-[#E25822] transition-transform duration-300 hover:scale-110">
                  <CategoryIcon className="h-7 w-7 stroke-[1.75]" />
                </div>

                {/* Category Title */}
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-[#18181A]">
                  {cat.title}
                </h3>

                {/* Minimal Logos Only — No Boxes, No Text Names */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                  {cat.skills.map((skillName) => {
                    const item = SKILLS.find((s) => s.name === skillName);
                    const SkillIcon = item?.icon;
                    if (!SkillIcon) return null;
                    return (
                      <div
                        key={skillName}
                        title={skillName}
                        className="group relative flex items-center justify-center p-1 transition-transform duration-200 hover:scale-125"
                      >
                        <SkillIcon className="h-7 w-7 shrink-0 transition-opacity duration-200 group-hover:opacity-100" style={{ color: item.color }} />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}






