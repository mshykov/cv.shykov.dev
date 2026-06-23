// Kill-switch service worker.
//
// A previous version cached the app for offline use, but on iOS it trapped
// users on stale (broken) bundles — deployed fixes never reached the device.
// This version self-destructs: on activation it clears every cache,
// unregisters itself, and reloads open tabs so each client loads fresh from
// the network. It has NO fetch handler, so while briefly active it never
// serves cached responses. The app no longer registers a service worker
// (see main.tsx), so once this runs, clients end up with none.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) client.navigate(client.url)
    })(),
  )
})
