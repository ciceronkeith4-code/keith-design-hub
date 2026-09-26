import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Home,
  User,
  Code2,
  Briefcase,
  FolderOpen,
  Calendar,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { useTheme } from "@/lib/theme";

export type TabId =
  "dashboard" | "about" | "skills" | "experience" | "projects" | "activities" | "contact";

export interface NavSection {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

// Every section is its own URL, so each one is server-rendered and crawlable.
export const SECTION_PATHS = {
  dashboard: "/",
  about: "/about",
  skills: "/skills",
  experience: "/experience",
  projects: "/projects",
  activities: "/activities",
  contact: "/contact",
} as const satisfies Record<TabId, string>;

function sectionForPath(pathname: string): TabId {
  const first = pathname.split("/")[1] ?? "";
  const match = (Object.keys(SECTION_PATHS) as TabId[]).find(
    (id) => SECTION_PATHS[id] === `/${first}`,
  );
  return match ?? "dashboard";
}

const SECTIONS: NavSection[] = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "activities", label: "Activities", icon: Calendar },
  { id: "contact", label: "Contact", icon: Mail },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });
  const activeTab = sectionForPath(pathname);
  const isHome = pathname === "/";
  const scrollRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);
  useEffect(() => {
    hydrated.current = true;
  }, []);

  // The content pane scrolls, not the window, so the router's scroll restoration can't reset it.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const handleSelectTab = (id: TabId) => {
    navigate({ to: SECTION_PATHS[id] });
  };

  return (
    <div className="h-screen h-[100dvh] w-screen w-[100vw] overflow-hidden p-0 m-0 bg-[#ECEEEA] dark:bg-[#0A0A0A] select-none font-sans text-[#161616] dark:text-[#EDEDED] flex flex-col transition-colors duration-200">
      {/* ============================================================ */}
      {/* 1. TOP BAR (Thin bar across top, 1px bottom border, no fill) */}
      {/* ============================================================ */}
      <TopBar
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onToggleTheme={toggleTheme}
      />

      {/* ============================================================ */}
      {/* 2. BODY CONTAINER: SIDEBAR + LEFT-ALIGNED CONTENT AREA       */}
      {/* ============================================================ */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-row overflow-hidden">
        {/* SIDEBAR: icon + label */}
        <aside className="hidden md:flex h-full min-h-0 w-48 sm:w-52 lg:w-56 shrink-0 flex-col justify-start border-r border-[#E5E5E0] dark:border-[#262626] bg-transparent px-3 py-6 z-30 select-none overflow-y-auto card-scrollbar">
          <span className="font-mono text-[10px] text-[#62655E] dark:text-[#A3A3A3] uppercase tracking-wider block px-2.5 mb-3 font-medium">
            Sections
          </span>

          <nav aria-label="Sections Navigation" className="flex flex-col gap-1">
            {SECTIONS.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={SECTION_PATHS[item.id]}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-2.5 text-left px-2.5 py-1.5 text-sm font-medium transition-colors cursor-pointer rounded-md ${
                    isActive
                      ? "bg-black/5 dark:bg-white/10 text-[#161616] dark:text-[#EDEDED]"
                      : "text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* MOBILE BOTTOM NAVIGATION BAR: icons for every section, label on the active one, so all seven fit a phone width */}
        <nav
          aria-label="Mobile Navigation"
          className="flex md:hidden fixed bottom-2 inset-x-2 h-14 bg-[#1C1C1C] dark:bg-[#141414] border border-white/10 rounded-full z-50 items-center justify-between px-2 shadow-lg"
        >
          {SECTIONS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={SECTION_PATHS[item.id]}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`h-10 shrink-0 flex items-center justify-center gap-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                  isActive
                    ? "px-3.5 bg-white text-[#161616] font-medium"
                    : "w-10 text-white/60 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                {isActive && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ============================================================ */}
        {/* 3. MAIN CONTENT AREA: sections anchor to one shared top line so */}
        {/* titles never jump between tabs; Home fills the height to center */}
        {/* ============================================================ */}
        <main className="flex-1 min-w-0 min-h-0 h-full overflow-hidden flex flex-col">
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 min-w-0 h-full w-full overflow-y-auto card-scrollbar px-6 sm:px-12 lg:px-16 pt-8 sm:pt-12 pb-24 md:pb-12 flex flex-col items-start text-left"
          >
            {/* Fade in on navigation only: the server-rendered first page must be visible before hydration */}
            <motion.div
              key={pathname}
              initial={hydrated.current ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className={`w-full max-w-[1000px] min-w-0 flex flex-col items-start text-left ${isHome ? "flex-1" : ""}`}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onSelectTab={handleSelectTab}
      />
    </div>
  );
}
