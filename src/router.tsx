import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // The content pane (DashboardLayout) stays mounted across pages, so without this the router would carry
    // its scroll position over to the next page. Back and forward still restore each page's own position.
    scrollToTopSelectors: ['[data-scroll-restoration-id="content"]'],
    defaultPreloadStaleTime: 0,
  });

  return router;
};
