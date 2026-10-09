import { lazy, Suspense, useEffect, useState } from "react";
import { Footprints } from "lucide-react";
import { setTourDone, tourDone } from "./tour/flags";

// The tour and its 3D engine load only when it starts, so the first page load stays light.
const Tour3D = lazy(() => import("./tour/Tour3D"));
// Delay after the page appears before the tour starts on a first visit, ms.
const AUTO_START = 1600;

/**
 * Starts the guided tour on a first visit (or with ?tour in the address), and shows the floating
 * "Tour again" button that clears the done flag and runs it from step 1.
 */
export function TourLauncher() {
  // 0 while no tour runs; each run gets a new number so it starts fresh.
  const [run, setRun] = useState(0);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).has("tour");
    if (tourDone() && !forced) return;
    const timer = window.setTimeout(() => setRun((n) => n + 1), AUTO_START);
    return () => window.clearTimeout(timer);
  }, []);

  const again = () => {
    setTourDone(false);
    setRun((n) => n + 1);
  };

  return (
    <>
      <button
        type="button"
        onClick={again}
        data-tour="tour-again"
        className="fixed bottom-[84px] right-3 z-[60] flex h-9 items-center gap-1.5 rounded-full border border-[#E5E5E0] bg-white/90 px-3 text-xs font-medium text-[#161616] shadow-md backdrop-blur transition-colors hover:bg-white md:bottom-5 md:right-5 dark:border-[#262626] dark:bg-[#141414]/90 dark:text-[#EDEDED] dark:hover:bg-[#1C1C1C]"
      >
        <Footprints className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Tour again</span>
      </button>
      {run > 0 && (
        <Suspense fallback={null}>
          <Tour3D key={run} onDone={() => setRun(0)} />
        </Suspense>
      )}
    </>
  );
}
