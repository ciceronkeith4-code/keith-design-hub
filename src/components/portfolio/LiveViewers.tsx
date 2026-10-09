import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { presenceConfigured, useLiveViewers, type Viewer } from "@/lib/presence";

// Avatars shown before the rest collapse into "+N".
const MAX_AVATARS = 5;
const MUTED = "text-[#62655E] dark:text-[#A3A3A3]";
const RING = "ring-2 ring-[#ECEEEA] dark:ring-[#0A0A0A]";

/**
 * "N people viewing now" at the foot of the sidebar. Viewers signed in with Google show their profile photo,
 * everyone else a plain icon. The avatars are display only; the one link signs this visitor in or out.
 */
export function LiveViewers({ className = "" }: { className?: string }) {
  // Rendered after mount only: the list is live data, so it never comes from the server.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { viewers, signedIn, connected, signIn, signOut } = useLiveViewers();

  if (!mounted) return null;
  // Without the Firebase config the live site shows nothing; local development shows a preview of the layout.
  if (!presenceConfigured && !import.meta.env.DEV) return null;
  const list: Viewer[] = presenceConfigured ? viewers : [{ id: "preview", you: true }];
  if (presenceConfigured && !connected) return null;

  const shown = list.slice(0, MAX_AVATARS);
  const extra = list.length - shown.length;

  return (
    <section
      aria-label="People viewing now"
      className={`flex-col gap-2 border-t border-[#E5E5E0] pt-4 dark:border-[#262626] ${className}`}
    >
      <div className="flex items-center pl-1.5" aria-hidden="true">
        {shown.map((v) =>
          v.avatar ? (
            <img
              key={v.id}
              src={v.avatar}
              alt=""
              title={v.you ? "You" : v.name}
              referrerPolicy="no-referrer"
              className={`-ml-1.5 h-7 w-7 rounded-full object-cover bg-[#E1E4DD] ${RING}`}
            />
          ) : (
            <span
              key={v.id}
              title={v.you ? "You" : "Visitor"}
              className={`-ml-1.5 h-7 w-7 rounded-full flex items-center justify-center bg-[#E1E4DD] text-[#8A8D86] dark:bg-[#1F1F1F] dark:text-[#6B6B6B] ${RING}`}
            >
              <UserRound className="h-3.5 w-3.5" />
            </span>
          ),
        )}
        {extra > 0 && (
          <span
            className={`-ml-1.5 h-7 min-w-7 px-1 rounded-full flex items-center justify-center bg-[#E1E4DD] font-mono text-[10px] text-[#161616] dark:bg-[#1F1F1F] dark:text-[#EDEDED] ${RING}`}
          >
            +{extra}
          </span>
        )}
      </div>

      <p className={`text-[11px] ${MUTED}`} role="status">
        <span className="font-mono font-semibold text-[#161616] dark:text-[#EDEDED]">
          {list.length}
        </span>{" "}
        {list.length === 1 ? "person" : "people"} viewing now
      </p>

      {presenceConfigured ? (
        <button
          type="button"
          onClick={() => void (signedIn ? signOut() : signIn())}
          className={`self-start text-left text-[11px] underline decoration-[#C9CCC4] underline-offset-2 hover:text-[#161616] dark:decoration-[#3A3A3A] dark:hover:text-[#EDEDED] ${MUTED}`}
        >
          {signedIn ? "Hide my photo (sign out)" : "Sign in with Google to show your photo"}
        </button>
      ) : (
        <p className={`text-[10px] ${MUTED}`}>Preview: add the Firebase config to go live.</p>
      )}
    </section>
  );
}
