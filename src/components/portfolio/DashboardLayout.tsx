import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { useTheme } from "@/lib/theme";

export type TabId = "dashboard" | "about" | "skills" | "experience" | "projects" | "activities" | "contact";

export interface NavSection {
  id: TabId;
  label: string;
}

const SECTIONS: NavSection[] = [
  { id: "dashboard", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "activities", label: "Activities" },
  { id: "contact", label: "Contact" },
];

interface DashboardLayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
}

export function DashboardLayout({ activeTab, onTabChange, children }: DashboardLayoutProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSelectTab = (id: TabId) => {
    onTabChange(id);
  };

  return (
    <div className="h-screen h-[100dvh] w-screen w-[100vw] overflow-hidden p-0 m-0 bg-[#ECEEEA] dark:bg-[#0A0A0A] select-none font-sans text-[#161616] dark:text-[#EDEDED] flex flex-col transition-colors duration-200">
      {/* ============================================================ */}
      {/* 1. TOP BAR (Thin bar across top, 1px bottom border, no fill) */}
      {/* ============================================================ */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ============================================================ */}
      {/* 2. BODY CONTAINER: SIDEBAR + LEFT-ALIGNED CONTENT AREA       */}
      {/* ============================================================ */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-row overflow-hidden">
        {/* SIDEBAR: TEXT, NOT ICONS */}
        <aside className="hidden md:flex h-full min-h-0 w-48 sm:w-52 lg:w-56 shrink-0 flex-col justify-start border-r border-[#E5E5E0] dark:border-[#262626] bg-transparent px-3 py-6 z-30 select-none overflow-y-auto card-scrollbar">
          <span className="font-mono text-[10px] text-[#6E716B] dark:text-[#A3A3A3] uppercase tracking-wider block px-2.5 mb-3 font-medium">
            Sections
          </span>

          <nav aria-label="Sections Navigation" className="flex flex-col gap-1">
            {SECTIONS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer rounded-md ${
                    isActive
                      ? "bg-black/5 dark:bg-white/10 text-[#161616] dark:text-[#EDEDED]"
                      : "text-[#6E716B] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav aria-label="Mobile Navigation" className="flex md:hidden fixed bottom-2 inset-x-2 h-14 bg-[#1C1C1C] dark:bg-[#141414] border border-white/10 rounded-full z-50 items-center justify-around px-3 shadow-lg">
          {SECTIONS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  isActive ? "bg-white text-[#161616] font-medium" : "text-white/60 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ============================================================ */}
        {/* 3. MAIN CONTENT AREA: LEFT-ALIGNED WITH GENEROUS LEFT PADDING*/}
        {/* ============================================================ */}
        <main className="flex-1 min-w-0 min-h-0 h-full overflow-hidden flex flex-col justify-center">
          <div className="flex-1 min-h-0 min-w-0 h-full w-full overflow-y-auto md:overflow-hidden card-scrollbar pl-8 sm:pl-12 lg:pl-16 pr-8 sm:pr-12 lg:pr-16 py-6 sm:py-8 flex flex-col justify-center items-start text-left pb-16 md:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-[1000px] min-h-0 min-w-0 flex flex-col justify-center items-start text-left"
              >
                {children}
              </motion.div>
            </AnimatePresence>
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
