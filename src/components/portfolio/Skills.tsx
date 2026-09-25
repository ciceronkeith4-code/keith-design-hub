import { SKILLS } from "@/lib/portfolio-data";

interface Category {
  id: string;
  title: string;
  skills: string[];
}

const COLUMN_1_CATEGORIES: Category[] = [
  {
    id: "frontend",
    title: "Front-end Development",
    skills: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Tailwind CSS"],
  },
];

const COLUMN_2_CATEGORIES: Category[] = [
  {
    id: "backend",
    title: "Back-end Development",
    skills: ["Node.js"],
  },
  {
    id: "qa",
    title: "QA & Testing",
    skills: ["QA Testing"],
  },
  {
    id: "database",
    title: "Database Management",
    skills: ["MySQL", "Supabase", "Firebase"],
  },
];

const COLUMN_3_CATEGORIES: Category[] = [
  {
    id: "tools",
    title: "Version Control & Tools",
    skills: ["Git", "GitHub", "Vercel", "VS Code"],
  },
  {
    id: "design",
    title: "UI/UX & Design",
    skills: ["Figma", "Photoshop"],
  },
];

function CategoryBlock({ category }: { category: Category }) {
  return (
    <div className="flex flex-col justify-start">
      {/* Category Name in Small Caps */}
      <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#161616] dark:text-[#EDEDED] pb-2 border-b border-[#E5E5E0] dark:border-[#262626]">
        {category.title}
      </h3>

      {/* Technologies as plain text with small monochrome icons, separated by thin dividers */}
      <div className="divide-y divide-[#E5E5E0]/60 dark:divide-[#262626]">
        {category.skills.map((skillName) => {
          const item = SKILLS.find((s) => s.name === skillName);
          const SkillIcon = item?.icon;

          return (
            <div
              key={skillName}
              className="flex items-center gap-2 py-1.5 first:pt-2 last:pb-0 text-xs text-[#161616] dark:text-[#EDEDED]"
            >
              {SkillIcon && (
                <SkillIcon className="h-3.5 w-3.5 shrink-0 text-[#161616] dark:text-[#EDEDED]" />
              )}
              <span className="font-medium text-[11px] sm:text-xs text-[#161616] dark:text-[#EDEDED]">
                {skillName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <div className="w-full flex flex-col text-left">
      <h2 className="mb-6 sm:mb-8 font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
        Technical Capabilities
      </h2>

      {/* Rebalanced 3 Columns: Back-end + QA placed together in Column 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 items-start">
        {/* Column 1: Front-end */}
        <div className="flex flex-col gap-8">
          {COLUMN_1_CATEGORIES.map((cat) => (
            <CategoryBlock key={cat.id} category={cat} />
          ))}
        </div>

        {/* Column 2: Back-end + QA & Testing + Database */}
        <div className="flex flex-col gap-8">
          {COLUMN_2_CATEGORIES.map((cat) => (
            <CategoryBlock key={cat.id} category={cat} />
          ))}
        </div>

        {/* Column 3: Tools & DevOps + UI/UX & Design */}
        <div className="flex flex-col gap-8">
          {COLUMN_3_CATEGORIES.map((cat) => (
            <CategoryBlock key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </div>
  );
}
