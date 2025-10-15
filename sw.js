const CACHE_NAME = 'radio-pwa-v2';
const BASE = (new URL(self.location)).pathname.replace(/[^/]+$/, '/'); // e.g., '/retro/'
const CORE_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'app-icon-192.png',
  BASE + 'app-icon-512.png',
  BASE + 'apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const url = new URL(request.url);
        // Only cache same-origin requests
        if (url.origin === self.location.origin) {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, respClone));
        }
        return response;
      }).catch(() => caches.match(BASE + 'index.html'));
    })
  );
});
