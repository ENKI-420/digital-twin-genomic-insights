const CACHE_NAME = 'genomictwin1-v1.0.0';
const STATIC_CACHE_NAME = 'genomictwin1-static-v1.0.0';
const DATA_CACHE_NAME = 'genomictwin1-data-v1.0.0';

// Static assets to cache for offline use
const STATIC_URLS = [
  '/',
  '/dashboard',
  '/genomics',
  '/genomics/analysis',
  '/ai-assistant',
  '/trial-matching',
  '/offline',
  '/manifest.json',
  // Add your critical CSS and JS files here
  '/_next/static/css/app.css',
  '/_next/static/js/app.js'
];

// API endpoints that should be cached
const CACHEABLE_API_PATTERNS = [
  /^\/api\/genomics\/variants/,
  /^\/api\/patients/,
  /^\/api\/trials\/match/,
  /^\/api\/user\/profile/,
  /^\/api\/usage/
];

// API endpoints that should always be fresh (no cache)
const NO_CACHE_API_PATTERNS = [
  /^\/api\/auth/,
  /^\/api\/billing/,
  /^\/api\/real-time/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_URLS);
      }),

      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE_NAME &&
                     cacheName !== DATA_CACHE_NAME &&
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),

      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticAsset(url)) {
      // Static assets: Cache First strategy
      event.respondWith(cacheFirstStrategy(request));
    } else if (isAPIRequest(url)) {
      // API requests: different strategies based on endpoint
      event.respondWith(handleAPIRequest(request));
    } else if (isNavigationRequest(request)) {
      // Navigation requests: Network First with offline fallback
      event.respondWith(networkFirstWithOfflineFallback(request));
    }
  } else if (request.method === 'POST' || request.method === 'PUT') {
    // Handle form submissions and data updates
    event.respondWith(handleDataSubmission(request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'genomic-analysis-queue') {
    event.waitUntil(processGenomicAnalysisQueue());
  } else if (event.tag === 'usage-tracking-queue') {
    event.waitUntil(processUsageTrackingQueue());
  }
});

// Push notifications for important updates
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  const options = {
    body: event.data ? event.data.text() : 'New genomic analysis results available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: event.data ? JSON.parse(event.data.text()) : {},
    actions: [
      {
        action: 'view',
        title: 'View Results',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('GenomicTwin1', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Open the app to view results
    event.waitUntil(
      clients.openWindow('/dashboard?notification=true')
    );
  }
});

// Strategy functions
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Return cached version
      return cachedResponse;
    }

    // Fetch from network and cache
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline - resource not available', { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    // Try network first
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Network failed, try cache
    console.log('Network failed, trying cache...');

    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (isNavigationRequest(request)) {
      return caches.match('/offline');
    }

    return new Response('Offline - resource not available', { status: 503 });
  }
}

async function handleAPIRequest(request) {
  const url = new URL(request.url);

  // Check if this API should not be cached
  if (NO_CACHE_API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return fetch(request);
  }

  // Check if this API should be cached
  if (CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return staleWhileRevalidateStrategy(request);
  }

  // Default: network only
  return fetch(request);
}

async function staleWhileRevalidateStrategy(request) {
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Fetch from network in background
    const networkResponsePromise = fetch(request).then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    });

    // Return cached version immediately if available
    if (cachedResponse) {
      return cachedResponse;
    }

    // Wait for network response if no cache
    return await networkResponsePromise;
  } catch (error) {
    console.error('Stale while revalidate failed:', error);

    // Try to return cached version as fallback
    const cache = await caches.open(DATA_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('API temporarily unavailable', { status: 503 });
  }
}

async function handleDataSubmission(request) {
  try {
    // Try to submit immediately
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Queue for background sync if offline
    console.log('Queueing request for background sync...');

    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text()
    };

    // Store in IndexedDB for later sync
    await storeOfflineAction(requestData);

    // Register background sync
    await self.registration.sync.register('genomic-analysis-queue');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Request queued for when online',
        queued: true
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Background sync processors
async function processGenomicAnalysisQueue() {
  try {
    const queuedActions = await getQueuedActions('genomic-analysis');

    for (const action of queuedActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });

        if (response.ok) {
          await removeQueuedAction(action.id);
          console.log('Queued genomic analysis processed successfully');

          // Show success notification
          self.registration.showNotification('GenomicTwin1', {
            body: 'Your genomic analysis has been processed!',
            icon: '/icons/icon-192x192.png'
          });
        }
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function processUsageTrackingQueue() {
  try {
    const queuedUsage = await getQueuedActions('usage-tracking');

    for (const usage of queuedUsage) {
      try {
        await fetch('/api/usage/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usage.data)
        });

        await removeQueuedAction(usage.id);
      } catch (error) {
        console.error('Failed to sync usage data:', error);
      }
    }
  } catch (error) {
    console.error('Usage tracking sync failed:', error);
  }
}

// Utility functions
function isStaticAsset(url) {
  return url.pathname.includes('/_next/static/') ||
         url.pathname.includes('/icons/') ||
         url.pathname.includes('/images/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js');
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' &&
          request.headers.get('accept').includes('text/html'));
}

// IndexedDB operations for offline queue
async function storeOfflineAction(actionData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GenomicTwin1OfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');

      const action = {
        ...actionData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: 'genomic-analysis'
      };

      store.add(action);
      transaction.oncomplete = () => resolve(action.id);
      transaction.onerror = () => reject(transaction.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineActions')) {
        db.createObjectStore('offlineActions', { keyPath: 'id' });
      }
    };
  });
}

async function getQueuedActions(type) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GenomicTwin1OfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const actions = getAllRequest.result.filter(action => action.type === type);
        resolve(actions);
      };
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

async function removeQueuedAction(actionId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GenomicTwin1OfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');

      store.delete(actionId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}