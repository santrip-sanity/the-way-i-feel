// Dynamic cache name - increment BUILD_NUMBER when you make changes
const BUILD_NUMBER = '2026-02-27-002'; // Update this when deploying changes
const STATIC_CACHE = `mood-tracker-static-${BUILD_NUMBER}`;
const DYNAMIC_CACHE = `mood-tracker-dynamic-${BUILD_NUMBER}`;

// Resources that should use network-first strategy (always get latest)
const NETWORK_FIRST_RESOURCES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js'
];

// Resources that can use stale-while-revalidate (faster loading, background updates)
const STALE_WHILE_REVALIDATE_RESOURCES = [
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - always skip waiting to activate immediately
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker: Installing new version...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Pre-caching static resources');
        return cache.addAll([...NETWORK_FIRST_RESOURCES, ...STALE_WHILE_REVALIDATE_RESOURCES]);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete, skipping waiting');
        return self.skipWaiting(); // Immediately activate new version
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed:', error);
      })
  );
});

// Activate event - claim clients immediately and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating new version...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: New version activated and claimed all clients');
      // Notify all clients that service worker updated
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      });
    })
  );
});

// Fetch event - use different strategies based on resource type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network-first strategy for critical app resources
  if (shouldUseNetworkFirst(request)) {
    event.respondWith(networkFirst(request));
  }
  // Stale-while-revalidate for assets
  else if (shouldUseStaleWhileRevalidate(request)) {
    event.respondWith(staleWhileRevalidate(request));
  }
  // Default: try network, fallback to cache
  else {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
  }
});

// Network-first strategy: Always try network first, fallback to cache
async function networkFirst(request) {
  try {
    console.log('🌐 Network-first:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Update cache with fresh content
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('💾 Cached fresh version:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📦 Network failed, serving cached version:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a document and we have no cache, return offline page
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Stale-while-revalidate: Serve cached version immediately, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Start network request in background
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
      console.log('🔄 Background updated:', request.url);
    }
    return response;
  }).catch(error => {
    console.log('🌐 Background update failed:', request.url, error);
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('⚡ Serving stale while revalidating:', request.url);
    return cachedResponse;
  }
  
  // If no cache, wait for network
  console.log('🌐 No cache, waiting for network:', request.url);
  return networkResponsePromise;
}

// Check if resource should use network-first strategy
function shouldUseNetworkFirst(request) {
  const url = new URL(request.url);
  return NETWORK_FIRST_RESOURCES.some(resource => {
    if (resource === '/' && (url.pathname === '/' || url.pathname === '')) return true;
    return url.pathname === resource;
  });
}

// Check if resource should use stale-while-revalidate strategy
function shouldUseStaleWhileRevalidate(request) {
  const url = request.url;
  return STALE_WHILE_REVALIDATE_RESOURCES.some(resource => url.includes(resource));
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('📢 Service Worker: Received skip waiting message');
    self.skipWaiting();
  }
  
  // Development helper: clear all caches
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    console.log('🧹 Service Worker: Clearing all caches...');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('✅ All caches cleared');
        // Notify the main thread
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'CACHES_CLEARED' });
          });
        });
      })
    );
  }
});