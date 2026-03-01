const CACHE_NAME = 'pwgen-v1'

// App shell files to pre-cache during install
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  // Activate new SW immediately without waiting for old tabs to close
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  // Take control of all open tabs immediately
  self.clients.claim()
})

// Fetch: cache-first for same-origin, network-only for external
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request)
        .then((response) => {
          // Don't cache non-ok responses
          if (!response || response.status !== 200) return response

          // Cache the fetched response for future use
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => {
          // Offline fallback: serve cached index.html for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/')
          }
        })
    })
  )
})
