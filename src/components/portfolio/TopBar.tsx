import { useState, useEffect } from "react";
import { Search, Sun, Moon, ArrowUpRight } from "lucide-react";
import type { TabId } from "./DashboardLayout";
import type { Theme } from "@/lib/theme";

// Easy-to-edit brand name constant (e.g. "keithciceron.dev" or "Keith Ciceron")
export const BRAND_NAME = "keithciceron.dev";

interface TopBarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenCommandPalette: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function TopBar({
  onSelectTab,
  onOpenCommandPalette,
  theme,
  onToggleTheme,
}: TopBarProps) {
  const [manilaTime, setManilaTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Manila",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        setManilaTime(formatter.format(now));
      } catch {
        setManilaTime("");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 h-[56px] w-full shrink-0 border-b border-[#E5E5E0] dark:border-[#262626] flex items-center justify-between bg-transparent text-[#161616] dark:text-[#EDEDED] z-40 select-none transition-colors duration-200">
      {/* Left Brand Container: Width strictly aligns with sidebar (w-48 sm:w-52 lg:w-56) with 1px right border divider */}
      <div className="w-auto md:w-48 sm:w-52 lg:w-56 shrink-0 h-full flex items-center px-4 sm:px-[22px] border-r border-[#E5E5E0] dark:border-[#262626]">
        <button
          type="button"
          onClick={() => onSelectTab("dashboard")}
          className="font-sans text-xs sm:text-sm font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] hover:opacity-75 transition-opacity cursor-pointer whitespace-nowrap"
          title="Return to Home"
        >
          {BRAND_NAME}
        </button>
      </div>

      {/* Main TopBar Container: External Links on Left, Search + Clock + Theme on Right */}
      <div className="flex-1 min-w-0 h-full flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="https://github.com/ciceronkeith4-code/ciceronkeith4-code"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-xs text-[#6E716B] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors"
          >
            <span>GitHub</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>

          <a
            href="https://www.linkedin.com/in/keith-ciceron"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-xs text-[#6E716B] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors"
          >
            <span>LinkedIn</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

      {/* Right Side: Narrow Search (~240px) + Manila Clock + Theme Toggle */}
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        {/* Search input narrowed to ~240px with Ctrl K hint */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-[180px] sm:w-[240px] flex items-center justify-between rounded-md border border-[#E5E5E0] dark:border-[#262626] bg-transparent hover:bg-black/5 dark:hover:bg-white/5 px-3 py-1.5 text-xs text-[#6E716B] dark:text-[#A3A3A3] transition-colors cursor-pointer"
          title="Search sections (Ctrl+K)"
          aria-label="Search sections"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Search className="h-3.5 w-3.5 opacity-60 shrink-0" />
            <span className="truncate">Search sections…</span>
          </div>
          <kbd className="pointer-events-none hidden sm:inline-flex h-4 select-none items-center rounded border border-[#E5E5E0] dark:border-[#333333] px-1 font-mono text-[9px] text-[#6E716B] dark:text-[#888888] shrink-0">
            Ctrl K
          </kbd>
        </button>

        {/* Live Manila Time in monospace with 'Manila' label and pulsing dot */}
        {manilaTime && (
          <div
            className="hidden sm:flex items-center gap-2 text-xs cursor-default"
            title="Current time in Manila"
          >
            <span className="text-[11px] text-[#6E716B] dark:text-[#A3A3A3]">
              Manila
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-[#161616] dark:text-[#EDEDED]">
              {manilaTime}
            </span>
          </div>
        )}

        {/* Theme Toggle Icon Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          aria-label="Toggle theme"
          className="h-8 w-8 rounded-md flex items-center justify-center text-[#6E716B] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  </header>
);
}
