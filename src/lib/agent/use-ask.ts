import { useCallback, useEffect, useRef, useState } from "react";
import { CONTACT } from "@/lib/portfolio-data";
import { MAX_QUESTION } from "./guard";

/**
 * The visitor's side of the site assistant: sends a question to /api/chat and fills the answer in as it
 * streams. See src/lib/agent/chat-handler.ts for the reply format.
 */
export type Turn = { id: number; role: "user" | "assistant"; text: string; failed?: boolean };
/** waiting: asked, nothing back yet. streaming: the answer is arriving. */
export type AskStatus = "idle" | "waiting" | "streaming";

class AskError extends Error {
  constructor(
    readonly code: string,
    readonly retryAfter?: number,
  ) {
    super(code);
  }
}

const email = CONTACT.email;

/** What a visitor sees when something fails, in the assistant's own voice. */
function friendly(code: string, retryAfter?: number) {
  switch (code) {
    case "rate_limited": {
      const wait =
        retryAfter && retryAfter > 90 ? `about ${Math.ceil(retryAfter / 60)} minutes` : "a minute";
      return `Okay, that's a lot of questions! Give me ${wait}, or email Keith directly: ${email}.`;
    }
    case "busy":
      return "I'm a bit swamped right now. Try again in a moment.";
    case "quota":
      return `I've used up my free questions for today (free tier, you get what you pay for). Try again tomorrow, or email Keith at ${email}.`;
    case "not_configured":
    case "disabled":
      return `The assistant is taking a nap. You can reach Keith at ${email} or on the Contact page.`;
    case "refused":
      return "I'd rather skip that one. Want to ask about Keith's projects or packages instead?";
    case "too_large":
    case "bad_request":
      return "That message was a bit too long for me. Could you shorten it?";
    case "forbidden":
      return "I can only chat from Keith's own site.";
    default:
      return `Something went wrong on my side. Try again, or email Keith at ${email}.`;
  }
}

export function useAsk() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<AskStatus>("idle");
  // The latest turns, for building the history without waiting for a render.
  const turnsRef = useRef<Turn[]>([]);
  const nextId = useRef(1);
  const abort = useRef<AbortController | null>(null);

  const commit = useCallback((next: Turn[]) => {
    turnsRef.current = next;
    setTurns(next);
  }, []);

  useEffect(() => () => abort.current?.abort(), []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_QUESTION);
      if (!text || abort.current) return;

      const question: Turn = { id: nextId.current++, role: "user", text };
      const reply: Turn = { id: nextId.current++, role: "assistant", text: "" };
      // Answers that failed were never real answers, so they are not part of the conversation.
      const history = [...turnsRef.current.filter((t) => !t.failed && t.text), question].map(
        (t) => ({
          role: t.role,
          content: t.text,
        }),
      );
      commit([...turnsRef.current, question, reply]);
      setStatus("waiting");

      const controller = new AbortController();
      abort.current = controller;
      const write = (patch: (t: Turn) => Turn) =>
        commit(turnsRef.current.map((t) => (t.id === reply.id ? patch(t) : t)));

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          const data = (await response.json().catch(() => ({}))) as {
            error?: string;
            retryAfter?: number;
          };
          throw new AskError(data.error ?? "failed", data.retryAfter);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let received = false;
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let end: number;
          while ((end = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, end).trim();
            buffer = buffer.slice(end + 1);
            if (!line) continue;
            const message = JSON.parse(line) as { t: string; v?: string; code?: string };
            if (message.t === "text" && message.v) {
              received = true;
              setStatus("streaming");
              write((t) => ({ ...t, text: t.text + message.v }));
            } else if (message.t === "error") {
              throw new AskError(message.code ?? "failed");
            }
          }
        }
        if (!received) throw new AskError("failed");
      } catch (error) {
        if (controller.signal.aborted) {
          // The visitor pressed Stop: keep what arrived, or drop the empty answer.
          commit(turnsRef.current.filter((t) => !(t.id === reply.id && t.text === "")));
        } else {
          const code = error instanceof AskError ? error.code : "failed";
          const retryAfter = error instanceof AskError ? error.retryAfter : undefined;
          write((t) => ({ ...t, text: friendly(code, retryAfter), failed: true }));
        }
      } finally {
        abort.current = null;
        setStatus("idle");
      }
    },
    [commit],
  );

  const stop = useCallback(() => abort.current?.abort(), []);

  const reset = useCallback(() => {
    abort.current?.abort();
    commit([]);
  }, [commit]);

  return { turns, status, send, stop, reset };
}
