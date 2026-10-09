/** Set once a visitor finishes or skips the tour, so it doesn't start on its own again. */
export const TOUR_DONE_KEY = "tourDone";

export function tourDone() {
  try {
    return localStorage.getItem(TOUR_DONE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setTourDone(done: boolean) {
  try {
    if (done) localStorage.setItem(TOUR_DONE_KEY, "1");
    else localStorage.removeItem(TOUR_DONE_KEY);
  } catch {
    /* storage blocked: the tour may start again next visit */
  }
}
