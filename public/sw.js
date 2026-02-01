// Service Worker for Binth & Jubílio Wedding
const CACHE_NAME = 'bj-wedding-v1';
const urlsToCache = [
  '/home',
  '/historia',
  '/evento',
  '/galeria',
  '/contato',
  '/index.css'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests for certain internal logic if needed
  // For now, focus on fixing the TypeError
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses from our own origin or trusted ones
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        
        return response;
      })
      .catch(async () => {
        // Fallback to cache if network fails
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          
          if (cachedResponse) {
            return cachedResponse;
          }
        } catch (e) {
          console.error('Cache access failed:', e);
        }

        // Return a basic fallback response to avoid "TypeError: Failed to convert value to 'Response'"
        // This ensures the site stays functional (though possibly with missing assets)
        return new Response('Offline / Network Error', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
