const CACHE_NAME = 'talent-assets-v2';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/talent-bg.webp'
];

// Instalacja: zapisujemy tylko statyczne pliki
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Aktywacja: czyszczenie starych wersji
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map(key => { if (key !== CACHE_NAME) return caches.delete(key); })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignorujemy wszystko co nie jest GET oraz zapytania do Supabase
  if (event.request.method !== 'GET' || url.hostname.includes('supabase')) return;

  // KLUCZOWA ZMIANA: NIE CACHE'UJEMY STRON HTML!
  // Dzięki temu przeglądarka zawsze pyta serwer o aktualną sesję.
  if (event.request.headers.get('accept')?.includes('text/html')) return;

  // Tylko dla statycznych plików (obrazy, css, js) używamy Cache First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});