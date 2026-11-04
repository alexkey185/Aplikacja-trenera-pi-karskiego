const CACHE_NAME = 'talent-app-v1';
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Instalacja: zapisujemy podstawowe pliki (tzw. App Shell) do pamięci
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Aktywacja: czyszczenie starych wersji cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategia Stale-While-Revalidate dla stron i statycznych plików
self.addEventListener('fetch', (event) => {
  // Ignorujemy zapytania do API/Supabase oraz żądania inne niż GET
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Pobieramy nową wersję w tle
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Jeśli odpowiedź jest poprawna, zapisujemy ją w cache na przyszłość
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Jeśli sieć zawiedzie, a nie mamy cache, zwracamy błąd
          return cachedResponse;
        });

      // Zwracamy natychmiast z pamięci (0 sekund), a w tle aktualizujemy
      return cachedResponse || fetchPromise;
    })
  );
});

// Obsługa komunikatu o wymuszeniu aktualizacji z poziomu aplikacji
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});