/* ==========================================================================
   V-DESK PLATFORM — SERVICE WORKER (PWA Offline & Cache Engine)
   Corporate Business PWA Compliance — v3.2
   ========================================================================== */

const CACHE_NAME = 'vdesk-platform-v3.2';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './virtual-office.html',
  './coworking-spaces.html',
  './meeting-rooms.html',
  './locations.html',
  './pricing.html',
  './company-registration.html',
  './portal.html',
  './admin.html',
  './contact.html',
  './404.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/vdesk-logo.svg',
  './assets/vdesk-emblem.svg',
  './assets/vdesk-navbar-logo.png',
  './assets/vdesk-emblem-dark.png',
  './assets/vdesk-emblem-vivid.png',
  './assets/vdesk-reception.jpg',
  './assets/vdesk-coworking.jpg',
  './assets/vdesk-boardroom.jpg'
];

// 1. INSTALL — Resilient individual caching with Promise.allSettled
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[V-DESK SW] Pre-caching platform assets for v3.2...');
      const results = await Promise.allSettled(
        PRECACHE_ASSETS.map(async (assetUrl) => {
          try {
            const response = await fetch(assetUrl, { cache: 'no-cache' });
            if (response && response.status === 200) {
              await cache.put(assetUrl, response);
            }
          } catch (err) {
            console.warn('[V-DESK SW] Pre-cache warning for:', assetUrl, err);
          }
        })
      );
      console.log('[V-DESK SW] Pre-cache completed.');
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE — Purge any previous cache version and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('[V-DESK SW] Evicting outdated cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH STRATEGY:
// - Skip non-http/https (e.g. chrome-extension:)
// - Bypass video/audio media and Range requests (native browser streaming)
// - Navigation/HTML: Network-First with cache and offline HTML fallback
// - Static Assets: Cache-First / Stale-While-Revalidate with guaranteed Response
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip unsupported schemes (chrome-extension:, data:, etc.)
  if (!url.protocol.startsWith('http')) return;

  // IMPORTANT: Do NOT intercept media files or Range requests.
  // Chrome and WebKit media engines handle 206 Partial Content natively.
  if (event.request.headers.has('range') || url.pathname.match(/\.(mp4|webm|ogg|mp3|wav)$/i)) {
    return;
  }

  // Skip non-essential third-party requests except designated CDNs
  if (url.origin !== location.origin && !url.hostname.includes('googleapis') && !url.hostname.includes('unpkg')) {
    return;
  }

  const isHtml = event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isHtml) {
    // Network-First for HTML to guarantee live updates, falling back to cache
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = (await caches.match('./index.html')) || (await caches.match('index.html'));
          if (fallback) return fallback;
          return new Response(
            '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Offline | V-DESK</title></head><body style="background:#05132B;color:#F8FAFC;font-family:sans-serif;text-align:center;padding:60px 20px;"><h2>V-DESK Platform Offline</h2><p>Please check your internet connection and reload the page.</p></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Stale-While-Revalidate for static assets (CSS, JS, images, fonts)
  event.respondWith(
    caches.match(event.request).then(async (cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately, revalidate in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Not in cache: fetch from network
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      } catch (err) {
        // Fallback for image requests when offline
        if (event.request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="#0D2342" width="100" height="100"/><text fill="#C59239" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12">V-DESK</text></svg>',
            { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        // Fallback response for other resources to prevent FetchEvent undefined errors
        return new Response('Asset unavailable offline', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })
  );
});
