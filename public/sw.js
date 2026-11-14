/* Offline support. Pages you have opened keep working without a connection.
   - Navigations: network first (always fresh when online), cached copy when offline.
   - Same-origin static files (hashed JS/CSS, images): cache first, refreshed in the background.
   - Never cached: admin pages, API calls, other origins (Supabase, Google Fonts), non-GET requests. */
const CACHE = 'alkohol-ja-aju-v2';
const AUTH_PARAMS = ['code', 'error', 'error_code', 'error_description', 'access_token', 'refresh_token', 'token_hash'];
const scope = new URL(self.registration.scope);

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith("alkohol-ja-aju-") && n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

const cacheable = (url) => url.origin === scope.origin && url.pathname.startsWith(scope.pathname) && !url.pathname.includes('/admin/') && !url.pathname.includes('/api/') && !AUTH_PARAMS.some(key => url.searchParams.has(key));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!cacheable(url)) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh.ok && !fresh.redirected) await (await caches.open(CACHE)).put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch {
        const cache = await caches.open(CACHE);
        return (await cache.match(req)) || (await cache.match(req, { ignoreSearch: true })) || (await cache.match(scope.href)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const refresh = fetch(req).then((res) => { if (res.ok && !res.redirected) return cache.put(req, res.clone()).catch(() => {}).then(() => res); return res; }).catch(() => null);
    event.waitUntil(refresh);
    return cached || (await refresh) || Response.error();
  })());
});
