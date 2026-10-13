'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // ── 1. Register Service Worker ──
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (registration) => {
        console.log('[App] Service Worker registered. Scope:', registration.scope);

        // ── 2. Listen for SW update availability ──
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available — activate immediately.
                newWorker.postMessage('SKIP_WAITING');
                console.log('[App] New SW version installed. Activating...');
              }
            });
          }
        });

        // ── 3. Register Background Sync (for data write replay) ──
        if ('sync' in registration) {
          try {
            await (registration as any).sync.register('swasthyasetu-sync');
          } catch {
            // Background Sync not supported or permission denied — that's OK.
          }
        }

        // ── 4. Register Periodic Background Sync (for data freshness) ──
        if ('periodicSync' in registration) {
          try {
            const status = await navigator.permissions.query({
              name: 'periodic-background-sync' as any,
            });
            if (status.state === 'granted') {
              await (registration as any).periodicSync.register('swasthyasetu-data-refresh', {
                minInterval: 12 * 60 * 60 * 1000, // 12 hours
              });
              console.log('[App] Periodic background sync registered.');
            }
          } catch {
            // Not supported — OK.
          }
        }
      })
      .catch((err) => {
        console.log('[App] SW registration skipped:', err);
      });

    // ── 5. Listen for SW messages (e.g., sync trigger) ──
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_SYNC_TRIGGER') {
        // The SW is asking us to replay the offline queue.
        // Dispatch a custom event that SyncContext can listen for.
        window.dispatchEvent(new CustomEvent('swasthyasetu-sw-sync'));
      }
    });

    // ── 6. Capture PWA Install Prompt globally ──
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPwaPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // ── 7. Listen for online event → trigger background sync ──
    const handleOnline = () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          if ('sync' in reg) {
            (reg as any).sync.register('swasthyasetu-sync').catch(() => {});
          }
        });
      }
      // Also dispatch for SyncContext.
      window.dispatchEvent(new CustomEvent('swasthyasetu-sw-sync'));
    };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}

// ── Utility: tell SW to pre-cache role-specific routes after login ──
export function precacheRoutesForRole(role: string) {
  if (typeof window === 'undefined') return;
  if (!navigator.serviceWorker?.controller) return;

  // After ASHA or Citizen login, tell the SW to cache the main app routes
  // so they work fully offline next time.
  const routes = ['/', '/login', '/maha-aushadhi'];

  navigator.serviceWorker.controller.postMessage({
    type: 'PRECACHE_ROUTES',
    routes,
  });
}
