// Service Worker dla Talent PWA
const STATIC_CACHE = 'talent-static-v1';
const PAGES_CACHE = 'talent-pages-v1';

const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

// INSTALL — zapisz statyczne zasoby do cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.log('Precache częściowo nieudany:', err);
      });
    })
  );
  self.skipWaiting();
});

// ACTIVATE — usuń stare wersje cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// FETCH — strategia zależna od typu zasobu
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Tylko GET (nie cache'ujemy POST/PUT/DELETE)
  if (request.method !== 'GET') return;

  // Supabase i API — zawsze network (dane muszą być świeże)
  if (
    url.hostname.includes('supabase') ||
    url.pathname.startsWith('/api')
  ) {
    return;
  }

  // Auth — zawsze network (dynamiczne)
  if (url.pathname.startsWith('/auth/')) {
    return;
  }

  // Statyczne zasoby Next.js + obrazy/fonty — cache-first
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