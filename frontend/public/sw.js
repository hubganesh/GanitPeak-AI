self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Always let API and Supabase requests pass straight through to the network
  event.respondWith(fetch(event.request));
});

