import { useEffect, useRef, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, User, Briefcase, FolderOpen, Mail, type LucideIcon } from "lucide-react";
import { TopBar } from "./TopBar";
import { useTheme } from "@/lib/theme";

// Every section is its own URL, so each one is server-rendered and crawlable.
const SECTIONS: { path: string; label: string; icon: LucideIcon }[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/about", label: "About", icon: User },
  { path: "/projects", label: "Work", icon: FolderOpen },
  { path: "/experience", label: "Experience", icon: Briefcase },
  { path: "/contact", label: "Contact", icon: Mail },
];

const sectionForPath = (pathname: string) => `/${pathname.split("/")[1] ?? ""}`;

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { toggleTheme } = useTheme();
  const { pathname, hash } = useLocation({
    select: (l) => ({ pathname: l.pathname, hash: l.hash }),
  });
  const active = sectionForPath(pathname);
  const isHome = pathname === "/";
  const scrollRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);
  useEffect(() => {
    hydrated.current = true;
  }, []);

  // The content pane scrolls, not the window: start each page at the top, or at the #hash entry.
  useEffect(() => {
    const target = hash ? document.getElementById(hash) : null;
    if (target) target.scrollIntoView();
    else scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return (
    <div className="h-screen h-[100dvh] w-screen w-[100vw] overflow-hidden p-0 m-0 bg-[#ECEEEA] dark:bg-[#0A0A0A] select-none font-sans text-[#161616] dark:text-[#EDEDED] flex flex-col transition-colors duration-200">
      <TopBar onToggleTheme={toggleTheme} />

      <div className="flex-1 min-h-0 min-w-0 flex flex-row overflow-hidden">
        {/* The one navigation: a sidebar from md up, a bar pinned to the bottom on phones. */}
        <nav
          aria-label="Main"
          className="fixed bottom-2 inset-x-2 z-50 h-14 flex items-center justify-between rounded-full border border-white/10 bg-[#1C1C1C] px-2 shadow-lg dark:bg-[#141414] md:static md:z-30 md:h-full md:w-52 lg:w-56 md:shrink-0 md:flex-col md:items-stretch md:justify-start md:gap-1 md:rounded-none md:border-0 md:border-r md:border-[#E5E5E0] md:bg-transparent md:px-3 md:py-6 md:shadow-none md:dark:border-[#262626] md:dark:bg-transparent"
        >
          {SECTIONS.map((item) => {
            const isActive = active === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`h-10 shrink-0 flex items-center justify-center gap-1.5 rounded-full text-xs transition-colors cursor-pointer md:h-auto md:w-full md:justify-start md:gap-2.5 md:rounded-md md:px-2.5 md:py-1.5 md:text-sm md:font-medium ${
                  isActive
                    ? "px-3.5 bg-white text-[#161616] font-medium md:bg-black/5 md:dark:bg-white/10 md:dark:text-[#EDEDED]"
                    : "w-10 text-white/60 hover:text-white md:text-[#62655E] md:dark:text-[#A3A3A3] md:hover:text-[#161616] md:dark:hover:text-[#EDEDED] md:hover:bg-black/[0.03] md:dark:hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="h-4 w-4 md:h-3.5 md:w-3.5 shrink-0" strokeWidth={2} />
                <span className={isActive ? "" : "sr-only md:not-sr-only"}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

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
    </div>
  );
}
