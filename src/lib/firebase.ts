/**
 * The one Firebase app behind the site's live features (the "viewing now" list and the like button).
 *
 * Needs the VITE_FIREBASE_* web config (in .env.local, and in Vercel for the live site). It is public by
 * design; database.rules.json is what limits each visitor. Firebase is loaded only after the page is up, so it
 * adds nothing to the first load.
 */
const CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseConfigured = Boolean(CONFIG.apiKey && CONFIG.databaseURL && CONFIG.authDomain);

/**
 * Facebook as a second way to sign in. Turn on only once Facebook is enabled under Authentication → Sign-in method
 * in the Firebase console (that needs a Meta app) and the current database.rules.json is published; until then the
 * button stays hidden.
 */
export const FACEBOOK_SIGN_IN = false;

export type FirebaseHandle = Awaited<ReturnType<typeof loadFirebase>>;

/** Loads the Firebase libraries and returns the shared app's auth and database, with the libraries themselves. */
export async function loadFirebase() {
  const [{ initializeApp, getApps }, authLib, dbLib] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
    import("firebase/database"),
  ]);
  const app = getApps()[0] ?? initializeApp(CONFIG);
  return { authLib, dbLib, auth: authLib.getAuth(app), db: dbLib.getDatabase(app) };
}

let anonymousSignIn: Promise<unknown> | null = null;

/**
 * Gives a visitor with no identity an anonymous one. Callers that ask at the same moment share one request:
 * Firebase would otherwise create a separate anonymous account for each, and the loser's uid would be orphaned.
 */
export function signInAnonymouslyOnce({ auth, authLib }: Pick<FirebaseHandle, "auth" | "authLib">) {
  anonymousSignIn ??= authLib
    .signInAnonymously(auth)
    .catch(() => {})
    .finally(() => {
      anonymousSignIn = null;
    });
  return anonymousSignIn;
}
