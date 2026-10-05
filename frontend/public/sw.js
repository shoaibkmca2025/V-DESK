/* ==========================================================================
   V-DESK PLATFORM — SERVICE WORKER (offline shell & asset cache)
   Registered only in production builds (see src/features/pwa/pwaInstaller.js).
   ========================================================================== */

const CACHE_NAME = 'vdesk-platform-v4.0';
const SCOPE_URL = new URL(self.registration.scope);

const PRECACHE_ASSETS = [
  './',
  './manifest.webmanifest',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/vdesk-logo.svg',
  './assets/vdesk-emblem.svg',
  './assets/vdesk-navbar-logo.png',
  './assets/vdesk-emblem-dark.png',
  './assets/vdesk-reception.jpg',
  './assets/vdesk-coworking.jpg',
  './assets/vdesk-boardroom.jpg',
].map((path) => new URL(path, SCOPE_URL).toString());

const OFFLINE_HTML =
  '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Offline | V-DESK</title></head><body style="background:#05132B;color:#F8FAFC;font-family:sans-serif;text-align:center;padding:60px 20px;"><h2>V-DESK Platform Offline</h2><p>Please check your internet connection and reload the page.</p></body></html>';

const OFFLINE_IMAGE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="#0D2342" width="100" height="100"/><text fill="#C59239" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12">V-DESK</text></svg>';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_ASSETS.map(async (url) => {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response.ok) await cache.put(url, response);
          }),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function cachePut(request, response) {
  if (response && response.status === 200) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  // Never cache API traffic.
  if (url.origin === self.location.origin && url.pathname.includes('/api/')) return;

  // Let the browser stream media natively (206 Partial Content).
  if (request.headers.has('range') || /\.(mp4|webm|ogg|mp3|wav)$/i.test(url.pathname)) return;

  // Same-origin plus the font CDN only.
  if (url.origin !== self.location.origin && !url.hostname.includes('googleapis') && !url.hostname.includes('gstatic')) return;

  // Navigations: network-first, fall back to the cached app shell (SPA routes all share index.html).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => cachePut(request, response))
        .catch(async () => {
          const cached = (await caches.match(request)) || (await caches.match(PRECACHE_ASSETS[0]));
          return cached || new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then(async (cached) => {
      const network = fetch(request).then((response) => cachePut(request, response));
      if (cached) {
        network.catch(() => {});
        return cached;
      }
      try {
        return await network;
      } catch {
        if (request.destination === 'image') {
          return new Response(OFFLINE_IMAGE, { headers: { 'Content-Type': 'image/svg+xml' } });
        }
        return new Response('Asset unavailable offline', { status: 408, headers: { 'Content-Type': 'text/plain' } });
      }
    }),
  );
});
