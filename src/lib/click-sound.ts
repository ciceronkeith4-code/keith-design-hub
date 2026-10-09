/**
 * Soft UI click sounds, synthesized with the Web Audio API so there are no audio files to load.
 * Each visitor's on/off choice is kept in localStorage (on by default).
 */
const STORAGE_KEY = "keith_sound";

/** Clicks on these play the sound. */
export const CLICKABLE =
  'a[href], button, [role="button"], summary, label, select, input[type="checkbox"], input[type="radio"], input[type="submit"]';

let context: AudioContext | null = null;

export function readSoundOn() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function saveSoundOn(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
}

/** "tap" is the everyday click; "on" is the slightly brighter blip when sounds are switched back on. */
export function playClick(kind: "tap" | "on" = "tap") {
  try {
    const Context =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;
    // Browsers only allow audio after a user gesture, which a click always is.
    const ctx = (context ??= new Context());
    if (ctx.state === "suspended") {
      void ctx.resume().then(() => scheduleClick(ctx, kind, ctx.currentTime));
    } else {
      scheduleClick(ctx, kind, ctx.currentTime);
    }
  } catch {
    /* no audio available: clicks just stay silent */
  }
}

/**
 * The click itself, on any audio context (live, or offline for testing) at time `t`. Pitched around 2 kHz,
 * where laptop and phone speakers are loudest, and layered: a square wave for a crisp edge over a sine for
 * body. The layers sum to just under full scale, so it is as loud as it can be without clipping.
 */
export function scheduleClick(ctx: BaseAudioContext, kind: "tap" | "on", t: number) {
  // A quick pitch drop reads as a "tick"; a rise reads as "on".
  const sound =
    kind === "on"
      ? { length: 0.1, glide: 0.06, square: [1300, 2100], sine: [1300, 2100] }
      : { length: 0.06, glide: 0.03, square: [2600, 1900], sine: [2000, 1500] };
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.9, t + 0.002);
  out.gain.exponentialRampToValueAtTime(0.0001, t + sound.length);
  out.connect(ctx.destination);
  const layer = (type: OscillatorType, [from, to]: number[], level: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + sound.glide);
    gain.gain.value = level;
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + sound.length + 0.01);
  };
  layer("square", sound.square, kind === "on" ? 0.2 : 0.35);
  layer("sine", sound.sine, kind === "on" ? 0.7 : 0.6);
}
