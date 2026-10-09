import type { CSSProperties } from "react";
import { TYPE_PAUSE } from "@/lib/typewriter";

/**
 * One line of typed text, animated by CSS alone: each character fades in at its own time and briefly
 * carries the cursor. It starts with the first paint (no wait for JavaScript), restarts whenever the line
 * mounts again, and the hidden characters still hold their space so nothing shifts. Screen readers and
 * search engines get the plain sentence; the per-character copy is hidden from them.
 *
 * `start` is when typing begins (ms after page load), `speed` the ms per character, and `last` keeps the
 * cursor blinking after the final character instead of handing it to the next line.
 */
export function Typed({
  text,
  start,
  speed,
  last = false,
}: {
  text: string;
  start: number;
  speed: number;
  last?: boolean;
}) {
  const chars = [...text];
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.map((ch, i) => {
          const end = i === chars.length - 1;
          const style = {
            "--d": `${start + i * speed}ms`,
            // The cursor waits on a line's last character until the next line starts.
            "--s": `${end ? speed + TYPE_PAUSE : speed}ms`,
          } as CSSProperties;
          return (
            <span key={i} className={`tw-char${end && last ? " tw-end" : ""}`} style={style}>
              {ch}
            </span>
          );
        })}
      </span>
    </>
  );
}
