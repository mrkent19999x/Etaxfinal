const CACHE_VERSION = "v2" // bump this to invalidate old caches
const CACHE_NAME = `etax-mobile-${CACHE_VERSION}`
const urlsToCache = ["/", "/offline.html"]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  const request = event.request

  // Strategy: stale-while-revalidate for GET requests
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(request)
      const networkFetch = fetch(request)
        .then(async (networkResponse) => {
          // Cache only successful, basic/opaque responses
          if (networkResponse && networkResponse.status === 200 &&
              (networkResponse.type === "basic" || networkResponse.type === "opaque")) {
            try { await cache.put(request, networkResponse.clone()) } catch {}
          }
          return networkResponse
        })
        .catch(async () => {
          // Network failed: try offline fallback
          const offline = await cache.match("/offline.html")
          return offline || cached || Response.error()
        })

      // Return cached immediately if present, otherwise wait for network
      return cached || networkFetch
    })(),
  )
})
