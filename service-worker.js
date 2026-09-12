const CACHE_NAME = 'crochords-cache-v5';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-512.png',
  './icon-180.png',
  './favicon-32.png'
];

self.addEventListener('install', event => {
  // Note: no skipWaiting() here on purpose. A freshly installed worker stays
  // in "waiting" until the page explicitly tells it to take over, so an
  // update can never swap the app out from under a musician mid-song.
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Lets the page trigger activation once the user has accepted the update.
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// True network-first: always try to fetch the latest file over the network
// (so a redeploy is picked up immediately), and only fall back to the cached
// copy when the network is unavailable (offline use during a rehearsal/show).
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
