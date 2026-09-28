/**
 * Captures each project's live site full-page at the three preview viewports (see DEVICES in
 * src/lib/projects.ts) and saves them as public/images/projects/<slug>/<device>-1.webp.
 *
 *   node --experimental-strip-types scripts/capture-screens.mjs                 every live project
 *   node --experimental-strip-types scripts/capture-screens.mjs one-cainta ...  only these slugs
 *   ... --device=tablet                                                          only these devices
 *
 * No dependencies: it drives a local Chrome or Edge over the DevTools protocol (set CHROME_PATH
 * if yours is somewhere unusual). The flag lets Node 22 import the TypeScript data file.
 * Extra screens (<device>-2.webp, …) can be added by hand; list them in the project's `screens`.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEVICES, PROJECTS } from "../src/lib/projects.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images", "projects");

// The phone is captured at 2x so it stays sharp in the lightbox; the others are wide enough at 1x.
const SCALE = { desktop: 1, tablet: 1, mobile: 2 };
// Chrome can't encode a WebP taller than 16383 px.
const MAX_PIXELS = 16000;

const BROWSERS = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Overlays that never clear in a headless browser (splash screens, cookie banners, chat widgets),
// hidden per project by CSS selector.
const HIDE = {
  "nclex-amplified-interns": ["#page-intro-overlay"],
  "jpcs-sscr-manila": [".site-intro-overlay"],
};

// Runs before the site's own scripts: every observed element reports as on screen, so
// scroll-reveal sections render and lazy content loads even below the fold of a full-page shot.
const SHOW_EVERYTHING = `window.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; }
  observe(target) {
    const rect = target.getBoundingClientRect();
    setTimeout(() => this.callback([{ target, isIntersecting: true, intersectionRatio: 1,
      boundingClientRect: rect, intersectionRect: rect, rootBounds: null, time: performance.now() }], this));
  }
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};`;

// Applied just before capturing, so nothing is caught halfway through a transition.
const FREEZE_MOTION = `(() => {
  const style = document.createElement("style");
  style.textContent = "*, *::before, *::after { transition: none !important; animation-delay: 0s !important; animation-duration: 0s !important; }";
  document.head.append(style);
})()`;

async function launchBrowser() {
  const executable = BROWSERS.find((p) => p && existsSync(p));
  if (!executable) throw new Error("No Chrome or Edge found. Set CHROME_PATH to one.");

  const profile = await mkdtemp(path.join(tmpdir(), "capture-screens-"));
  const proc = spawn(
    executable,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  // Chrome writes the port it picked to this file once it's listening.
  const portFile = path.join(profile, "DevToolsActivePort");
  let port = "";
  for (let i = 0; i < 150 && !port; i++) {
    if (existsSync(portFile)) port = (await readFile(portFile, "utf8")).split("\n")[0].trim();
    if (!port) await sleep(100);
  }
  if (!port) throw new Error("The browser didn't start.");

  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const cdp = await connect(version.webSocketDebuggerUrl);

  return {
    cdp,
    async close() {
      cdp.close();
      proc.kill();
      await sleep(500);
      await rm(profile, { recursive: true, force: true }).catch(() => {});
    },
  };
}

/** A minimal DevTools protocol client over the WebSocket built into Node 22. */
function connect(url) {
  const ws = new WebSocket(url);
  const pending = new Map();
  const listeners = new Set();
  let nextId = 0;

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id !== undefined) {
      const call = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) call.reject(new Error(`${call.method}: ${message.error.message}`));
      else call.resolve(message.result);
    } else {
      for (const listener of listeners) listener(message);
    }
  });

  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject, method });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });

  const waitFor = (method, sessionId) =>
    new Promise((resolve) => {
      const listener = (message) => {
        if (message.method === method && message.sessionId === sessionId) {
          listeners.delete(listener);
          resolve(message.params);
        }
      };
      listeners.add(listener);
    });

  return new Promise((resolve, reject) => {
    ws.addEventListener("open", () => resolve({ send, waitFor, close: () => ws.close() }));
    ws.addEventListener("error", () => reject(new Error("Couldn't connect to the browser.")));
  });
}

async function capture(cdp, url, device, hide = []) {
  const { width, height } = DEVICES[device];
  const scale = SCALE[device];
  const touch = device !== "desktop";

  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => cdp.send(method, params, sessionId);

  try {
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: scale,
      mobile: touch,
    });
    await send("Emulation.setTouchEmulationEnabled", { enabled: touch });
    // Reduced motion makes most sites skip entrance animations, so nothing is caught mid-fade.
    await send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "prefers-color-scheme", value: "light" },
      ],
    });

    await send("Page.addScriptToEvaluateOnNewDocument", { source: SHOW_EVERYTHING });

    const loaded = cdp.waitFor("Page.loadEventFired", sessionId);
    await send("Page.navigate", { url });
    await Promise.race([loaded, sleep(30_000)]);
    // Time for single-page apps to render and splash screens to clear.
    await sleep(5000);
    if (hide.length > 0) {
      const css = `${hide.join(", ")} { display: none !important; } html { overflow: auto !important; } body { overflow: visible !important; }`;
      await send("Runtime.evaluate", {
        expression: `document.head.append(Object.assign(document.createElement("style"), { textContent: ${JSON.stringify(css)} }))`,
      });
    }

    // Scroll to the bottom and back so anything that loads on scroll does, then wait for fonts
    // (icon fonts otherwise show as their ligature names).
    await send("Runtime.evaluate", {
      awaitPromise: true,
      expression: `(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.75) {
          scrollTo(0, y);
          await wait(250);
        }
        scrollTo(0, 0);
        await document.fonts.ready;
        await wait(2000);
      })()`,
    });
    await send("Runtime.evaluate", { expression: FREEZE_MOTION });
    await sleep(300);

    const { cssContentSize } = await send("Page.getLayoutMetrics");
    const pageHeight = Math.min(Math.ceil(cssContentSize.height), Math.floor(MAX_PIXELS / scale));
    const { data } = await send("Page.captureScreenshot", {
      format: "webp",
      quality: 80,
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: pageHeight, scale: 1 },
    });
    return Buffer.from(data, "base64");
  } finally {
    await cdp.send("Target.closeTarget", { targetId });
  }
}

const args = process.argv.slice(2);
const only = args.filter((a) => !a.startsWith("--"));
const deviceArg = args.find((a) => a.startsWith("--device="))?.slice("--device=".length);
const devices = deviceArg ? deviceArg.split(",") : Object.keys(DEVICES);
// Projects without a live link, or whose `screens` are empty (e.g. a broken deploy), are skipped.
const projects = PROJECTS.filter(
  (p) =>
    p.links.live &&
    Object.values(p.screens).some((list) => list.length > 0) &&
    (only.length === 0 || only.includes(p.slug)),
);
if (projects.length === 0) {
  console.error("No matching projects with a live link.");
  process.exit(1);
}

const browser = await launchBrowser();
let failures = 0;
try {
  for (const project of projects) {
    await mkdir(path.join(OUT, project.slug), { recursive: true });
    for (const device of devices) {
      const name = `${project.slug}/${device}-1.webp`;
      try {
        const image = await capture(browser.cdp, project.links.live, device, HIDE[project.slug]);
        await writeFile(path.join(OUT, project.slug, `${device}-1.webp`), image);
        console.log(`${name}  ${Math.round(image.length / 1024)} KB`);
      } catch (error) {
        failures++;
        console.error(`${name}  failed: ${error.message}`);
      }
    }
  }
} finally {
  await browser.close();
}
process.exit(failures ? 1 : 0);
