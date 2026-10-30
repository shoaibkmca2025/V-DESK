/**
 * The look of a guide video: one HTML page per scene, screenshotted at 1920×1080.
 *
 * Composing in the browser rather than drawing text with ffmpeg is deliberate — Devanagari needs proper
 * shaping, and Chrome does that correctly with the fonts already on the machine. It also means the frame
 * uses the product's own colours and type.
 */
import { readFile } from 'node:fs/promises';

const BRAND = {
  navy: '#081D40',
  navyDeep: '#050F23',
  gold: '#C59239',
  teal: '#00A896',
  ink: '#0F2547',
};

const escape = (text) =>
  String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** The page every frame is built from; `body` is what changes between a screenshot frame and a card. */
function shell({ guide, scene, index, total, body }) {
  const accent = guide.accent ?? BRAND.gold;
  return `<!doctype html>
<html lang="hi">
<head>
<meta charset="utf-8">
<style>
  @page { size: 1920px 1080px; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; overflow: hidden; }
  body {
    background:
      radial-gradient(1200px 700px at 15% -10%, rgba(0,168,150,.18), transparent 60%),
      radial-gradient(900px 600px at 95% 110%, rgba(197,146,57,.16), transparent 60%),
      linear-gradient(160deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%);
    color: #fff;
    font-family: 'Nirmala UI', 'Noto Sans Devanagari', 'Segoe UI', system-ui, sans-serif;
    display: flex; flex-direction: column;
  }
  header { padding: 38px 70px 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 40px; }
  /* No letter-spacing on Devanagari — see the note in screenshotFrame. */
  .chapter { font-size: 22px; color: ${accent}; font-weight: 700; margin-bottom: 10px; }
  h1 { font-size: 46px; line-height: 1.15; font-weight: 700; letter-spacing: -.01em; max-width: 1250px; }
  .count { text-align: right; flex: none; }
  .count .n { font-size: 40px; font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; }
  .count .of { font-size: 20px; color: rgba(255,255,255,.55); }
  .count .brand { margin-top: 8px; font-size: 17px; letter-spacing: .22em; color: rgba(255,255,255,.65); font-weight: 700; }
  main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 26px 70px 0; min-height: 0; }
  footer {
    padding: 0 70px 42px; margin-top: 22px;
  }
  .caption {
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.12);
    border-left: 5px solid ${accent};
    border-radius: 14px;
    padding: 20px 28px;
    font-size: 30px; line-height: 1.35; font-weight: 500;
  }
  .progress { margin-top: 16px; height: 5px; border-radius: 3px; background: rgba(255,255,255,.14); overflow: hidden; }
  .progress i { display: block; height: 100%; background: ${accent}; width: ${Math.round(((index + 1) / total) * 100)}%; }
  ${body.css ?? ''}
</style>
</head>
<body>
  <header>
    <div>
      <div class="chapter">${escape(scene.chapter ?? guide.title)}</div>
      <h1>${escape(scene.title)}</h1>
    </div>
    <div class="count">
      <div><span class="n">${String(index + 1).padStart(2, '0')}</span><span class="of">/${String(total).padStart(2, '0')}</span></div>
      <div class="brand">V-DESK</div>
    </div>
  </header>
  <main>${body.html}</main>
  <footer>
    <div class="caption">${escape(scene.caption ?? '')}</div>
    <div class="progress"><i></i></div>
  </footer>
</body>
</html>`;
}

/**
 * A scene that shows the product. The capture is filmed at 16:9 so it fills the frame exactly; the title
 * and the caption sit on top of it over soft scrims, which leaves the screen itself as big as it can be —
 * the viewer is here to see the product, not a border around it.
 */
export async function screenshotFrame({ guide, scene, index, total, imagePath, address }) {
  const png = await readFile(imagePath);
  const source = `data:image/png;base64,${png.toString('base64')}`;
  const accent = guide.accent ?? BRAND.gold;
  return `<!doctype html>
<html lang="hi"><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; overflow: hidden; }
  body {
    background: ${BRAND.navyDeep};
    font-family: 'Nirmala UI', 'Noto Sans Devanagari', 'Segoe UI', system-ui, sans-serif;
    color: #fff; position: relative;
  }
  /*
   * The product sits below a solid title band rather than behind a gradient: half of these screens are
   * white, and a title floating over them cannot be read whichever way the gradient runs.
   */
  .shot {
    position: absolute; top: 158px; left: 0; width: 1920px; height: 922px;
    object-fit: cover; object-position: top center;
  }
  .scrim-top {
    position: absolute; inset: 0 0 auto 0; height: 158px;
    background: linear-gradient(180deg, ${BRAND.navyDeep} 0%, ${BRAND.navy} 100%);
    border-bottom: 1px solid rgba(255,255,255,.1);
  }
  .scrim-bottom {
    position: absolute; inset: auto 0 0 0; height: 300px;
    background: linear-gradient(0deg, rgba(5,15,35,.97) 0%, rgba(5,15,35,.86) 42%, rgba(5,15,35,0) 100%);
  }
  header { position: absolute; top: 30px; left: 70px; right: 70px; display: flex; justify-content: space-between; gap: 40px; }
  /* No letter-spacing: it breaks Devanagari conjuncts apart (एन्क्वायरी becomes एन् क् वा य री). */
  .chapter { font-size: 21px; color: ${accent}; font-weight: 700; margin-bottom: 8px; }
  h1 { font-size: 40px; line-height: 1.12; font-weight: 700; letter-spacing: -.01em; max-width: 1180px; }
  .count { text-align: right; flex: none; }
  .count .n { font-size: 38px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .count .of { font-size: 19px; color: rgba(255,255,255,.6); }
  .count .brand { margin-top: 6px; font-size: 16px; letter-spacing: .22em; color: rgba(255,255,255,.7); font-weight: 700; }
  .url {
    position: absolute; top: 60px; right: 230px;
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.16);
    border-radius: 999px; padding: 9px 22px; font-size: 19px; color: rgba(255,255,255,.82);
    font-family: 'Segoe UI', system-ui, sans-serif;
  }
  footer { position: absolute; left: 70px; right: 70px; bottom: 46px; }
  .caption {
    background: rgba(8,29,64,.72); border: 1px solid rgba(255,255,255,.16); border-left: 6px solid ${accent};
    border-radius: 16px; padding: 22px 30px; font-size: 31px; line-height: 1.34; font-weight: 500;
    backdrop-filter: blur(2px);
  }
  .progress { margin-top: 16px; height: 5px; border-radius: 3px; background: rgba(255,255,255,.18); overflow: hidden; }
  .progress i { display: block; height: 100%; background: ${accent}; width: ${Math.round(((index + 1) / total) * 100)}%; }
</style></head>
<body>
  <img class="shot" src="${source}">
  <div class="scrim-top"></div>
  <div class="scrim-bottom"></div>
  <header>
    <div>
      <div class="chapter">${escape(scene.chapter ?? guide.title)}</div>
      <h1>${escape(scene.title)}</h1>
    </div>
    <div class="count">
      <div><span class="n">${String(index + 1).padStart(2, '0')}</span><span class="of">/${String(total).padStart(2, '0')}</span></div>
      <div class="brand">V-DESK</div>
    </div>
  </header>
  <div class="url">${escape(address)}</div>
  <footer>
    <div class="caption">${escape(scene.caption ?? '')}</div>
    <div class="progress"><i></i></div>
  </footer>
</body></html>`;
}

/** A scene with no product shot: a list of points, for things the console does not do yet. */
export function cardFrame({ guide, scene, index, total }) {
  const accent = guide.accent ?? BRAND.gold;
  const items = (scene.bullets ?? []).map((line) => `<li>${escape(line)}</li>`).join('');
  return shell({
    guide,
    scene,
    index,
    total,
    body: {
      css: `
    .card {
      width: 100%; max-width: 1420px; background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.14); border-radius: 20px; padding: 54px 64px;
    }
    .card ul { list-style: none; display: grid; gap: 22px; }
    .card li {
      font-size: 34px; line-height: 1.3; padding-left: 46px; position: relative; color: rgba(255,255,255,.92);
    }
    .card li::before {
      content: ''; position: absolute; left: 0; top: 14px; width: 18px; height: 18px;
      border-radius: 5px; background: ${accent};
    }`,
      html: `<div class="card"><ul>${items}</ul></div>`,
    },
  });
}

/** The opening card: what this video is, who it is for. */
export function titleFrame({ guide, total }) {
  const accent = guide.accent ?? BRAND.gold;
  return `<!doctype html>
<html lang="hi"><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; overflow: hidden; }
  body {
    background:
      radial-gradient(1100px 700px at 20% 0%, rgba(0,168,150,.22), transparent 62%),
      radial-gradient(900px 600px at 100% 100%, rgba(197,146,57,.2), transparent 60%),
      linear-gradient(160deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%);
    color: #fff; font-family: 'Nirmala UI', 'Noto Sans Devanagari', 'Segoe UI', system-ui, sans-serif;
    display: flex; flex-direction: column; justify-content: center; padding: 0 140px;
  }
  .brand { font-size: 26px; letter-spacing: .34em; color: ${accent}; font-weight: 700; margin-bottom: 34px; }
  h1 { font-size: 104px; line-height: 1.04; font-weight: 700; letter-spacing: -.02em; }
  p { margin-top: 30px; font-size: 38px; line-height: 1.4; color: rgba(255,255,255,.82); max-width: 1250px; }
  .meta { margin-top: 58px; display: flex; gap: 18px; align-items: center; }
  .pill {
    border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.07);
    border-radius: 999px; padding: 14px 28px; font-size: 24px; color: rgba(255,255,255,.9);
  }
  .rule { margin-top: 64px; height: 6px; width: 220px; border-radius: 3px; background: ${accent}; }
</style></head>
<body>
  <div class="brand">V-DESK</div>
  <h1>${escape(guide.title)}</h1>
  <p>${escape(guide.subtitle)}</p>
  <div class="meta"><span class="pill">हिन्दी</span><span class="pill">${total} अध्याय</span></div>
  <div class="rule"></div>
</body></html>`;
}
