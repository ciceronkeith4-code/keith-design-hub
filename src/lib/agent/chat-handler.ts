import { MAX_BODY, clientId, parseTurns, rateLimit, sameSite, type Turn } from "./guard";
import { systemPrompt } from "./knowledge";

/**
 * POST /api/chat: answers a visitor's question about Keith with Google's Gemini API, streamed as it is written.
 *
 * The reply is newline-delimited JSON: {"t":"text","v":"..."} for each piece of the answer, then one
 * {"t":"done"}, or {"t":"error","code":"..."} if something goes wrong part-way (the HTTP status is already
 * sent by then). Rejected requests are ordinary JSON with an error status instead.
 *
 * It runs on Gemini's free tier, which gives each model its own small daily quota. So it keeps a pool of models
 * and, when one is out of quota or overloaded, moves on to the next, remembering for a while which are spent.
 * If every model is spent the visitor is told to try tomorrow or email Keith.
 *
 * Server settings: GEMINI_API_KEY (required), CHAT_MODELS (comma-separated pool, best first), CHAT_DISABLED=1
 * (switch the assistant off), GEMINI_BASE_URL (for a test server).
 */
const BASE = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
// Stable models from Google's model list, best first. Each has its own free daily quota.
const POOL = (
  process.env.CHAT_MODELS ||
  "gemini-3.8-flash,gemini-3.6-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
// Thinking tokens count against this limit too, so it is generous even though answers are short.
const MAX_OUTPUT_TOKENS = 1200;
// "low" is accepted by the 3.x Flash and Flash-Lite models; it keeps answers fast.
const THINKING_LEVEL = "low";

/** Why a model could not answer. */
class ModelFailure extends Error {
  constructor(
    readonly kind: "quota" | "overloaded" | "missing" | "auth" | "thinking" | "failed",
    readonly retryMs = 0,
  ) {
    super(kind);
  }
}

// When a model may be tried again, after it ran out of quota or was overloaded. Each server instance keeps its own.
const unavailableUntil = new Map<string, number>();

const JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const fail = (status: number, error: string, extra: Record<string, unknown> = {}, headers = {}) =>
  new Response(JSON.stringify({ error, ...extra }), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });

type GeminiError = {
  error?: { message?: string; status?: string; details?: { [key: string]: unknown }[] };
};
type GeminiChunk = {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
};

/** How long Google says to wait, in ms (its RetryInfo, or the "retry in 37s" text), or 0 if it doesn't say. */
function retryAfterMs(data: GeminiError) {
  const info = (data.error?.details ?? []).find((d) => /RetryInfo/.test(String(d["@type"] ?? "")));
  const direct = /^([\d.]+)s$/.exec(String(info?.retryDelay ?? ""));
  if (direct) return Number(direct[1]) * 1000;
  const text = /retry in\s+(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:([\d.]+)s)?/i.exec(
    data.error?.message ?? "",
  );
  return text
    ? ((Number(text[1]) || 0) * 3600 + (Number(text[2]) || 0) * 60 + (Number(text[3]) || 0)) * 1000
    : 0;
}

/** Gemini takes "user" and "model" turns; neighbours with the same role are joined into one. */
function toContents(turns: Turn[]) {
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];
  for (const turn of turns) {
    const role = turn.role === "user" ? "user" : "model";
    const last = contents[contents.length - 1];
    if (last?.role === role) last.parts[0].text += `\n\n${turn.content}`;
    else contents.push({ role, parts: [{ text: turn.content }] });
  }
  return contents;
}

/** Opens a streamed answer from one model, or throws why it can't. */
async function open(model: string, turns: Turn[], thinking: boolean, signal: AbortSignal) {
  const generationConfig: Record<string, unknown> = { maxOutputTokens: MAX_OUTPUT_TOKENS };
  if (thinking) generationConfig.thinkingConfig = { thinkingLevel: THINKING_LEVEL };
  const response = await fetch(
    `${BASE}/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY ?? "",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt() }] },
        contents: toContents(turns),
        generationConfig,
      }),
      signal,
    },
  );
  if (response.ok && response.body) return response.body;

  const data = (await response.json().catch(() => ({}))) as GeminiError;
  const message = data.error?.message ?? "";
  if (response.status === 429) {
    // A spent daily quota stays spent for hours; a per-minute limit clears in seconds.
    const daily =
      /PerDay/i.test(JSON.stringify(data.error?.details ?? "")) || /per ?day/i.test(message);
    throw new ModelFailure("quota", retryAfterMs(data) || (daily ? 3_600_000 : 30_000));
  }
  if (response.status >= 500) throw new ModelFailure("overloaded", 120_000);
  if (response.status === 404) throw new ModelFailure("missing", 6 * 3_600_000);
  if (response.status === 401 || response.status === 403 || /api key/i.test(message))
    throw new ModelFailure("auth");
  if (response.status === 400 && thinking && /thinking/i.test(message))
    throw new ModelFailure("thinking");
  throw new ModelFailure("failed");
}

/** The pieces of server-sent events: each "data:" line carries one JSON chunk. */
async function* chunks(body: ReadableStream<Uint8Array>): AsyncGenerator<GeminiChunk> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const read = function* (block: string) {
    for (const line of block.split(/\r?\n/)) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload) yield JSON.parse(payload) as GeminiChunk;
    }
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    for (let end = /\r?\n\r?\n/.exec(buffer); end; end = /\r?\n\r?\n/.exec(buffer)) {
      yield* read(buffer.slice(0, end.index));
      buffer = buffer.slice(end.index + end[0].length);
    }
  }
  if (buffer.trim()) yield* read(buffer);
}

/** The code the page turns into a friendly message. */
function codeFor(error: unknown) {
  if (error instanceof ModelFailure) {
    if (error.kind === "auth") return "not_configured";
    if (error.kind === "quota") return "quota";
    if (error.kind === "overloaded" || error.kind === "missing") return "busy";
  }
  return "failed";
}

export async function handleChat(request: Request): Promise<Response> {
  if (process.env.CHAT_DISABLED === "1") return fail(503, "disabled");
  if (!process.env.GEMINI_API_KEY) return fail(503, "not_configured");
  if (!sameSite(request)) return fail(403, "forbidden");

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY) return fail(413, "too_large");

  const wait = rateLimit(clientId(request));
  if (wait > 0)
    return fail(429, "rate_limited", { retryAfter: wait }, { "Retry-After": String(wait) });

  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return fail(400, "bad_request");
  }
  const turns = parseTurns(body);
  if (!turns) return fail(400, "bad_request");

  const encoder = new TextEncoder();
  const line = (value: object) => encoder.encode(`${JSON.stringify(value)}\n`);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Try each model that isn't known to be spent, best first, until one starts answering.
        let source: ReadableStream<Uint8Array> | null = null;
        let lastFailure: unknown = null;
        for (const model of POOL) {
          if ((unavailableUntil.get(model) ?? 0) > Date.now()) continue;
          for (let thinking = true, tries = 0; tries < 2; tries++) {
            try {
              source = await open(model, turns, thinking, request.signal);
              break;
            } catch (error) {
              if (error instanceof ModelFailure && error.kind === "thinking") {
                thinking = false; // this model doesn't take a thinking level: ask again without one
                continue;
              }
              lastFailure = error;
              if (error instanceof ModelFailure && error.retryMs > 0) {
                unavailableUntil.set(model, Date.now() + error.retryMs);
              }
              if (error instanceof ModelFailure && error.kind === "auth") throw error;
              break;
            }
          }
          if (source) break;
        }
        if (!source) {
          // Nothing to try: every model is spent or down.
          const spent = POOL.every((m) => (unavailableUntil.get(m) ?? 0) > Date.now());
          throw lastFailure ?? new ModelFailure(spent ? "quota" : "failed");
        }

        let text = false;
        let blocked = false;
        for await (const chunk of chunks(source)) {
          if (chunk.promptFeedback?.blockReason) blocked = true;
          const candidate = chunk.candidates?.[0];
          if (
            candidate?.finishReason &&
            /SAFETY|PROHIBITED|BLOCKLIST|SPII/.test(candidate.finishReason)
          )
            blocked = true;
          for (const part of candidate?.content?.parts ?? []) {
            if (part.text && !part.thought) {
              text = true;
              controller.enqueue(line({ t: "text", v: part.text }));
            }
          }
        }
        // A safety block with nothing written is shown as the friendly "I'd rather skip that"; no text at all is a failure.
        controller.enqueue(
          line(text ? { t: "done" } : { t: "error", code: blocked ? "refused" : "failed" }),
        );
      } catch (error) {
        if (!request.signal.aborted) {
          console.error(
            "chat: model call failed",
            error instanceof ModelFailure ? error.kind : error,
          );
          controller.enqueue(line({ t: "error", code: codeFor(error) }));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
