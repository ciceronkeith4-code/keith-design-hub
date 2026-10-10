import type { CSSProperties } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useSiteLikes } from "@/lib/likes";

// Six sparks around the heart, 60 degrees apart.
const SPARKS = [0, 60, 120, 180, 240, 300];

/**
 * "Like this website": one like per visitor every 24 hours (see lib/likes.ts). The animation is the
 * confirmation, so it plays only on the click itself, never when a returning visitor's like is restored.
 * Messages go in toasts, so nothing in the row moves when they appear.
 */
export function LikeButton() {
  const { available, count, liked, justLiked, like } = useSiteLikes();
  if (!available) return null;

  const onClick = async () => {
    if (liked) {
      toast("You already liked this today.", {
        description: "Come back tomorrow to like it again.",
      });
      return;
    }
    const saved = await like();
    if (saved)
      toast.success("Thanks for the like!", { description: "You can like again tomorrow." });
    else if (saved === false) toast.error("Couldn't save your like. Please try again.");
  };

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      aria-disabled={liked}
      title={
        liked ? "You liked this today. Come back tomorrow to like it again." : "Like this website"
      }
      // Once liked, the whole button (heart, label, sparks) goes muted gray: the heart takes the text color.
      className={`inline-flex items-center gap-2 rounded-md border border-[#E5E5E0] dark:border-[#262626] bg-white dark:bg-[#141414] px-3.5 py-2.5 text-sm font-medium transition-colors ${
        liked
          ? "cursor-default text-[#62655E] dark:text-[#A3A3A3]"
          : "cursor-pointer text-[#161616] dark:text-[#EDEDED] hover:bg-[#F6F7F4] dark:hover:bg-[#1C1C1C]"
      }`}
    >
      <span className="relative flex h-4 w-4 items-center justify-center" aria-hidden="true">
        <Heart
          className={`h-4 w-4 transition-[color,fill] duration-200 ${
            liked ? "fill-current" : "fill-transparent"
          } ${justLiked ? "like-pop" : ""}`}
        />
        {justLiked && (
          <span className="like-burst">
            {SPARKS.map((angle) => (
              <i key={angle} style={{ "--a": `${angle}deg` } as CSSProperties} />
            ))}
          </span>
        )}
      </span>
      <span>{liked ? "Liked" : "Like"}</span>
      {count ? (
        // Keyed by the number so it ticks in each time the count changes.
        <span
          key={count}
          className="like-count font-mono text-xs tabular-nums text-[#62655E] dark:text-[#A3A3A3]"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
