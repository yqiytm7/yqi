// YQI app shell: always fetch fresh from the network (data stays live); only the icons are kept for offline start.
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open("yqi-shell-v3").then(c => c.addAll(["icon-192.png", "icon-512.png"])).catch(() => {})); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
