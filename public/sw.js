// ═══════════════════════════════════════════════════════════
// Talent — Service Worker
//
// Strategie:
//   _next/static/*       → cache-first (immutable)
//   obrazy / fonty       → cache-first
//   nawigacja (HTML)     → network-first + fallback z cache
//   /api, /auth, supabase → network-only
//
// Update flow:
//   Nowy deploy → przeglądarka widzi zmianę sw.js → instaluje w tle
//   → waiting (NIE aktywuje się sam) → klient pokazuje toast
//   → user klika „Odśwież" → postMessage SKIP_WAITING → activate
//   → clients.claim() → controllerchange → reload w kliencie
//
// Cache version: bump przy każdym deployu zmieniającym statyczne
// pliki w public/ (ikony, manifest, itp.).
// ═══════════════════════════════════════════════════════════

const STATIC_CACHE = 'talent-static-v2';
const PAGES_CACHE = 'talent-pages-v2';

// Precache — pliki krytyczne dla PWA (instalacja + offline shell).
// Każdy łapany osobno — brak jednego nie zabija całego install.
const PRECACHE_URLS = [
  '/manifest.json',
  '/icons/favicon.svg',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
];

// ─── INSTALL ───
// Precache z osobno łapanymi błędami. NIE wywołujemy skipWaiting() —
// czekamy na SKIP_WAITING z klienta (żeby uniknąć mieszanki starych
// i nowych chunków w trakcie sesji usera).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Precache nieudany dla:', url, err);
          })
        )
      );
    })
  );
});

// ─── ACTIVATE ───
// Wyczyść stare wersje cache, przejmij kontrolę nad otwartymi kartami.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// ─── MESSAGE ───
// Klient wysyła { type: 'SKIP_WAITING' } gdy user kliknie „Odśwież".
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ─── FETCH ───
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Tylko GET
  if (request.method !== 'GET') return;

  // Supabase / API / auth — zawsze network (dane muszą być świeże)
  if (
    url.hostname.includes('supabase') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth/')
  ) {
    return;
  }

  // Statyczne assety + obrazy/fonty — cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches
                .open(STATIC_CACHE)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // Nawigacja (HTML) — network-first z fallbackiem do cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches
              .open(PAGES_CACHE)
              .then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match('/');
          });
        })
    );
    return;
  }
});