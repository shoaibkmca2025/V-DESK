# User guide videos (Hindi)

Two narrated walkthroughs, rendered from the real application — nothing in them is a mock-up:

| Guide        | For                   | Scenes | Length | File                                  |
| ------------ | --------------------- | ------ | ------ | ------------------------------------- |
| Customer     | people using the site | 19     | ~7:14  | `dist-guides/vdesk-customer-guide-hi.mp4` |
| Staff        | the V-DESK team       | 15     | ~6:19  | `dist-guides/vdesk-admin-guide-hi.mp4`    |

1920×1080, H.264 + AAC. The narration is Hindi; every scene also carries a Hindi caption on screen, so the
videos are usable with the sound off.

## What the script is

The whole content of a video is one JSON file — `customer-guide.hi.json`, `admin-guide.hi.json`. Each scene
says what to show and what to say:

```json
{
  "chapter": "बुकिंग",
  "title": "दस मिनट का होल्ड",
  "narration": "लॉक स्लॉट दबाते ही वह कमरा दस मिनट के लिए…",
  "caption": "स्लॉट दस मिनट के लिए रुका — पेमेंट के बाद बुकिंग पक्की",
  "url": "/portal",
  "signIn": true,
  "actions": [{ "type": "clickText", "text": "Book a meeting room" }],
  "after": [{ "type": "clickText", "text": "Verify" }]
}
```

- `narration` is spoken; `caption` is the line burned on screen. Keep the caption short — one line.
- `actions` run before the screenshot, `after` runs once it is taken (for steps the next scene depends on).
- `signIn: true` means the scene needs a signed-in screen.
- `type: "card"` replaces the screenshot with `bullets` — used where a feature has no UI yet.

Action types: `fill`, `click`, `clickText`, `check`, `scroll`, `wait`, `eval`, `hideDevCode`,
`otpFromPage`, `staffPassword`. `{{mobile}}` in any value becomes the demo number for that run.

## Rendering

The recording drives a real browser against a real API, so both have to be running first:

```bash
# 1. API + its own throwaway PostgreSQL, migrated
cd backend && PG_PORT=54350 PORT=5080 node scripts/dev-postgres.mjs

# 2. Catalog, a pipeline of enquiries, and the staff account that appears on camera
API=http://127.0.0.1:5080 KEY=local-dev-admin-key-0123456789 node scripts/seed-over-api.mjs

# 3. The site, built against that API — this is the step people forget
cd ../frontend
VITE_API_URL="http://127.0.0.1:5080/api/v1" npm run build
npx vite preview --port 4173 --strictPort

# 4. Render (capture → narrate → assemble)
cd ..
node docs/guides/render.mjs docs/guides/customer-guide.hi.json --out=dist-guides/customer
node docs/guides/render.mjs docs/guides/admin-guide.hi.json  --out=dist-guides/admin
```

`--steps` runs part of it: `capture` (browser), `frames` (re-compose from captures already taken — use this
while adjusting the look), `audio` (narration), `video` (ffmpeg). Default is `capture,audio,video`.

A failed action saves the screen it failed on as `<out>/app/failed-NN.png`, which is usually enough to see
what went wrong.

## Things that will bite you

- **Build the site with `VITE_API_URL`.** Without it the site runs on bundled demo data, the OTP step
  cannot complete, and the admin console shows browser-stored enquiries instead of the CRM.
- **Narration needs PowerShell 7.** The Hindi voices (Microsoft Hemant, Microsoft Kalpana) are registered
  where `pwsh` can see them and Windows PowerShell 5.1 cannot; the renderer checks and says so. If neither
  has them: Settings → Time & language → Speech → Add voices → हिन्दी.
- **The recording signs itself in.** The customer guide completes a real OTP on camera, reading the code the
  local API returns (`devCode`, development only — the note that shows it is hidden before the shot, because
  a real customer gets an SMS). The staff guide injects a session instead, and resets that account's
  authenticator each run, since a TOTP secret is only ever shown at enrolment.
- **A fresh demo number per run** avoids the per-number resend limit when you re-render within half an hour.
- Captions are rendered by Chrome, not ffmpeg, because Devanagari needs proper shaping. For the same reason
  nothing in a frame uses `letter-spacing` — it pulls conjuncts apart.

## Changing a video

Editing wording costs nothing — change `narration`/`caption` and run `--steps=audio,video`. Changing what is
on screen needs `--steps=capture,audio,video`. **Re-render both whenever the UI changes**: these videos show
the real interface, so a nav change dates them immediately.

To re-record with a studio voice instead of the built-in one, keep the narration text as the script: each
scene's line is in `<out>/audio/line-NN.txt`, and dropping replacement WAVs in as `audio-NN.wav` before
`--steps=video` is all the assembly step needs.
