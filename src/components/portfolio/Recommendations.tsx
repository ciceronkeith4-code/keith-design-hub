import { useEffect, useState } from "react";
import { Pin, UserRound } from "lucide-react";
import { FaFacebook, FaGoogle } from "react-icons/fa6";
import { toast } from "sonner";
import { FACEBOOK_SIGN_IN } from "@/lib/firebase";
import { NOTE_MAX, useGuestbook, type Me, type Note } from "@/lib/guestbook";
import type { SignInProvider } from "@/lib/presence";

const MUTED = "text-[#62655E] dark:text-[#A3A3A3]";
const INK = "text-[#161616] dark:text-[#EDEDED]";
const SUBHEAD = "font-sans text-sm font-semibold text-[#161616] dark:text-[#EDEDED]";
const DIVIDER = "border-[#E5E5E0] dark:border-[#262626]";
const BOX = `rounded-[8px] border ${DIVIDER} bg-[#F6F7F4] dark:bg-[#141414]`;
const BUTTON =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-[6px] bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] hover:bg-[#2E2E2E] dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium transition-colors cursor-pointer";
const BUTTON_OUTLINE =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-[6px] border border-[#D9DBD4] dark:border-[#333333] bg-white dark:bg-[#1C1C1C] text-[#161616] dark:text-[#EDEDED] hover:bg-[#F0F1EE] dark:hover:bg-[#232323] px-4 py-2 text-sm font-medium transition-colors cursor-pointer";
const TEXT_LINK = `text-xs underline decoration-[#C9CCC4] underline-offset-2 hover:text-[#161616] dark:decoration-[#3A3A3A] dark:hover:text-[#EDEDED] cursor-pointer ${MUTED}`;

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** "3 minutes ago", "yesterday", "2 months ago". A clock slightly ahead of the server reads "just now". */
function ago(at: number) {
  const seconds = Math.min(0, Math.round((at - Date.now()) / 1000));
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function Avatar({ src, className = "" }: { src?: string; className?: string }) {
  return src ? (
    <img
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      className={`shrink-0 rounded-full object-cover bg-[#E1E4DD] ${className}`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`shrink-0 rounded-full flex items-center justify-center bg-[#E1E4DD] text-[#8A8D86] dark:bg-[#1F1F1F] dark:text-[#6B6B6B] ${className}`}
    >
      <UserRound className="h-1/2 w-1/2" />
    </span>
  );
}

interface ComposerProps {
  me: Me | null;
  hasNote: boolean;
  onPost: (text: string) => Promise<boolean>;
  onSignIn: (provider: SignInProvider) => void;
  onSignOut: () => void;
  onDeleteMine: () => Promise<void>;
}

function Composer({ me, hasNote, onPost, onSignIn, onSignOut, onDeleteMine }: ComposerProps) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  if (!me) {
    return (
      <div
        data-tour="recommendations-composer"
        className={`${BOX} p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6`}
      >
        <p className={`flex-1 text-sm leading-relaxed ${MUTED}`}>
          {FACEBOOK_SIGN_IN ? "Sign in" : "Sign in with Google"} to write one. Only your name and
          profile photo are shown.
        </p>
        <div className="self-start sm:self-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSignIn("google")}
            aria-label={FACEBOOK_SIGN_IN ? "Sign in with Google" : undefined}
            className={BUTTON}
          >
            <FaGoogle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{FACEBOOK_SIGN_IN ? "Google" : "Sign in with Google"}</span>
          </button>
          {FACEBOOK_SIGN_IN && (
            <button
              type="button"
              onClick={() => onSignIn("facebook")}
              aria-label="Sign in with Facebook"
              className={BUTTON_OUTLINE}
            >
              <FaFacebook className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Facebook</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const submit = async () => {
    if (busy || !text.trim()) return;
    setBusy(true);
    const saved = await onPost(text);
    setBusy(false);
    if (saved) setText("");
    else toast.error("Couldn't post your recommendation. Please try again.");
  };

  return (
    <div data-tour="recommendations-composer" className={`${BOX} p-4 sm:p-5 flex flex-col gap-3`}>
      <div className="flex items-center gap-2.5">
        <Avatar src={me.avatar} className="h-7 w-7" />
        <span className={`min-w-0 flex-1 truncate text-sm font-medium ${INK}`}>
          {me.name ?? "You"}
        </span>
        <button type="button" onClick={onSignOut} className={TEXT_LINK}>
          Sign out
        </button>
      </div>

      <div>
        <label htmlFor="recommendation-text" className="sr-only">
          Your recommendation
        </label>
        <textarea
          id="recommendation-text"
          rows={3}
          maxLength={NOTE_MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Enter posts; a recommendation is one paragraph, so Shift+Enter isn't needed.
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder="What was it like working with me, or what stood out to you?"
          className="w-full select-text resize-none rounded-[6px] border border-[#E5E5E0] dark:border-[#262626] bg-white dark:bg-[#1C1C1C] px-3 py-2 text-base sm:text-sm text-[#161616] dark:text-[#EDEDED] placeholder-[#71746C] dark:placeholder-[#8A8D86] focus:border-[#161616] dark:focus:border-[#EDEDED] focus:outline-none transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className={`whitespace-nowrap font-mono text-[11px] tabular-nums ${MUTED}`}>
          {text.length} / {NOTE_MAX}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy || !text.trim()}
          className={BUTTON}
        >
          {busy ? "Posting…" : hasNote ? "Replace mine" : "Post"}
        </button>
      </div>
      {hasNote && (
        <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${MUTED}`}>
          <span>Yours is in the list below. Posting again replaces it.</span>
          <DeleteButton label="Delete mine" onConfirm={onDeleteMine} />
        </p>
      )}
    </div>
  );
}

/**
 * A text button that asks once more before it deletes. `ariaLabel` is the longer name screen readers hear
 * (which recommendation it deletes); while it asks "Sure?", the visible words are the name.
 */
function DeleteButton({
  label,
  ariaLabel,
  onConfirm,
}: {
  label: string;
  ariaLabel?: string;
  onConfirm: () => Promise<void>;
}) {
  const [sure, setSure] = useState(false);
  return (
    <button
      type="button"
      aria-label={sure ? undefined : ariaLabel}
      onClick={() => {
        if (sure) void onConfirm();
        else setSure(true);
      }}
      onBlur={() => setSure(false)}
      className={`whitespace-nowrap text-xs underline underline-offset-2 cursor-pointer ${
        sure
          ? "text-red-600 decoration-red-300 dark:text-red-400 dark:decoration-red-800"
          : `decoration-[#C9CCC4] hover:text-[#161616] dark:decoration-[#3A3A3A] dark:hover:text-[#EDEDED] ${MUTED}`
      }`}
    >
      {sure ? "Sure? Delete" : label}
    </button>
  );
}

/** One recommendation: the words first, then who wrote it and when. */
function Recommendation({
  note,
  you,
  canDelete,
  onDelete,
  onPin,
}: {
  note: Note;
  you: boolean;
  canDelete: boolean;
  onDelete: () => Promise<void>;
  /** Owner only. */
  onPin?: () => void;
}) {
  const name = note.name ?? "Visitor";
  return (
    <li className={`py-5 first:pt-4 ${note.fresh ? "note-in" : ""}`}>
      <figure>
        {note.pinned && (
          <p className={`mb-2 inline-flex items-center gap-1 text-xs ${MUTED}`}>
            <Pin aria-hidden="true" className="h-3 w-3" />
            Pinned
          </p>
        )}
        {/* Visitors' words, shown as plain text: nothing here is ever treated as markup or a link. */}
        <blockquote
          className={`text-[15px] leading-relaxed ${INK} [overflow-wrap:anywhere] max-w-[62ch]`}
        >
          {note.message}
        </blockquote>
        <figcaption className="mt-3 flex items-center gap-2.5">
          <Avatar src={note.avatar} className="h-6 w-6" />
          <span className={`min-w-0 truncate text-sm font-medium ${INK}`}>{name}</span>
          {you && (
            <span className="shrink-0 rounded-full bg-black/5 px-1.5 py-px text-[11px] font-medium text-[#161616] dark:bg-white/10 dark:text-[#EDEDED]">
              You
            </span>
          )}
          <time
            dateTime={new Date(note.at).toISOString()}
            title={new Date(note.at).toLocaleString()}
            className={`shrink-0 text-xs ${MUTED}`}
          >
            {ago(note.at)}
          </time>
          {(onPin || canDelete) && (
            <span className="ml-auto shrink-0 flex items-center gap-3">
              {onPin && (
                <button
                  type="button"
                  onClick={onPin}
                  aria-label={`${note.pinned ? "Unpin" : "Pin"} recommendation by ${name}`}
                  className={`whitespace-nowrap ${TEXT_LINK}`}
                >
                  {note.pinned ? "Unpin" : "Pin"}
                </button>
              )}
              {canDelete && (
                <DeleteButton
                  label="Delete"
                  ariaLabel={`Delete recommendation by ${name}`}
                  onConfirm={onDelete}
                />
              )}
            </span>
          )}
        </figcaption>
      </figure>
    </li>
  );
}

/**
 * Recommendations from visitors signed in with Google, one each: the ones the owner pinned first, then newest
 * first. They are stored where the old guestbook kept its notes (src/lib/guestbook.ts), so every earlier note is
 * listed here.
 */
export function Recommendations() {
  // The list is live data, so it renders after mount only and never comes from the server.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { available, notes, me, canPin, post, remove, setPinned, signIn, signOut } = useGuestbook();

  const mine = me ? notes?.find((n) => n.uid === me.uid) : undefined;
  const deleteNote = (uid: string) => async () => {
    if (!(await remove(uid))) toast.error("Couldn't delete that recommendation. Please try again.");
  };
  const startSignIn = async (provider: SignInProvider) => {
    const brand = provider === "facebook" ? "Facebook" : "Google";
    // signIn() runs before the first await, so the sign-in window opens straight from the click.
    const result = await signIn(provider);
    if (result === "blocked") {
      toast.error(
        `Your browser blocked the ${brand} sign-in window. Allow pop-ups for this site, then try again.`,
      );
    } else if (result === "not-ready") {
      toast.error("Sign-in is still loading. Try again in a moment.");
    } else if (result === "failed") {
      toast.error(`Couldn't sign in with ${brand}. Please try again.`);
    } else if (result === "other-provider") {
      toast.error(
        `That email already signed in here with ${provider === "facebook" ? "Google" : "Facebook"}. Use that button instead.`,
      );
    } else if (result === "cancelled") {
      // Also what a pop-up blocker extension looks like: it closes the window the moment it opens.
      toast(
        `Sign-in closed before it finished. If no ${brand} window appeared, allow pop-ups for this site and try again.`,
      );
    }
  };
  const togglePin = async (note: Note) => {
    if (!(await setPinned(note, !note.pinned))) {
      toast.error(
        `Couldn't ${note.pinned ? "unpin" : "pin"} that recommendation. Please try again.`,
      );
    }
  };

  return (
    <div className="w-full max-w-[720px] flex flex-col text-left">
      <h1 className="font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
        Recommendations
      </h1>
      <p className={`mt-2 mb-6 sm:mb-8 text-sm ${MUTED}`}>
        From people who've worked with me or visited the site. They're public and show up here live.
      </p>

      {mounted && !available && (
        <p className={`text-sm ${MUTED}`}>
          Recommendations are offline right now. Please check back soon.
        </p>
      )}

      {mounted && available && (
        <>
          <Composer
            me={me}
            hasNote={Boolean(mine)}
            onPost={post}
            onSignIn={(provider) => void startSignIn(provider)}
            onSignOut={() => void signOut()}
            onDeleteMine={me ? deleteNote(me.uid) : async () => {}}
          />

          <section className="mt-10">
            <h2 className={`pb-2 border-b ${DIVIDER} ${SUBHEAD}`}>
              {notes === null
                ? "Recommendations"
                : `${notes.length} ${notes.length === 1 ? "recommendation" : "recommendations"}`}
            </h2>

            {notes === null ? (
              <p className={`pt-4 text-sm ${MUTED}`}>Loading…</p>
            ) : notes.length === 0 ? (
              <p data-tour="recommendations-empty" className={`pt-4 text-sm ${MUTED}`}>
                None yet. Be the first to write one.
              </p>
            ) : (
              <ul
                aria-label="Recommendations"
                data-tour="recommendations-list"
                className={`divide-y ${DIVIDER}`}
              >
                {notes.map((note) => (
                  <Recommendation
                    key={note.uid}
                    note={note}
                    you={note.uid === me?.uid}
                    canDelete={note.uid === me?.uid || Boolean(me?.owner)}
                    onDelete={deleteNote(note.uid)}
                    onPin={canPin ? () => void togglePin(note) : undefined}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
