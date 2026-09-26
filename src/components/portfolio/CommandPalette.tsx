import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Home,
  User,
  Layers,
  Briefcase,
  Folder,
  Calendar,
  Mail,
  ExternalLink,
  Code2,
} from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { PROJECTS } from "@/lib/portfolio-data";
import type { TabId } from "./DashboardLayout";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTab: (tab: TabId) => void;
}

const SECTION_ITEMS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "skills", label: "Skills", icon: Layers },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "activities", label: "Activities", icon: Calendar },
  { id: "contact", label: "Contact", icon: Mail },
];

export function CommandPalette({ open, onOpenChange, onSelectTab }: CommandPaletteProps) {
  const navigate = useNavigate();
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelectSection = (tabId: TabId) => {
    onSelectTab(tabId);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search sections, projects, and links…" />
      <CommandList className="max-h-[360px] py-2">
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Sections */}
        <CommandGroup heading="Sections">
          {SECTION_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.id}
                value={`section ${item.label}`}
                onSelect={() => handleSelectSection(item.id)}
                className="cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 opacity-70" />
                  <span>{item.label}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase">Jump</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Projects */}
        <CommandGroup heading="Projects">
          {PROJECTS.map((project) => (
            <CommandItem
              key={project.title}
              value={`project ${project.title} ${project.tech.join(" ")}`}
              onSelect={() => {
                onOpenChange(false);
                navigate({ to: "/projects/$slug", params: { slug: project.slug } });
              }}
              className="cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Code2 className="h-4 w-4 shrink-0 opacity-70" />
                <span className="truncate">{project.title}</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                {project.tech[0]}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Links */}
        <CommandGroup heading="Links & Contact">
          <CommandItem
            value="github ciceronkeith4-code profile repositories"
            onSelect={() => {
              window.open("https://github.com/ciceronkeith4-code", "_blank", "noopener,noreferrer");
              onOpenChange(false);
            }}
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <FaGithub className="h-4 w-4 opacity-70" />
              <span>GitHub Profile</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </CommandItem>

          <CommandItem
            value="linkedin keith ciceron profile"
            onSelect={() => {
              window.open(
                "https://www.linkedin.com/in/keith-ciceron",
                "_blank",
                "noopener,noreferrer",
              );
              onOpenChange(false);
            }}
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <FaLinkedinIn className="h-4 w-4 opacity-70" />
              <span>LinkedIn Profile</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </CommandItem>

          <CommandItem
            value="email ciceronkeith4@gmail.com mail"
            onSelect={() => {
              window.location.href = "mailto:ciceronkeith4@gmail.com";
              onOpenChange(false);
            }}
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 opacity-70" />
              <span>Send Email</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              ciceronkeith4@gmail.com
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
