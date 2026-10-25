import { useEffect, useState } from "react";
import { firebaseConfigured, loadFirebase, signInAnonymouslyOnce } from "./firebase";

/**
 * Who is on the site right now, through Firebase Realtime Database presence.
 *
 * Every visitor is signed in anonymously (invisible to them) so the database rules can limit each visitor to
 * writing only their own entry. Each open tab adds a connection under presence/<uid>/, which Firebase deletes
 * by itself when the tab closes or drops offline; a visitor counts once however many tabs they have open.
 * A visitor who signs in with Google also shares their Google name and profile photo, nothing else.
 *
 * The Firebase app and its web config are in ./firebase.
 */
const PRESENCE_PATH = "presence";

export const presenceConfigured = firebaseConfigured;

export type Viewer = { id: string; name?: string; avatar?: string; you: boolean };
type Profile = { name?: string; avatar?: string };
type Connection = Profile & { at?: number };

// The Google sign-in and sign-out, set once Firebase has loaded. They live at module level so other features
// that need a Google identity (Recommendations) go through the same code: it moves this visitor's presence entry
// to the new identity, which a second sign-in path would leave behind.
let shared: { signIn: () => Promise<void>; signOut: () => Promise<void> } | null = null;

export const googleSignIn = () => shared?.signIn();
export const googleSignOut = () => shared?.signOut();

/** The live viewer list (Google profiles first) and this visitor's Google sign-in state. */
export function useLiveViewers() {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!presenceConfigured) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    void (async () => {
      const firebase = await loadFirebase();
      if (disposed) return;
      const { authLib, dbLib, auth, db } = firebase;

      // This tab's connection entry, re-created whenever the visitor's identity or connection changes.
      let connection: ReturnType<typeof dbLib.push> | null = null;
      let online = false;
      const leave = async () => {
        const current = connection;
        connection = null;
        if (current) await dbLib.remove(current).catch(() => {});
      };
      const join = async () => {
        const user = auth.currentUser;
        if (!user || !online || connection) return;
        const google = !user.isAnonymous;
        const entry: Connection = { at: Date.now() };
        if (google && user.displayName) entry.name = user.displayName.slice(0, 80);
        if (google && user.photoURL?.startsWith("https://")) entry.avatar = user.photoURL;
        const ref = dbLib.push(dbLib.ref(db, `${PRESENCE_PATH}/${user.uid}`));
        connection = ref;
        await dbLib.onDisconnect(ref).remove();
        await dbLib.set(ref, entry);
      };

      cleanups.push(
        dbLib.onValue(dbLib.ref(db, ".info/connected"), (snap) => {
          online = snap.val() === true;
          setConnected(online);
          // After a reconnect the server has already run onDisconnect, so a fresh entry is needed.
          if (online) {
            connection = null;
            void join();
          }
        }),
      );

      cleanups.push(
        authLib.onAuthStateChanged(auth, (user) => {
          if (!user) {
            // Everyone gets an anonymous identity, so the rules can tell visitors apart.
            void signInAnonymouslyOnce(firebase);
            return;
          }
          setSignedIn(!user.isAnonymous);
          void join();
        }),
      );

      cleanups.push(
        dbLib.onValue(dbLib.ref(db, PRESENCE_PATH), (snap) => {
          const all = (snap.val() ?? {}) as Record<string, Record<string, Connection>>;
          const me = auth.currentUser?.uid;
          const list: Viewer[] = Object.entries(all).map(([id, connections]) => {
            const first = Object.values(connections)[0] ?? {};
            return { id, name: first.name, avatar: first.avatar, you: id === me };
          });
          list.sort(
            (a, b) =>
              Number(Boolean(b.avatar)) - Number(Boolean(a.avatar)) ||
              Number(b.you) - Number(a.you),
          );
          setViewers(list);
        }),
      );

      shared = {
        signIn: async () => {
          await leave();
          try {
            await authLib.signInWithPopup(auth, new authLib.GoogleAuthProvider());
          } catch {
            // Popup closed or blocked: carry on as the anonymous visitor.
          }
          await join();
        },
        signOut: async () => {
          await leave();
          // onAuthStateChanged then signs back in anonymously and re-joins.
          await authLib.signOut(auth);
        },
      };
      cleanups.push(() => void leave());
      cleanups.push(() => {
        shared = null;
      });
    })();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return { viewers, signedIn, connected, signIn: googleSignIn, signOut: googleSignOut };
}
