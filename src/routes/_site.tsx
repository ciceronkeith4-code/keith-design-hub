import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { DashboardLayout } from "@/components/portfolio/DashboardLayout";

// Shared shell for every page: navigation and top bar. It stays mounted across navigations.
export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <div className="relative h-screen h-[100dvh] w-screen overflow-hidden bg-[#ECEEEA] border-none outline-none">
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
