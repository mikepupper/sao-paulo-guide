/* Regenerate offline-assets.js after changing the app: python3 build_offline.py */
importScripts('./offline-assets.js');
const namespace = 'sp-pocket-' + encodeURIComponent(self.registration.scope);
const coreName = namespace + '-core-' + self.OFFLINE.version;
const photoName = namespace + '-photos';
const coreURLs = new Set(self.OFFLINE.files.map(path => new URL(path, self.registration.scope).href));
self.addEventListener('install', event => {
  // An incomplete download must never replace a working offline version.
  event.waitUntil(caches.open(coreName).then(cache => cache.addAll(self.OFFLINE.files)));
  // New releases activate after the old app closes, keeping code and data consistent.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(namespace + '-core-') && key !== coreName).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (request.mode === 'navigate' && (url.pathname === new URL('./', self.registration.scope).pathname || url.pathname === new URL('index.html', self.registration.scope).pathname)) {
    event.respondWith(caches.open(coreName).then(async cache => (await cache.match('./index.html')) || fetch(request)));
    return;
  }
  if (coreURLs.has(url.href)) {
    event.respondWith(caches.open(coreName).then(async cache => (await cache.match(request)) || fetch(request)));
    return;
  }
  if (request.destination === 'image') {
    event.respondWith((async () => {
      const cache = await caches.open(photoName);
      const saved = await cache.match(request);
      if (saved) return saved;
      try {
        const response = await fetch(request);
        if (response.ok) {
          try { await cache.put(request, response.clone()); } catch { /* Storage may be full; keep serving the photo. */ }
        }
        return response;
      } catch {
        return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><rect width="400" height="240" fill="#e6e6d9"/><text x="200" y="125" text-anchor="middle" fill="#58624b" font-family="sans-serif" font-size="16">Foto disponible con conexión</text></svg>', {headers:{'Content-Type':'image/svg+xml'}});
      }
    })());
  }
});
