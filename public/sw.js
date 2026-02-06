// Service Worker for Binth & Jubílio Wedding
const CACHE_NAME = 'bj-wedding-v1';
const urlsToCache = [
  '/',
  '/index.css',
  '/manifest.json'
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
  const url = new URL(event.request.url);

  // Bypass SW for Supabase, Fonts AND Media files
  if (
    url.hostname.includes('supabase.co') || 
    url.hostname.includes('fonts.gstatic.com') || 
    url.hostname.includes('fonts.googleapis.com') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.includes('/music/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses from our own origin
        if (response.status === 200 && event.request.method === 'GET' && url.origin === self.location.origin) {
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
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }

        // If no cache, return a proper 404 response
        return new Response('Network and cache failed', {
          status: 404,
          statusText: 'Not Found'
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
