/**
 * Guards for the chat endpoint. The endpoint spends money on every question, so it checks who is asking,
 * how often, and what they send before anything reaches the model.
 */

/** Longest question accepted, in characters. */
export const MAX_QUESTION = 500;
// Earlier answers are echoed back as history; they are the assistant's own, so they get more room.
const MAX_ANSWER = 4000;
// The most recent turns that are sent to the model. Older ones are dropped.
const HISTORY = 10;
/** Largest request body accepted, in bytes. */
export const MAX_BODY = 24_000;

export type Turn = { role: "user" | "assistant"; content: string };

/** Control characters have no place in chat text; tabs and line breaks stay. */
function withoutControlCharacters(text: string) {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127)) out += char;
  }
  return out;
}

/**
 * Checks the request body and returns the turns to send, or null if it isn't a valid conversation. The
 * conversation must end with a question from the visitor and start with one (leading answers are dropped).
 */
export function parseTurns(body: unknown): Turn[] | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 60) return null;

  const turns: Turn[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = withoutControlCharacters(content).trim();
    if (text.length === 0) return null;
    if (text.length > (role === "user" ? MAX_QUESTION : MAX_ANSWER)) return null;
    turns.push({ role, content: text });
  }

  const recent = turns.slice(-HISTORY);
  while (recent.length > 0 && recent[0].role !== "user") recent.shift();
  if (recent.length === 0 || recent[recent.length - 1].role !== "user") return null;
  return recent;
}

/** True when a browser request comes from this site itself (or has no Origin, as with a plain tool). */
export function sameSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export function clientId(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

// Per-visitor limits. Gemini's free tier gives the whole site only a small number of answers a day, so one
// visitor must not be able to use them all: a real visitor asks a handful of questions. A server instance keeps
// its own counts, so this is a first line of defence rather than an exact cap.
const WINDOWS = [
  { ms: 10 * 60_000, max: 6 },
  { ms: 24 * 60 * 60_000, max: 15 },
];
const LONGEST = WINDOWS[WINDOWS.length - 1].ms;
const MAX_VISITORS = 5000;
const hits = new Map<string, number[]>();

/** Records a request and returns how many seconds the visitor must wait, or 0 if it is allowed. */
export function rateLimit(id: string, now = Date.now()) {
  const times = (hits.get(id) ?? []).filter((t) => now - t < LONGEST);
  for (const { ms, max } of WINDOWS) {
    const inside = times.filter((t) => now - t < ms);
    if (inside.length >= max) {
      hits.set(id, times);
      return Math.max(1, Math.ceil((inside[0] + ms - now) / 1000));
    }
  }
  times.push(now);
  hits.set(id, times);
  if (hits.size > MAX_VISITORS) {
    // Forget the longest-idle visitors so the table can't grow without bound.
    for (const [key, list] of hits) {
      if (list.length === 0 || now - list[list.length - 1] > LONGEST) hits.delete(key);
      if (hits.size <= MAX_VISITORS * 0.8) break;
    }
  }
  return 0;
}
