import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ArrowUp, Square, X } from "lucide-react";
import { MAX_QUESTION } from "@/lib/agent/guard";
import { useAsk, type Turn } from "@/lib/agent/use-ask";
import { useGenieTransition } from "@/lib/use-genie-transition";

const MUTED = "text-[#62655E] dark:text-[#A3A3A3]";
const SUGGESTIONS = [
  "What packages do you offer?",
  "What's Keith's tech stack?",
  "Which project should I look at first?",
  "How do I hire Keith?",
];
const isPhone = () => !window.matchMedia("(min-width: 768px)").matches;
const getLauncher = () => document.querySelector<HTMLElement>('[data-tour="ask"]');

/**
 * The assistant's replies are plain text with at most links, **bold** and "-" lists. Anything else stays
 * text, and a link only becomes a link if it points inside this site or starts with https://.
 */
function inline(text: string, open: (href: string) => void): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const [, label, href, bold] = match;
    if (bold) {
      out.push(<strong key={key++}>{bold}</strong>);
    } else if (href.startsWith("/") && !href.startsWith("//") && !href.endsWith(".pdf")) {
      out.push(
        <a
          key={key++}
          href={href}
          onClick={(e) => {
            e.preventDefault();
            open(href);
          }}
          className="underline underline-offset-2"
        >
          {label}
        </a>,
      );
    } else if ((href.startsWith("/") && !href.startsWith("//")) || href.startsWith("https://")) {
      out.push(
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {label}
        </a>,
      );
    } else {
      out.push(label);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Message({ text, open }: { text: string; open: (href: string) => void }) {
  const blocks: { list: boolean; lines: string[] }[] = [];
  for (const raw of text.split("\n")) {
    // Headings are shown as ordinary text; the model is told not to write them, but some models do anyway.
    const line = raw.replace(/^\s*#{1,6}\s+/, "");
    if (!line.trim()) {
      blocks.push({ list: false, lines: [] });
      continue;
    }
    const item = /^\s*[-*•]\s+(.*)$/.exec(line);
    const tail = blocks[blocks.length - 1];
    if (item) {
      if (tail?.list) tail.lines.push(item[1]);
      else blocks.push({ list: true, lines: [item[1]] });
    } else if (tail && !tail.list) {
      tail.lines.push(line.trim());
    } else {
      blocks.push({ list: false, lines: [line.trim()] });
    }
  }
  return (
    <div className="space-y-2">
      {blocks
        .filter((b) => b.lines.length > 0)
        .map((block, i) =>
          block.list ? (
            <ul key={i} className="list-disc space-y-1 pl-4 marker:text-[#A3A69E]">
              {block.lines.map((l, j) => (
                <li key={j}>{inline(l, open)}</li>
              ))}
            </ul>
          ) : (
            <p key={i}>{inline(block.lines.join(" "), open)}</p>
          ),
        )}
    </div>
  );
}

function Bubble({
  turn,
  waiting,
  open,
}: {
  turn: Turn;
  waiting: boolean;
  open: (href: string) => void;
}) {
  if (turn.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#161616] px-3.5 py-2 text-sm leading-relaxed text-white [overflow-wrap:anywhere] dark:bg-[#EDEDED] dark:text-[#161616]">
          {turn.text}
        </p>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[92%] rounded-2xl rounded-bl-md border border-[#E5E5E0] bg-[#F6F7F4] px-3.5 py-2 text-sm leading-relaxed text-[#161616] [overflow-wrap:anywhere] dark:border-[#262626] dark:bg-[#1C1C1C] dark:text-[#EDEDED] ${
          turn.failed ? "italic" : ""
        }`}
      >
        {turn.text ? (
          <Message text={turn.text} open={open} />
        ) : waiting ? (
          <span className="inline-flex gap-1 py-1" role="status" aria-label="Typing">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8A8D86]"
                style={{ animationDelay: `${d * 160}ms` }}
              />
            ))}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Ask about Keith: a chat panel that answers from his site's own facts and package list (see
 * src/lib/agent). It stays open while the visitor browses; the conversation lives until the page reloads.
 */
export function AskPanel({
  open,
  onClose,
  closeOnOutsideClick = false,
}: {
  open: boolean;
  onClose: () => void;
  /** Also close on a click or tap anywhere outside the panel. Off, so the chat stays open while the visitor browses. */
  closeOnOutsideClick?: boolean;
}) {
  const router = useRouter();
  const { turns, status, send, stop, reset } = useAsk();
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const busy = status !== "idle";

  // The panel opens out of the Ask button and is sucked back into it (lib/use-genie-transition.ts, which also
  // keeps Tab inside the panel, returns focus to the button on close and lets a phone swipe the header down to close).
  // It stays mounted while closed, so the conversation and the scroll position are exactly as they were left.
  const genie = useGenieTransition({
    open,
    getLauncher,
    onRequestClose: onClose,
    closeOnOutsideClick,
  });
  const panel = genie.panelRef;

  // On open, move focus into the panel: to the question box, or on a phone to the panel itself, since focusing
  // the box would raise the keyboard over the answer. Also re-focus the box when it is lost, for instance when the
  // Stop button that had focus goes away because the answer finished.
  useEffect(() => {
    if (!open) return;
    if (isPhone()) {
      if (!panel.current?.contains(document.activeElement))
        panel.current?.focus({ preventScroll: true });
    } else if (!busy && document.activeElement !== input.current) {
      input.current?.focus({ preventScroll: true });
    }
  }, [open, busy, panel]);

  // Escape closes the panel from anywhere, except while the tour is on top and uses Escape itself.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector('[aria-labelledby="tour-title"]'))
        onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Keep the newest words in view as an answer arrives.
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, open]);

  const goTo = (href: string) => {
    router.history.push(href);
    // On a phone the panel covers the page, so get it out of the way once a link is followed.
    if (isPhone()) onClose();
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (busy || !draft.trim()) return;
    void send(draft);
    setDraft("");
  };

  return (
    <section
      ref={genie.panelRef}
      role="dialog"
      aria-label="Ask about Keith"
      tabIndex={-1}
      className="ask-panel genie-panel fixed inset-x-2 top-[68px] bottom-[84px] z-[65] flex flex-col overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-xl outline-none dark:border-[#262626] dark:bg-[#141414] md:inset-x-auto md:right-4 md:bottom-[68px] md:w-[400px]"
    >
      {/* The content fades on its own schedule: in after the panel's shape has opened, out before it closes. */}
      <div ref={genie.contentRef} className="flex min-h-0 flex-1 flex-col">
        <header
          ref={genie.handleRef}
          className="genie-handle flex items-center gap-3 border-b border-[#E5E5E0] px-4 py-3 dark:border-[#262626]"
        >
          <h2 className="min-w-0 flex-1 text-sm font-semibold text-[#161616] dark:text-[#EDEDED]">
            Ask about Keith
          </h2>
          {turns.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className={`h-8 rounded-md px-2 text-xs hover:text-[#161616] dark:hover:text-[#EDEDED] cursor-pointer ${MUTED}`}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer ${MUTED}`}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div
          ref={list}
          role="log"
          aria-live="polite"
          className="card-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {turns.length === 0 ? (
            <>
              <p className="max-w-[92%] rounded-2xl rounded-bl-md border border-[#E5E5E0] bg-[#F6F7F4] px-3.5 py-2 text-sm leading-relaxed text-[#161616] dark:border-[#262626] dark:bg-[#1C1C1C] dark:text-[#EDEDED]">
                Hi, I'm Keith's assistant. Ask me about his work, his service packages and prices,
                or how to hire him.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    className="rounded-full border border-[#E5E5E0] bg-white px-3 py-1.5 text-left text-xs text-[#161616] hover:bg-[#F6F7F4] dark:border-[#262626] dark:bg-[#141414] dark:text-[#EDEDED] dark:hover:bg-[#1C1C1C] cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </>
          ) : (
            turns.map((turn) => (
              <Bubble key={turn.id} turn={turn} waiting={status === "waiting"} open={goTo} />
            ))
          )}
        </div>

        <form
          onSubmit={submit}
          className="border-t border-[#E5E5E0] px-4 pb-3.5 pt-3 dark:border-[#262626]"
        >
          <div className="flex items-end gap-2">
            <label htmlFor="ask-input" className="sr-only">
              Your question
            </label>
            <textarea
              id="ask-input"
              ref={input}
              rows={2}
              maxLength={MAX_QUESTION}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Ask about his work, packages or stack"
              className="min-h-[44px] flex-1 select-text resize-none rounded-[10px] border border-[#E5E5E0] bg-white px-3 py-2 text-base text-[#161616] placeholder-[#71746C] focus:border-[#161616] focus:outline-none dark:border-[#262626] dark:bg-[#1C1C1C] dark:text-[#EDEDED] dark:placeholder-[#8A8D86] dark:focus:border-[#EDEDED] sm:text-sm"
            />
            {busy ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] cursor-pointer"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Send"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#161616] text-white transition-opacity disabled:opacity-40 dark:bg-[#EDEDED] dark:text-[#161616] cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-2.5 text-[11px] font-medium leading-snug text-[#161616] dark:text-[#EDEDED]">
            Powered by AI
          </p>
          <p className={`mt-0.5 text-[11px] leading-snug ${MUTED}`}>
            Simple questions get quick answers. For anything tricky or important,{" "}
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                goTo("/contact");
              }}
              className="underline underline-offset-2 hover:text-[#161616] dark:hover:text-[#EDEDED]"
            >
              notify Keith
            </a>
            . Please don't share personal details.
          </p>
        </form>
      </div>
    </section>
  );
}

/**
 * On phones the panel is a sheet over the page; this calm backdrop sits behind it (below the top bar, so the Ask
 * button stays usable, and under the bottom navigation) so the page doesn't show through around the panel.
 * Tapping it closes the chat. It fades with the panel via the .ask-scrim rules in styles.css.
 */
export function AskScrim({ onClose }: { onClose: () => void }) {
  return (
    <div
      aria-hidden="true"
      onClick={onClose}
      className="ask-scrim fixed inset-x-0 top-14 bottom-0 z-[45] bg-[#ECEEEA]/95 backdrop-blur-[2px] dark:bg-[#0A0A0A]/95 md:hidden"
    />
  );
}
