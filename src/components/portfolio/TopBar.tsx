import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Sun, Moon, ArrowUpRight } from "lucide-react";

const BRAND_NAME = "Keith Ciceron";

interface TopBarProps {
  onToggleTheme: () => void;
}

export function TopBar({ onToggleTheme }: TopBarProps) {
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
    <header className="h-14 w-full shrink-0 border-b border-[#E5E5E0] dark:border-[#262626] flex items-center justify-between bg-transparent text-[#161616] dark:text-[#EDEDED] z-40 select-none transition-colors duration-200">
      {/* Brand column: width matches the sidebar at every breakpoint so both dividers line up */}
      <div className="w-auto md:w-52 lg:w-56 shrink-0 h-full flex items-center px-4 md:px-[22px] md:border-r border-[#E5E5E0] dark:border-[#262626]">
        <Link
          to="/"
          className="font-sans text-sm font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] hover:opacity-75 transition-opacity cursor-pointer whitespace-nowrap"
          title="Return to Home"
        >
          {BRAND_NAME}
        </Link>
      </div>

      <div className="flex-1 min-w-0 h-full flex items-center justify-end sm:justify-between gap-2 px-3 sm:px-6">
        <div className="hidden sm:flex items-center gap-4">
          <a
            href="https://github.com/ciceronkeith4-code"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-xs text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors"
          >
            <span>GitHub</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>

          <a
            href="https://www.linkedin.com/in/keith-ciceron"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-xs text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] transition-colors"
          >
            <span>LinkedIn</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center gap-1 sm:gap-6 lg:gap-8">
          {manilaTime && (
            <div
              className="hidden lg:flex items-center gap-2 text-xs cursor-default"
              title="Current time in Manila"
            >
              <span className="text-[11px] text-[#62655E] dark:text-[#A3A3A3]">Manila</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="font-mono text-[11px] tabular-nums text-[#161616] dark:text-[#EDEDED]">
                {manilaTime}
              </span>
            </div>
          )}

          {/* Icon follows the html.dark class (set before paint), so server and client markup always match */}
          <button
            type="button"
            onClick={onToggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
            className="h-8 w-8 rounded-md flex items-center justify-center text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Moon className="h-4 w-4 dark:hidden" />
            <Sun className="h-4 w-4 hidden dark:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
