// Replaces the retired vite-plugin-pwa service worker. Returning visitors'
// browsers fetch this on their next update check; it wipes caches,
// unregisters itself, and reloads open tabs so they get the live site.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
    await self.registration.unregister()
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach((client) => client.navigate(client.url))
  })())
})
