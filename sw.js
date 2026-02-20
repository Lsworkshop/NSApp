// Basic, safe Service Worker for installability.
// Phase 1: no fetch interception (no offline cache) to keep behavior stable.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});