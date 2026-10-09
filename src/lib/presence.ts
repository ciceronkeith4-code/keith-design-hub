import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Who is on the site right now, through Firebase Realtime Database presence.
 *
 * Every visitor is signed in anonymously (invisible to them) so the database rules can limit each visitor to
 * writing only their own entry. Each open tab adds a connection under presence/<uid>/, which Firebase deletes
 * by itself when the tab closes or drops offline; a visitor counts once however many tabs they have open.
 * A visitor who signs in with Google also shares their Google name and profile photo, nothing else.
 *
 * Needs the VITE_FIREBASE_* web config (in .env.local, and in Vercel for the live site). Firebase is loaded
 * only after the page is up, so it adds nothing to the first load.
 */
const CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};
const PRESENCE_PATH = "presence";

export const presenceConfigured = Boolean(CONFIG.apiKey && CONFIG.databaseURL && CONFIG.authDomain);

export type Viewer = { id: string; name?: string; avatar?: string; you: boolean };
type Profile = { name?: string; avatar?: string };
type Connection = Profile & { at?: number };

/** The live viewer list (Google profiles first) and this visitor's Google sign-in state. */
export function useLiveViewers() {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [connected, setConnected] = useState(false);
  // Set once Firebase has loaded: the sign-in and sign-out actions.
  const actions = useRef<{ signIn: () => Promise<void>; signOut: () => Promise<void> } | null>(
    null,
  );

  useEffect(() => {
    if (!presenceConfigured) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    void (async () => {
      const [{ initializeApp, getApps }, authLib, dbLib] = await Promise.all([
        import("firebase/app"),
        import("firebase/auth"),
        import("firebase/database"),
      ]);
      if (disposed) return;
      const app = getApps()[0] ?? initializeApp(CONFIG);
      const auth = authLib.getAuth(app);
      const db = dbLib.getDatabase(app);

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
            void authLib.signInAnonymously(auth).catch(() => {});
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

      actions.current = {
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
    })();

    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  const signIn = useCallback(() => actions.current?.signIn(), []);
  const signOut = useCallback(() => actions.current?.signOut(), []);

  return { viewers, signedIn, connected, signIn, signOut };
}
