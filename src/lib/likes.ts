import { useCallback, useEffect, useRef, useState } from "react";
import {
  firebaseConfigured,
  loadFirebase,
  signInAnonymouslyOnce,
  type FirebaseHandle,
} from "./firebase";

/**
 * The site's like counter, through Firebase Realtime Database. A visitor can like once every 24 hours.
 *
 * likes/total is the public count; likes/visitors/<uid> is when that visitor last liked. A like writes both in
 * one update, and database.rules.json only accepts it when the visitor's last like is over 24 hours old, judged
 * by the server's clock, so the limit holds even if someone edits the page's code in their browser.
 *
 * A visitor is their anonymous Firebase identity, which lives in one browser: clearing site data or switching
 * browsers makes a new visitor. The last like is also kept in localStorage, so the same browser stays locked
 * even after the visitor signs in with Google (which changes their identity).
 */
const DAY = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "keith_liked_at";
const TOTAL_PATH = "likes/total";
const VISITORS_PATH = "likes/visitors";

function readCachedAt() {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveCachedAt(at: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(at));
  } catch {
    /* storage blocked: the database still enforces the limit */
  }
}

export function useSiteLikes() {
  const [count, setCount] = useState<number | null>(null);
  const [reachable, setReachable] = useState(true);
  const [justLiked, setJustLiked] = useState(false);
  // When this visitor last liked, as each source knows it: this browser's own record, the database, and a like
  // that is still being sent. All start at 0 so the server render and first client render match.
  const [cachedAt, setCachedAt] = useState(0);
  const [remoteAt, setRemoteAt] = useState(0);
  const [pendingAt, setPendingAt] = useState(0);
  // Server clock minus this device's clock, so the 24 hours are counted the way the rules count them.
  const clockOffset = useRef(0);
  const firebase = useRef<Promise<FirebaseHandle | null> | null>(null);
  const sending = useRef(false);

  useEffect(() => {
    setCachedAt(readCachedAt());
    if (!firebaseConfigured) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    firebase.current = (async () => {
      const handle = await loadFirebase();
      if (disposed) return null;
      const { authLib, dbLib, auth, db } = handle;

      cleanups.push(
        dbLib.onValue(dbLib.ref(db, ".info/serverTimeOffset"), (snap) => {
          clockOffset.current = Number(snap.val()) || 0;
        }),
      );

      cleanups.push(
        dbLib.onValue(
          dbLib.ref(db, TOTAL_PATH),
          (snap) => setCount(Number(snap.val()) || 0),
          () => {
            // Most likely the likes rules aren't published yet. Better no button than one that can't work.
            setReachable(false);
            if (import.meta.env.DEV) {
              console.warn(
                `Likes: can't read ${TOTAL_PATH}. Publish database.rules.json in the Firebase console.`,
              );
            }
          },
        ),
      );

      // This visitor's last like, following their identity if it changes (Google sign-in, sign-out).
      let stopVisitor = () => {};
      cleanups.push(() => stopVisitor());
      cleanups.push(
        authLib.onAuthStateChanged(auth, (user) => {
          stopVisitor();
          stopVisitor = () => {};
          setRemoteAt(0);
          if (!user) {
            void signInAnonymouslyOnce(handle);
            return;
          }
          stopVisitor = dbLib.onValue(
            dbLib.ref(db, `${VISITORS_PATH}/${user.uid}`),
            (snap) => setRemoteAt(Number(snap.val()) || 0),
            () => {},
          );
        }),
      );
      return handle;
    })().catch(() => {
      setReachable(false);
      return null;
    });

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  /** True once the like is saved, false if it could not be; undefined when ignored (one is already being sent). */
  const like = useCallback(async (): Promise<boolean | undefined> => {
    if (sending.current) return undefined;
    sending.current = true;
    const at = Date.now() + clockOffset.current;
    // Show the like at once; the database's own listeners then confirm it, or roll it back if it is refused.
    setJustLiked(true);
    setPendingAt(at);
    try {
      if (firebaseConfigured) {
        const handle = await firebase.current;
        if (!handle) throw new Error("Firebase did not load");
        if (!handle.auth.currentUser) await signInAnonymouslyOnce(handle);
        const uid = handle.auth.currentUser?.uid;
        if (!uid) throw new Error("No visitor identity");
        const { dbLib, db } = handle;
        await dbLib.update(dbLib.ref(db), {
          [TOTAL_PATH]: dbLib.increment(1),
          [`${VISITORS_PATH}/${uid}`]: dbLib.serverTimestamp(),
        });
      }
      saveCachedAt(at);
      setCachedAt(at);
      return true;
    } catch {
      setPendingAt(0);
      setJustLiked(false);
      return false;
    } finally {
      sending.current = false;
    }
  }, []);

  const likedAt = Math.max(cachedAt, remoteAt, pendingAt);
  const liked = likedAt > 0 && Date.now() + clockOffset.current - likedAt < DAY;

  return {
    // Without the Firebase config the live site shows no button; local development shows a preview of it.
    available: firebaseConfigured ? reachable : import.meta.env.DEV,
    count: firebaseConfigured ? count : liked ? 1 : 0,
    liked,
    justLiked,
    like,
  };
}
