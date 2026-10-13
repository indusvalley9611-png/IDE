// ═══════════════════════════════════════════════════════════════════════════════
// SwasthyaSetu — Offline-First Service Worker (v5)
// Ensures ASHA Workers + Rural Citizens get full offline access.
// Strategy: Pre-cache shell → Cache-First for static assets → Network-First for
// navigation → Background Sync queue for data writes when connectivity returns.
// ═══════════════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'swasthyasetu-v5';
const RUNTIME_CACHE = 'swasthyasetu-runtime-v5';

// ── Core App Shell: pre-cached on install ────────────────────────────────────
const APP_SHELL = [
  '/',
  '/login',
  '/maha-aushadhi',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
];

// ── Install: Pre-cache the app shell ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // Cache each URL individually — if one fails, others still cache.
      const results = await Promise.allSettled(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to pre-cache: ${url}`, err);
          })
        )
      );
      console.log('[SW] App shell pre-cached:', results.filter(r => r.status === 'fulfilled').length, '/', APP_SHELL.length);
    })
  );
  // Activate immediately — don't wait for old tabs to close.
  self.skipWaiting();
});

// ── Activate: Clean old caches & claim all open clients ──────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION && key !== RUNTIME_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  // Take control of all open pages immediately.
  self.clients.claim();
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function isNavigationRequest(request) {
  return (
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html')
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|ico|webp|avif|json)$/)
  );
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// ── Fetch Strategy ──────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests (analytics, fonts CDN, etc.)
  if (url.origin !== self.location.origin) return;

  // Skip API requests — let them pass through (or fail with network error).
  if (isApiRequest(url)) return;

  // ── 1. NAVIGATION REQUESTS (HTML pages): Network-First, fallback to cache ──
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the fresh response for offline use.
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline: try to serve from cache, or fall back to cached root.
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // ── 2. STATIC ASSETS (JS, CSS, images, fonts): Cache-First ─────────────
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        // Not in cache — fetch from network and cache for future.
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, clone);
              });
            }
            return response;
          })
          .catch(() => {
            // If both cache and network fail, return nothing (browser will show error).
            return new Response('', { status: 503, statusText: 'Offline' });
          });
      })
    );
    return;
  }

  // ── 3. Everything else: Stale-While-Revalidate ─────────────────────────
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed; if we have cache, that was already returned.
          // If not, return fallback.
          return cached || caches.match('/');
        });

      // Return cached immediately if available, refresh in background.
      return cached || networkFetch;
    })
  );
});

// ── Background Sync: Queue offline data writes and replay when online ────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'swasthyasetu-sync') {
    event.waitUntil(replayOfflineQueue());
  }
});

async function replayOfflineQueue() {
  try {
    // Read sync queue from a simple broadcast mechanism.
    // The main app stores pending mutations in localStorage; on reconnect,
    // the SyncContext replays them. The SW sync event is a backup trigger.
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      client.postMessage({ type: 'SW_SYNC_TRIGGER' });
    }
  } catch (err) {
    console.warn('[SW] Background sync replay failed:', err);
  }
}

// ── Listen for messages from the app ─────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Force update: clear all caches and re-cache app shell.
  if (event.data === 'FORCE_UPDATE') {
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => {
      caches.open(CACHE_VERSION).then((cache) => {
        cache.addAll(APP_SHELL).catch(() => {});
      });
    });
  }

  // Pre-cache additional routes (e.g., after ASHA login, cache their workspace pages).
  if (event.data && event.data.type === 'PRECACHE_ROUTES') {
    const routes = event.data.routes || [];
    caches.open(CACHE_VERSION).then((cache) => {
      routes.forEach((route) => {
        cache.add(route).catch(() => {});
      });
    });
  }
});

// ── Periodic Background Sync (for incremental data updates) ──────────────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'swasthyasetu-data-refresh') {
    event.waitUntil(refreshCachedData());
  }
});

async function refreshCachedData() {
  try {
    // Re-fetch and update the cached app shell pages (/, /login, etc.)
    const cache = await caches.open(CACHE_VERSION);
    await Promise.allSettled(
      APP_SHELL.map((url) =>
        fetch(url).then((response) => {
          if (response && response.status === 200) {
            cache.put(url, response);
          }
        })
      )
    );
    console.log('[SW] Periodic data refresh complete.');
  } catch (err) {
    console.warn('[SW] Periodic refresh failed:', err);
  }
}
