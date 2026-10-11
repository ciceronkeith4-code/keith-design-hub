import { useCallback, useEffect, useRef, useState } from "react";
import { Footprints } from "lucide-react";
import SpotlightTour from "./tour/SpotlightTour";
import { setTourDone, tourDone } from "./tour/flags";

// How long a first-time visitor reads the page before the tour is offered, ms. The hero finishes typing by then.
const INVITE_AFTER = 7000;

const CARD =
  "fixed bottom-[84px] right-3 z-[60] md:bottom-5 md:right-5 border border-[#E5E5E0] bg-white shadow-md dark:border-[#262626] dark:bg-[#141414]";

/**
 * Offers the guided tour to a first-time visitor (never starts it by itself), and keeps a small "Tour" button
 * for anyone who wants it later. `?tour` in the address starts it straight away.
 */
export function TourLauncher() {
  const [running, setRunning] = useState(false);
  const [invite, setInvite] = useState(false);
  const pill = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("tour")) {
      setRunning(true);
      return;
    }
    if (tourDone()) return;
    const timer = window.setTimeout(() => setInvite(true), INVITE_AFTER);
    return () => window.clearTimeout(timer);
  }, []);

  const start = () => {
    setInvite(false);
    setRunning(true);
  };

  // Not now, Skip, Escape and Done all count: the visitor has seen the offer, so it doesn't come back.
  const dismiss = () => {
    setTourDone(true);
    setInvite(false);
  };

  const finish = useCallback(() => {
    setTourDone(true);
    setRunning(false);
    requestAnimationFrame(() => pill.current?.focus());
  }, []);

  return (
    <>
      {invite ? (
        <div
          role="region"
          aria-label="Site tour"
          className={`${CARD} tour-bubble w-[260px] max-w-[calc(100vw-24px)] rounded-xl p-3.5`}
        >
          <p className="text-sm font-medium text-[#161616] dark:text-[#EDEDED]">
            Take a tour of the whole site?
          </p>
          <p className="mt-0.5 text-xs text-[#62655E] dark:text-[#A3A3A3]">
            It stops at every page. You can skip it any time.
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="h-9 rounded-md px-3 text-sm text-[#62655E] hover:text-[#161616] dark:text-[#A3A3A3] dark:hover:text-[#EDEDED] cursor-pointer"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={start}
              className="h-9 rounded-md bg-[#161616] px-4 text-sm font-medium text-white hover:bg-[#333333] dark:bg-[#EDEDED] dark:text-[#161616] dark:hover:bg-white cursor-pointer"
            >
              Start
            </button>
          </div>
        </div>
      ) : (
        <button
          ref={pill}
          type="button"
          onClick={start}
          aria-label="Take the site tour"
          className={`${CARD} flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-[#161616] backdrop-blur transition-colors hover:bg-white dark:text-[#EDEDED] dark:hover:bg-[#1C1C1C] cursor-pointer`}
        >
          <Footprints className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Tour</span>
        </button>
      )}
      {running && <SpotlightTour onDone={finish} />}
    </>
  );
}
