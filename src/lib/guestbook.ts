import { useCallback, useEffect, useRef, useState } from "react";
import { firebaseConfigured, loadFirebase, type FirebaseHandle } from "./firebase";
import { googleSignIn, googleSignOut } from "./presence";

/**
 * The guestbook, through Firebase Realtime Database: guestbook/<uid> holds one note per visitor.
 *
 * Only a visitor signed in with Google can write, and only under their own uid, so each person has at most one
 * note and can replace or delete it. database.rules.json also pins the name to the visitor's real Google name,
 * the photo to Google's image host, and the time to the server's clock, so a note can't pose as someone else.
 * The owner's Google account can delete any note.
 */
export const NOTE_MAX = 140;
// The newest notes shown.
const SHOWN = 60;
const PATH = "guestbook";
/** The owner's Google account. database.rules.json checks the same address; this one only shows the buttons. */
const OWNER_EMAIL = "ciceronkeith4@gmail.com";

export type Note = {
  uid: string;
  name?: string;
  avatar?: string;
  message: string;
  at: number;
  /** Arrived while the page was open, so it slides in. */
  fresh: boolean;
};
export type Me = { uid: string; name?: string; avatar?: string; owner: boolean };

const AGO = 60_000;
// Notes shown in local development when the Firebase config is missing, so the page can be tried without a database.
const PREVIEW_NOTES: Note[] = [
  {
    uid: "p1",
    name: "Ada Lovelace",
    message: "Clean site. The portrait is a great touch.",
    at: Date.now() - 3 * AGO,
    fresh: false,
  },
  {
    uid: "p2",
    name: "Grace Hopper",
    message: "Loved the case studies. Hire this person!",
    at: Date.now() - 95 * AGO,
    fresh: false,
  },
  {
    uid: "p3",
    name: "Linus T.",
    message: "Nice work on the POS system.",
    at: Date.now() - 26 * 60 * AGO,
    fresh: false,
  },
];

export function useGuestbook() {
  const preview = !firebaseConfigured;
  const [notes, setNotes] = useState<Note[] | null>(preview ? PREVIEW_NOTES : null);
  const [me, setMe] = useState<Me | null>(null);
  const [reachable, setReachable] = useState(true);
  const firebase = useRef<Promise<FirebaseHandle | null> | null>(null);

  useEffect(() => {
    if (!firebaseConfigured) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];
    // A note is "seen" by uid and text, so the server settling its timestamp doesn't count as a new note.
    let first = true;
    const seen = new Set<string>();
    const fresh = new Set<string>();

    firebase.current = (async () => {
      const handle = await loadFirebase();
      if (disposed) return null;
      const { authLib, dbLib, auth, db } = handle;

      const newest = dbLib.query(
        dbLib.ref(db, PATH),
        dbLib.orderByChild("at"),
        dbLib.limitToLast(SHOWN),
      );
      cleanups.push(
        dbLib.onValue(
          newest,
          (snap) => {
            const list: Note[] = [];
            snap.forEach((child) => {
              const v = child.val() as Partial<Note> | null;
              if (!child.key || !v || typeof v.message !== "string" || typeof v.at !== "number") {
                return;
              }
              const signature = `${child.key}:${v.message}`;
              if (!seen.has(signature)) {
                seen.add(signature);
                if (!first) fresh.add(signature);
              }
              list.push({
                uid: child.key,
                name: typeof v.name === "string" ? v.name : undefined,
                avatar:
                  typeof v.avatar === "string" && v.avatar.startsWith("https://")
                    ? v.avatar
                    : undefined,
                message: v.message,
                at: v.at,
                fresh: fresh.has(signature),
              });
            });
            first = false;
            setNotes(list.reverse());
          },
          () => {
            // Most likely the guestbook rules aren't published yet.
            setReachable(false);
            if (import.meta.env.DEV) {
              console.warn(
                `Guestbook: can't read ${PATH}. Publish database.rules.json in the Firebase console.`,
              );
            }
          },
        ),
      );

      // Only a Google identity can write; the anonymous one every visitor has just reads.
      cleanups.push(
        authLib.onAuthStateChanged(auth, (user) => {
          if (!user || user.isAnonymous) {
            setMe(null);
            return;
          }
          setMe({
            uid: user.uid,
            name: user.displayName ?? undefined,
            avatar: user.photoURL?.startsWith("https://") ? user.photoURL : undefined,
            owner: user.email === OWNER_EMAIL && user.emailVerified,
          });
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

  /** Saves this visitor's note, replacing their last one. True once saved. */
  const post = useCallback(
    async (message: string) => {
      const text = message.replace(/\s+/g, " ").trim().slice(0, NOTE_MAX);
      if (!text) return false;
      if (preview) {
        setNotes((list) => [
          { uid: "me", name: "Preview Visitor", message: text, at: Date.now(), fresh: true },
          ...(list ?? []).filter((n) => n.uid !== "me"),
        ]);
        return true;
      }
      try {
        const handle = await firebase.current;
        const user = handle?.auth.currentUser;
        if (!handle || !user || user.isAnonymous) return false;
        const entry: Record<string, unknown> = {
          message: text,
          at: handle.dbLib.serverTimestamp(),
        };
        if (user.displayName) entry.name = user.displayName.slice(0, 100);
        if (user.photoURL?.startsWith("https://")) entry.avatar = user.photoURL;
        await handle.dbLib.set(handle.dbLib.ref(handle.db, `${PATH}/${user.uid}`), entry);
        return true;
      } catch {
        return false;
      }
    },
    [preview],
  );

  /** Deletes a note: a visitor's own, or any note for the owner. True once deleted. */
  const remove = useCallback(
    async (uid: string) => {
      if (preview) {
        setNotes((list) => (list ?? []).filter((n) => n.uid !== uid));
        return true;
      }
      try {
        const handle = await firebase.current;
        if (!handle) return false;
        await handle.dbLib.remove(handle.dbLib.ref(handle.db, `${PATH}/${uid}`));
        return true;
      } catch {
        return false;
      }
    },
    [preview],
  );

  const signIn = useCallback(async () => {
    if (preview) {
      const owner = new URLSearchParams(window.location.search).has("owner");
      setMe({ uid: "me", name: "Preview Visitor", owner });
      return;
    }
    await googleSignIn();
  }, [preview]);

  const signOut = useCallback(async () => {
    if (preview) {
      setMe(null);
      return;
    }
    await googleSignOut();
  }, [preview]);

  return {
    // Without the Firebase config the live site shows no guestbook; local development shows a preview of it.
    available: firebaseConfigured ? reachable : import.meta.env.DEV,
    notes,
    me,
    post,
    remove,
    signIn,
    signOut,
  };
}
