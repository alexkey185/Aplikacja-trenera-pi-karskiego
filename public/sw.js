// ═══════════════════════════════════════════════════════════════
// Service Worker — Talent
//
// Strategie:
//   /_next/static/*     → Cache First (immutable)
//   obrazy/fonty        → Stale-While-Revalidate
//   nawigacja (HTML)    → Network First z fallbackiem do cache
//   reszta (API)        → Network Only (bez cache)
// ═══════════════════════════════════════════════════════════════

const VERSION = 'v3';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const PRECACHE = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Klient wysyła SKIP_WAITING po kliknięciu „Odśwież" w toaście
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nie dotykamy zewnętrznych domen (Supabase!)
  if (url.origin !== self.location.origin) return;

  // 1) Next.js static assets — Cache First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // 2) Obrazy, fonty, ikony — Stale-While-Revalidate
  if (/\.(?:png|jpg|jpeg|webp|avif|svg|ico|woff2?|ttf|otf)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // 3) Nawigacja — Network First z fallbackiem do cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match('/')))
    );
    return;
  }

  // 4) Reszta (API, RSC payload) — Network Only, bez cache
});