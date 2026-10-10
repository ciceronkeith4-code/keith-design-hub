import { useEffect, useState } from "react";
import { Trash2, UserRound } from "lucide-react";
import { FaGoogle } from "react-icons/fa6";
import { toast } from "sonner";
import { NOTE_MAX, useGuestbook, type Me, type Note } from "@/lib/guestbook";

const MUTED = "text-[#62655E] dark:text-[#A3A3A3]";
const LABEL = `font-mono text-[10px] uppercase tracking-wider ${MUTED}`;
const CARD =
  "rounded-[16px] sm:rounded-[20px] border border-[#E5E5E0] dark:border-[#262626] bg-[#F6F7F4] dark:bg-[#141414]";

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
  onSignIn: () => void;
  onSignOut: () => void;
  onDeleteMine: () => Promise<void>;
}

function Composer({ me, hasNote, onPost, onSignIn, onSignOut, onDeleteMine }: ComposerProps) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  if (!me) {
    return (
      <div className={`${CARD} p-5 sm:p-6 flex flex-col items-start gap-4`}>
        <p className={`text-sm ${MUTED}`}>
          Sign in with Google to leave a note. It shows your name and profile photo, nothing else
          from your account.
        </p>
        <button
          type="button"
          onClick={onSignIn}
          className="inline-flex items-center gap-2 rounded-md bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] hover:bg-[#2E2E2E] dark:hover:bg-white px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
        >
          <FaGoogle className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Sign in with Google</span>
        </button>
      </div>
    );
  }

  const submit = async () => {
    if (busy || !text.trim()) return;
    setBusy(true);
    const saved = await onPost(text);
    setBusy(false);
    if (saved) setText("");
    else toast.error("Couldn't post your note. Please try again.");
  };

  return (
    <div className={`${CARD} p-5 sm:p-6 flex flex-col gap-3`}>
      <div className="flex items-center gap-2.5">
        <Avatar src={me.avatar} className="h-7 w-7" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#161616] dark:text-[#EDEDED]">
          {me.name ?? "You"}
        </span>
        <button
          type="button"
          onClick={onSignOut}
          className={`text-xs underline decoration-[#C9CCC4] underline-offset-2 hover:text-[#161616] dark:decoration-[#3A3A3A] dark:hover:text-[#EDEDED] cursor-pointer ${MUTED}`}
        >
          Sign out
        </button>
      </div>

      <div>
        <label htmlFor="guestbook-note" className="sr-only">
          Your note
        </label>
        <textarea
          id="guestbook-note"
          rows={3}
          maxLength={NOTE_MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Enter posts; a note is one paragraph, so Shift+Enter isn't needed.
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder="Say hi, share feedback, or tell me what you liked."
          className="w-full select-text resize-none rounded-[8px] border border-[#E5E5E0] dark:border-[#262626] bg-white dark:bg-[#1C1C1C] px-3 py-2 text-base sm:text-sm text-[#161616] dark:text-[#EDEDED] placeholder-[#71746C] dark:placeholder-[#8A8D86] focus:border-[#161616] dark:focus:border-[#EDEDED] focus:outline-none transition-colors"
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
          className="inline-flex items-center whitespace-nowrap rounded-md bg-[#161616] text-white dark:bg-[#EDEDED] dark:text-[#161616] hover:bg-[#2E2E2E] dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
        >
          {busy ? "Posting…" : hasNote ? "Replace my note" : "Post note"}
        </button>
      </div>
      {hasNote && (
        <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${MUTED}`}>
          <span>You already have a note below. Posting again replaces it.</span>
          <DeleteButton label="Delete my note" onConfirm={onDeleteMine} />
        </p>
      )}
    </div>
  );
}

/**
 * A text button that asks once more before it deletes. `ariaLabel` is the longer name screen readers hear
 * (which note it deletes); while it asks "Sure?", the visible words are the name.
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

function NoteCard({
  note,
  you,
  canDelete,
  onDelete,
}: {
  note: Note;
  you: boolean;
  canDelete: boolean;
  onDelete: () => Promise<void>;
}) {
  const name = note.name ?? "Visitor";
  return (
    <li
      className={`flex gap-3 rounded-[12px] border border-[#E5E5E0] dark:border-[#262626] bg-white dark:bg-[#141414] p-4 ${
        note.fresh ? "note-in" : ""
      }`}
    >
      <Avatar src={note.avatar} className="h-9 w-9" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="min-w-0 truncate text-sm font-medium text-[#161616] dark:text-[#EDEDED]">
            {name}
          </span>
          {you && (
            <span className="shrink-0 rounded-full bg-black/5 px-1.5 py-px font-mono text-[10px] text-[#161616] dark:bg-white/10 dark:text-[#EDEDED]">
              You
            </span>
          )}
          <time
            dateTime={new Date(note.at).toISOString()}
            title={new Date(note.at).toLocaleString()}
            className={`shrink-0 font-mono text-[11px] ${MUTED}`}
          >
            {ago(note.at)}
          </time>
          {canDelete && (
            <span className="ml-auto shrink-0">
              <DeleteButton
                label="Delete"
                ariaLabel={`Delete note by ${name}`}
                onConfirm={onDelete}
              />
            </span>
          )}
        </div>
        {/* Visitors' words, shown as plain text: nothing here is ever treated as markup or a link. */}
        <p className="mt-1 text-sm leading-relaxed text-[#161616] dark:text-[#EDEDED] [overflow-wrap:anywhere]">
          {note.message}
        </p>
      </div>
    </li>
  );
}

export function Guestbook() {
  // The notes are live data, so they render after mount only and never come from the server.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { available, notes, me, post, remove, signIn, signOut } = useGuestbook();

  const mine = me ? notes?.find((n) => n.uid === me.uid) : undefined;
  const deleteNote = (uid: string) => async () => {
    if (!(await remove(uid))) toast.error("Couldn't delete that note. Please try again.");
  };

  return (
    <div className="w-full max-w-[640px] flex flex-col text-left">
      <h1 className="font-sans text-[clamp(26px,3.5vh,36px)] font-semibold tracking-tight text-[#161616] dark:text-[#EDEDED] leading-tight">
        Guestbook
      </h1>
      <p className={`mt-2 mb-6 sm:mb-8 text-sm ${MUTED}`}>
        Leave a note, a hello, or some feedback. Notes are public and show up here live.
      </p>

      {mounted && !available && (
        <p className={`text-sm ${MUTED}`}>
          The guestbook is offline right now. Please check back soon.
        </p>
      )}

      {mounted && available && (
        <>
          <Composer
            me={me}
            hasNote={Boolean(mine)}
            onPost={post}
            onSignIn={() => void signIn()}
            onSignOut={() => void signOut()}
            onDeleteMine={me ? deleteNote(me.uid) : async () => {}}
          />

          <h2 className={`mt-8 mb-3 ${LABEL}`}>
            {notes === null ? "Notes" : `${notes.length} ${notes.length === 1 ? "note" : "notes"}`}
          </h2>

          {notes === null ? (
            <p className={`text-sm ${MUTED}`}>Loading notes…</p>
          ) : notes.length === 0 ? (
            <p className={`text-sm ${MUTED}`}>No notes yet. Be the first to sign it.</p>
          ) : (
            <ul aria-label="Guestbook notes" className="flex flex-col gap-3">
              {notes.map((note) => (
                <NoteCard
                  key={note.uid}
                  note={note}
                  you={note.uid === me?.uid}
                  canDelete={note.uid === me?.uid || Boolean(me?.owner)}
                  onDelete={deleteNote(note.uid)}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
