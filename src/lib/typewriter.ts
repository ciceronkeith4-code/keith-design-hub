export type TypeSegment = { text: string; /** ms per character */ speed: number };

// Pause before each segment starts typing, in ms.
export const TYPE_PAUSE = 220;

/**
 * When each segment starts on one timeline (ms from page load). The typing itself is plain CSS (see Typed
 * and .tw-char in styles.css), so it starts with the first paint instead of waiting for JavaScript.
 */
export function typeSchedule(segments: TypeSegment[]) {
  let t = 0;
  return segments.map((s) => {
    t += TYPE_PAUSE;
    const start = t;
    t += s.text.length * s.speed;
    return start;
  });
}
