// Minimal offline service worker. Stale-while-revalidate for same-origin GETs
// so the app shell (and pdf.js/mammoth/react-pdf chunks, once fetched) work
// with no network. Nothing here touches the user's CV — it only caches the
// app's own static assets.
const CACHE = 'cv-toolkit-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(req)
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(req, res.clone())
          return res
        })
        .catch(() => cached || (req.mode === 'navigate' ? cache.match('/index.html') : undefined))
      return cached || network
    })(),
  )
})
