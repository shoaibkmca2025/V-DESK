/**
 * Renders a guide video from its scene file: capture the real UI, compose the frames, narrate them in
 * Hindi, and assemble an MP4.
 *
 *   node docs/guides/render.mjs docs/guides/customer-guide.hi.json --out <dir>
 *   node docs/guides/render.mjs docs/guides/admin-guide.hi.json --out <dir> --steps capture,audio,video
 *
 * It needs the site and API running locally (see docs/guides/README.md), Chrome, and ffmpeg. Narration is
 * the Windows Hindi voice named in the scene file, so nothing is uploaded anywhere.
 */
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { evaluate, goto, launchChrome, openPage, screenshot, setViewport, sleep, waitForSelector } from './lib/browser.mjs';
import { cardFrame, screenshotFrame, titleFrame } from './lib/frame.mjs';

const run = promisify(execFile);

const args = process.argv.slice(2);
const guideFile = args.find((a) => !a.startsWith('--'));
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const steps = new Set(flag('steps', 'capture,audio,video').split(','));

const guide = JSON.parse(await readFile(resolve(guideFile), 'utf8'));
const out = resolve(flag('out', join('dist-guides', guide.id)));
const API = flag('api', 'http://127.0.0.1:5080');
const dirs = {
  app: join(out, 'app'),
  frames: join(out, 'frames'),
  audio: join(out, 'audio'),
  segments: join(out, 'segments'),
};
for (const dir of Object.values(dirs)) await mkdir(dir, { recursive: true });

const pad = (n) => String(n).padStart(2, '0');
const log = (...parts) => console.log('[guide]', ...parts);

// ── Sessions ────────────────────────────────────────────────────────────────
// Scenes that show a signed-in screen get a real session: the flows are driven against the API and the
// resulting token is put where the app keeps it. Filming the OTP or the authenticator code itself would
// put a working credential on screen, and would break whenever the code expired mid-recording.

async function customerSession(mobile = `98765${String(Date.now()).slice(-5)}`) {
  const requested = await fetch(`${API}/api/v1/auth/otp/request`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mobile }),
  }).then((r) => r.json());
  if (!requested.data?.devCode) {
    throw new Error(`the API would not hand out a code: ${JSON.stringify(requested).slice(0, 200)}`);
  }

  const verified = await fetch(`${API}/api/v1/auth/otp/verify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      mobile,
      code: requested.data.devCode,
      name: 'Priya Kulkarni',
      email: 'priya@zenithd2c.in',
      company: 'Zenith D2C Brands',
    }),
  }).then((r) => r.json());

  return {
    key: 'VDESK_SESSION',
    value: {
      accessToken: verified.data.accessToken,
      customer: verified.data.customer,
      signedInAt: new Date().toISOString(),
    },
  };
}

async function staffSession() {
  const credentials = { email: 'admin@vdesk.in', password: 'vdesk guide walkthrough 2026' };
  const login = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(credentials),
  }).then((r) => r.json());

  /*
   * A TOTP secret is only ever handed out at enrolment — it is encrypted at rest afterwards, by design. So a
   * second recording cannot sign this account in unless its authenticator is reset first, which is what an
   * admin would do for a colleague who lost their phone.
   */
  let { mfaToken } = login.data;
  if (!login.data.mfaEnrollmentRequired) {
    const key = process.env.ADMIN_API_KEY ?? 'local-dev-admin-key-0123456789';
    const staff = await fetch(`${API}/api/v1/auth/users?limit=100`, { headers: { 'x-admin-key': key } }).then((r) => r.json());
    const account = (staff.data ?? []).find((user) => user.email === credentials.email);
    if (!account) throw new Error(`no staff account for ${credentials.email} — run the guide seed first`);

    await fetch(`${API}/api/v1/auth/users/${account.ref}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ resetMfa: true }),
    });
    const again = await fetch(`${API}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then((r) => r.json());
    mfaToken = again.data.mfaToken;
  }

  const enrolled = await fetch(`${API}/api/v1/auth/mfa/enroll`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mfaToken }),
  }).then((r) => r.json());
  const secret = enrolled.data?.secret;
  if (!secret) throw new Error(`could not enrol an authenticator: ${JSON.stringify(enrolled).slice(0, 200)}`);

  const { hotp, totpStep } = await import('../../backend/src/modules/identity/identity.totp.js');
  const verified = await fetch(`${API}/api/v1/auth/mfa/verify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mfaToken, code: hotp(secret, totpStep()) }),
  }).then((r) => r.json());
  if (!verified.data?.accessToken) {
    throw new Error(`staff sign-in failed: ${JSON.stringify(verified).slice(0, 200)}`);
  }

  return {
    key: 'VDESK_STAFF_SESSION',
    value: { accessToken: verified.data.accessToken, user: verified.data.user, signedInAt: new Date().toISOString() },
  };
}

// ── Actions ─────────────────────────────────────────────────────────────────

const HELPERS = `
  window.__guide = {
    setValue(selector, value) {
      const el = document.querySelector(selector);
      if (!el) throw new Error('no element for ' + selector);
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.focus();
      return true;
    },
    clickText(text) {
      const nodes = [...document.querySelectorAll('button, a, [role=button], .ui-filter')];
      const hit = nodes.find((n) => (n.textContent || '').trim().toLowerCase().includes(text.toLowerCase()));
      if (!hit) throw new Error('no clickable element containing ' + text);
      hit.click();
      return true;
    },
    check(selector) {
      const el = document.querySelector(selector);
      if (el && !el.checked) el.click();
      return true;
    },
    otpFromPage() {
      // The local API returns the code it would have texted, and the page prints it. A deployed API does
      // not, which is why this only ever runs against a local recording environment.
      const note = [...document.querySelectorAll('.on-dark-note, p')].find((n) => /\\b\\d{6}\\b/.test(n.textContent || ''));
      const code = note && (note.textContent.match(/\\b(\\d{6})\\b/) || [])[1];
      if (!code) {
        // Say what the page is showing instead — nearly always the API declining to send another code.
        const shown = document.querySelector('.ui-field__error')?.textContent?.trim();
        throw new Error(shown ? 'the page would not send a code: ' + shown : 'no six-digit code on the page');
      }
      window.__guide.setValue('#authOtp', code);
      return code;
    },
    hideDevCode() {
      // The local API returns the code it would have texted; a real customer never sees this.
      for (const note of document.querySelectorAll('.on-dark-note, .ui-note')) {
        if (/code|कोड/i.test(note.textContent || '')) note.style.visibility = 'hidden';
      }
      return true;
    },
  };
`;

async function act(page, action, vars = {}) {
  const fill = (text) => String(text ?? '').replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? '');
  if (action.selector) await waitForSelector(page, action.selector);
  switch (action.type) {
    case 'fill':
      return evaluate(page, `__guide.setValue(${JSON.stringify(action.selector)}, ${JSON.stringify(fill(action.value))})`);
    case 'otpFromPage':
      return evaluate(page, `__guide.otpFromPage()`);
    case 'click':
      return evaluate(page, `document.querySelector(${JSON.stringify(action.selector)}).click()`);
    case 'clickText': {
      const text = fill(action.text);
      const deadline = Date.now() + 8000;
      for (;;) {
        const ready = await evaluate(
          page,
          `[...document.querySelectorAll('button, a, [role=button], .ui-filter')]
             .some((n) => (n.textContent || '').trim().toLowerCase().includes(${JSON.stringify(text.toLowerCase())}))`,
        );
        if (ready) break;
        if (Date.now() > deadline) throw new Error(`timed out waiting for something to click: ${text}`);
        await sleep(150);
      }
      return evaluate(page, `__guide.clickText(${JSON.stringify(text)})`);
    }
    case 'check':
      return evaluate(page, `__guide.check(${JSON.stringify(action.selector)})`);
    case 'scroll':
      await evaluate(page, `window.scrollTo({ top: ${Number(action.to) || 0}, behavior: 'instant' })`);
      return sleep(250);
    case 'hideDevCode':
      return evaluate(page, `__guide.hideDevCode()`);
    case 'staffPassword':
      await waitForSelector(page, '#staffEmail');
      await evaluate(page, `__guide.setValue('#staffEmail', 'admin@vdesk.in')`);
      await evaluate(page, `__guide.setValue('#staffPassword', 'vdesk guide walkthrough 2026')`);
      return evaluate(page, `__guide.clickText('Continue')`);
    case 'wait':
      return sleep(Number(action.ms) || 500);
    case 'eval':
      return evaluate(page, action.js);
    default:
      throw new Error(`unknown action: ${action.type}`);
  }
}

// ── Capture ─────────────────────────────────────────────────────────────────

async function capture() {
  const profile = join(out, 'chrome-profile');
  await rm(profile, { recursive: true, force: true });
  const { page, port, close } = await launchChrome({ userDataDir: profile, width: 1600, height: 900, scale: 2 });
  const framePage = await openPage(port);

  /*
   * One demo number per run, used both by the registration scenes and by the account behind them, so the
   * number on the form is the number in the portal. A fixed number would hit the per-number resend limit
   * the second time a recording is made within half an hour.
   */
  const vars = { mobile: `98765${String(Date.now()).slice(-5)}` };

  // The admin guide injects a staff session: its sign-in scenes deliberately stop before a real code.
  const injected = guide.id === 'admin' && guide.scenes.some((s) => s.signIn) ? await staffSession() : null;
  if (injected) log('staff session ready');

  /*
   * Two tabs, two viewports: the product is filmed at 1600×900 (16:9, so it fills the frame exactly), and
   * the frames are composed in their own 1920×1080 tab — which is what lets the product tab keep its state
   * while its frame renders. Both are captured at twice the pixel density and downscaled by ffmpeg.
   */
  const APP_VIEW = { width: 1600, height: 900, scale: 2 };

  const shootFrame = async (html, name) => {
    const htmlPath = join(dirs.frames, `${name}.html`);
    await writeFile(htmlPath, html, 'utf8');
    await goto(framePage, `file:///${htmlPath.replaceAll('\\', '/')}`, { settleMs: 450 });
    await screenshot(framePage, join(dirs.frames, `${name}.png`));
  };

  // The opening card first, then one frame per scene.
  await shootFrame(titleFrame({ guide, total: guide.scenes.length }), 'frame-00');

  for (const [i, scene] of guide.scenes.entries()) {
    const index = i + 1;
    let html;

    if (scene.type === 'card') {
      html = cardFrame({ guide, scene, index: i, total: guide.scenes.length });
    } else {
      const url = `${guide.site}${scene.url}`;
      await setViewport(page, APP_VIEW);
      await goto(page, url, { settleMs: 600 });
      await evaluate(page, HELPERS);

      if (scene.signIn) {
        // The customer guide signs in on camera, so by now the browser holds its own session; only inject
        // one if it does not (a partial re-run, or the admin guide).
        const hasSession = await evaluate(page, `!!sessionStorage.getItem('VDESK_SESSION') || !!sessionStorage.getItem('VDESK_STAFF_SESSION')`);
        const session = injected ?? (hasSession ? null : await customerSession(vars.mobile));
        if (session && !hasSession) {
          await evaluate(
            page,
            `sessionStorage.setItem(${JSON.stringify(session.key)}, ${JSON.stringify(JSON.stringify(session.value))});
             localStorage.setItem('VDESK_SESSION_HINT', '1'); true`,
          );
          await goto(page, url, { settleMs: 900 });
          await evaluate(page, HELPERS);
        }
      }

      try {
        for (const action of scene.actions ?? []) await act(page, action, vars);
      } catch (err) {
        // Keep the screen that caused it; guessing at a failed recording step is otherwise slow work.
        const shot = join(dirs.app, `failed-${pad(index)}.png`);
        await screenshot(page, shot).catch(() => {});
        err.message = `${err.message}
  scene ${pad(index)} "${scene.title}" — see ${shot}`;
        throw err;
      }
      await sleep(scene.settleMs ?? 700);

      const appShot = join(dirs.app, `app-${pad(index)}.png`);
      await screenshot(page, appShot);
      html = await screenshotFrame({
        guide,
        scene,
        index: i,
        total: guide.scenes.length,
        imagePath: appShot,
        address: `vdesk.in${scene.url.split('?')[0]}`,
      });
    }

    await shootFrame(html, `frame-${pad(index)}`);
    log(`captured ${pad(index)}/${pad(guide.scenes.length)} — ${scene.title}`);

    // The product tab still holds this scene's state, so these carry straight on from the shot.
    for (const action of scene.after ?? []) await act(page, action, vars);
  }

  close();
}

// ── Narration ───────────────────────────────────────────────────────────────

/**
 * The Hindi voices are registered where PowerShell 7 can see them and Windows PowerShell 5.1 cannot, so
 * `pwsh` is what speaks. Without this the synthesiser falls back to an English voice — or writes a file
 * with no audio in it at all.
 */
async function powershellWithHindi() {
  for (const shell of ['pwsh', 'powershell']) {
    try {
      const { stdout } = await run(shell, [
        '-NoProfile',
        '-Command',
        "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }",
      ]);
      if (stdout.includes('Hemant') || stdout.includes('Kalpana')) return shell;
    } catch {
      /* try the next one */
    }
  }
  throw new Error(
    'no Hindi voice found. Install one: Settings → Time & language → Speech → Add voices → हिन्दी (Hindi)',
  );
}

async function narrate() {
  const shell = await powershellWithHindi();
  log('speaking through', shell);
  const script = join(out, 'speak.ps1');
  await writeFile(
    script,
    `param([string]$TextFile, [string]$OutFile, [string]$Voice, [int]$Rate)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.SelectVoice($Voice)
$speaker.Rate = $Rate
$speaker.SetOutputToWaveFile($OutFile)
$speaker.Speak([System.IO.File]::ReadAllText($TextFile, [System.Text.Encoding]::UTF8))
$speaker.Dispose()`,
    'utf8',
  );

  const lines = [{ narration: `${guide.title}। ${guide.subtitle}।` }, ...guide.scenes];
  for (const [index, scene] of lines.entries()) {
    const textFile = join(dirs.audio, `line-${pad(index)}.txt`);
    const wav = join(dirs.audio, `audio-${pad(index)}.wav`);
    await writeFile(textFile, scene.narration, 'utf8');
    await run(shell, [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', script,
      '-TextFile', textFile,
      '-OutFile', wav,
      '-Voice', guide.voice,
      '-Rate', String(guide.rate ?? -1),
    ]);
    // A WAV with only a header means the voice was refused and nothing was spoken.
    const spoken = await durationOf(wav).catch(() => 0);
    if (!spoken || spoken < 0.4) throw new Error(`nothing was spoken for line ${pad(index)} (${wav})`);
    log(`narrated ${pad(index)} — ${spoken.toFixed(1)}s — ${(scene.title ?? guide.title).slice(0, 44)}`);
  }
}

// ── Assembly ────────────────────────────────────────────────────────────────

async function durationOf(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  return Number(stdout.trim());
}

async function assemble() {
  const total = guide.scenes.length + 1;
  const parts = [];

  for (let index = 0; index < total; index += 1) {
    const frame = join(dirs.frames, `frame-${pad(index)}.png`);
    const audio = join(dirs.audio, `audio-${pad(index)}.wav`);
    const segment = join(dirs.segments, `seg-${pad(index)}.mp4`);
    // A beat of silence after each line, so one scene does not run into the next.
    const length = (await durationOf(audio)) + 0.9;
    const fade = Math.min(0.45, length / 4);

    await run('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-loop', '1', '-i', frame,
      '-i', audio,
      '-filter_complex',
      `[0:v]scale=1920:1080,fps=30,format=yuv420p,fade=t=in:st=0:d=${fade.toFixed(2)},` +
        `fade=t=out:st=${(length - fade).toFixed(2)}:d=${fade.toFixed(2)}[v];` +
        `[1:a]apad,atrim=0:${length.toFixed(2)},asetpts=N/SR/TB,aresample=48000[a]`,
      '-map', '[v]', '-map', '[a]',
      '-t', length.toFixed(2),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
      '-c:a', 'aac', '-b:a', '160k', '-ac', '2',
      '-movflags', '+faststart',
      segment,
    ]);
    parts.push(segment);
    log(`segment ${pad(index)} — ${length.toFixed(1)}s`);
  }

  const list = join(out, 'segments.txt');
  await writeFile(list, parts.map((p) => `file '${p.replaceAll('\\', '/')}'`).join('\n'), 'utf8');
  const final = join(out, `vdesk-${guide.id}-guide-hi.mp4`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', final]);
  log('video:', final, `(${(await durationOf(final)).toFixed(1)}s)`);
  return final;
}

// ── Run ─────────────────────────────────────────────────────────────────────

/** Re-composes the frames from captures already on disk — for iterating on the look. */
async function recompose() {
  const profile = join(out, 'chrome-profile-frames');
  const { port, close } = await launchChrome({ userDataDir: profile, width: 1920, height: 1080, scale: 2 });
  const framePage = await openPage(port);

  const shoot = async (html, name) => {
    const htmlPath = join(dirs.frames, `${name}.html`);
    await writeFile(htmlPath, html, 'utf8');
    await goto(framePage, `file:///${htmlPath.replaceAll('\\', '/')}`, { settleMs: 400 });
    await screenshot(framePage, join(dirs.frames, `${name}.png`));
  };

  await shoot(titleFrame({ guide, total: guide.scenes.length }), 'frame-00');
  for (const [i, scene] of guide.scenes.entries()) {
    const index = i + 1;
    const html =
      scene.type === 'card'
        ? cardFrame({ guide, scene, index: i, total: guide.scenes.length })
        : await screenshotFrame({
            guide,
            scene,
            index: i,
            total: guide.scenes.length,
            imagePath: join(dirs.app, `app-${pad(index)}.png`),
            address: `vdesk.in${scene.url.split('?')[0]}`,
          });
    await shoot(html, `frame-${pad(index)}`);
    log(`composed ${pad(index)}/${pad(guide.scenes.length)}`);
  }
  close();
}

if (steps.has('capture')) await capture();
if (steps.has('frames')) await recompose();
if (steps.has('audio')) await narrate();
if (steps.has('video')) await assemble();
log('done:', guide.id);
