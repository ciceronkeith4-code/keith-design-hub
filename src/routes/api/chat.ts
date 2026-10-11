import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Loaded here, on the server, so the chat code and its API key never ship to the browser.
        const { handleChat } = await import("@/lib/agent/chat-handler");
        return handleChat(request);
      },
      // Without this a GET would render the site's page shell instead of an API answer.
      GET: async () =>
        new Response(JSON.stringify({ error: "method_not_allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json", Allow: "POST" },
        }),
    },
  },
});
