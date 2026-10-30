/**
 * A small Chrome driver for the guide recordings: launch, navigate, act, screenshot to disk.
 *
 * It speaks the DevTools Protocol over Node's built-in WebSocket, so there is nothing to install. Actions
 * are JavaScript evaluated in the page rather than coordinate clicks, which keeps a recording reproducible
 * when the layout shifts.
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.CHROME_PATH,
].filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A second tab. Frames are composed in their own tab so the tab showing the product keeps its state —
 * a half-filled form stays half-filled while its frame is being rendered.
 */
export async function openPage(port, { width = 1920, height = 1080, scale = 2 } = {}) {
  const created = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json());
  const page = await connect(created.webSocketDebuggerUrl);
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
  return page;
}

export async function launchChrome({ port = 9333, width = 1600, height = 1000, scale = 2, userDataDir }) {
  const chrome = CHROME_CANDIDATES.find(Boolean);
  const process_ = spawn(
    chrome,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--window-size=${width},${height}`,
      `--force-device-scale-factor=${scale}`,
      `--user-data-dir=${userDataDir}`,
      '--hide-scrollbars',
      '--allow-file-access-from-files',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      // Fonts and animations must settle the same way every run.
      '--disable-lcd-text',
      'about:blank',
    ],
    { stdio: 'ignore', detached: false },
  );

  const target = await waitForTarget(port);
  const page = await connect(target);
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: scale,
    mobile: false,
  });
  return { page, port, process: process_, close: () => process_.kill() };
}

async function waitForTarget(port, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* Chrome is still starting */
    }
    await sleep(250);
  }
  throw new Error('Chrome did not expose a debugging target');
}

/** One page session: `send` for commands, `once` to wait for an event. */
async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  const waiters = new Map();

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(`${message.error.message} (${JSON.stringify(message.error.data ?? '')})`)) : resolve(message.result);
      return;
    }
    const waiting = waiters.get(message.method);
    if (waiting) {
      waiters.delete(message.method);
      waiting(message.params);
    }
  });

  return {
    send(method, params = {}) {
      const id = nextId++;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    once(method, timeoutMs = 15_000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          waiters.delete(method);
          reject(new Error(`timed out waiting for ${method}`));
        }, timeoutMs);
        waiters.set(method, (params) => {
          clearTimeout(timer);
          resolve(params);
        });
      });
    },
  };
}

/** Switches the page between the app viewport and the 1920×1080 frame canvas. */
export async function setViewport(page, { width, height, scale = 2 }) {
  await page.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: scale,
    mobile: false,
  });
}

/** Navigates and waits for the page to settle: load event, then fonts and one animation frame. */
export async function goto(page, url, { settleMs = 900 } = {}) {
  const loaded = page.once('Page.loadEventFired', 20_000);
  await page.send('Page.navigate', { url });
  await loaded.catch(() => {});
  await evaluate(page, `document.fonts ? document.fonts.ready.then(() => true) : true`, { await: true });
  await sleep(settleMs);
}

/** Runs an expression in the page. `await: true` resolves a promise the expression returns. */
export async function evaluate(page, expression, { await: awaitPromise = false } = {}) {
  const result = await page.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(`page error: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
  }
  return result.result?.value;
}

/**
 * Waits for an element to exist. Routes are code-split, so a page can be "loaded" a moment before the part
 * an action needs has rendered — without this, a recording fails at whichever scene happens to lose that
 * race.
 */
export async function waitForSelector(page, selector, { timeoutMs = 8000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const found = await evaluate(page, `!!document.querySelector(${JSON.stringify(selector)})`);
    if (found) return true;
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${selector}`);
    await sleep(150);
  }
}

/** Writes a PNG of the page (or of one element) to `file`. */
export async function screenshot(page, file, { selector } = {}) {
  const options = { format: 'png', captureBeyondViewport: false };
  if (selector) {
    const box = await evaluate(
      page,
      `(() => { const el = document.querySelector(${JSON.stringify(selector)});
         if (!el) return null;
         const r = el.getBoundingClientRect();
         return { x: r.x, y: r.y, width: r.width, height: r.height };
       })()`,
    );
    if (box) options.clip = { ...box, scale: 1 };
  }
  const { data } = await page.send('Page.captureScreenshot', options);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(data, 'base64'));
  return file;
}

export { sleep };
