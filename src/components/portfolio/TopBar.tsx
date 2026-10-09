import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Sun, Moon, ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { CLICKABLE, playClick, readSoundOn, saveSoundOn } from "@/lib/click-sound";
import { pixelThemeTransition } from "@/lib/pixel-transition";

const BRAND_NAME = "Keith Ciceron";

const ICON_BUTTON =
  "h-8 w-8 rounded-md flex items-center justify-center text-[#62655E] dark:text-[#A3A3A3] hover:text-[#161616] dark:hover:text-[#EDEDED] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer";

/** Click sounds for every link and button on the site, and the switch that turns them on and off. */
function SoundToggle() {
  // On until the saved choice is read after mount, so server and client markup match.
  const [on, setOn] = useState(true);
  const onRef = useRef(true);

  useEffect(() => {
    const saved = readSoundOn();
    setOn(saved);
    onRef.current = saved;
    const onClick = (event: MouseEvent) => {
      if (!onRef.current || !(event.target instanceof Element)) return;
      const target = event.target.closest(CLICKABLE);
      if (!target || target.closest("[data-no-click-sound]")) return;
      if (target instanceof HTMLButtonElement && target.disabled) return;
      playClick();
    };
    // Capture phase, so the sound plays even when a handler stops the click from bubbling.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    onRef.current = next;
    saveSoundOn(next);
    if (next) playClick("on");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-no-click-sound
      aria-pressed={on}
      aria-label="Click sounds"
      title={on ? "Click sounds on" : "Click sounds off"}
      className={ICON_BUTTON}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}

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

          {/* data-tour: the tour points at this group */}
          <div className="flex items-center gap-1" data-tour="controls">
            <SoundToggle />

            {/* Icon follows the html.dark class (set before paint), so server and client markup always match */}
            <button
              type="button"
              onClick={(event) => {
                const box = event.currentTarget.getBoundingClientRect();
                const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
                pixelThemeTransition(
                  next,
                  { x: box.left + box.width / 2, y: box.top + box.height / 2 },
                  onToggleTheme,
                );
              }}
              title="Toggle theme"
              aria-label="Toggle theme"
              className={ICON_BUTTON}
            >
              <Moon className="h-4 w-4 dark:hidden" />
              <Sun className="h-4 w-4 hidden dark:block" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
