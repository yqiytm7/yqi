// YQI app shell: always fetch fresh from the network (data stays live); only the icons are kept for offline start.
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open("yqi-shell-v9").then(c => c.addAll(["icon-192.png", "icon-512.png"])).catch(() => {})); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });
// The app page: kept on the phone so YQI opens instantly; the newest copy is fetched in the background.
const PAGE = "yqi-page-v3", PKEY = "/__yqi_page", LIB = "yqi-lib-v1";
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => /^yqi-page-/.test(k) && k !== PAGE).map(k => caches.delete(k))))); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // libraries (Firebase, charts, fonts) are versioned: keep a copy so YQI also starts without internet
  if (u.origin !== location.origin) {
    if (/(^|\.)gstatic\.com$|cdnjs\.cloudflare\.com$|cdn\.jsdelivr\.net$|fonts\.googleapis\.com$|unpkg\.com$/.test(u.hostname) && !/firestore|googleapis\.com\/v1|identitytoolkit|securetoken/.test(u.href)) {
      e.respondWith(caches.open(LIB).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === "opaque") c.put(e.request, r.clone()).catch(() => {}); return r; }))));
    }
    return;
  }
  const scope = self.registration.scope.replace(location.origin, "");
  const isPage = e.request.mode === "navigate" || u.pathname === scope || /\/index\.html$/.test(u.pathname);
  if (!isPage || u.searchParams.has("nc")) { e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); return; }
  // Always open the newest app: try the network first (up to 4 s), keep that copy; without internet open the kept copy.
  e.respondWith(caches.open(PAGE).then(c => {
    const net = fetch(u.origin + u.pathname, { cache: "no-store", credentials: "same-origin" }).then(r => { if (r && r.ok) { c.put(PKEY, r.clone()).catch(() => {}); return r; } throw new Error("bad"); });
    const late = new Promise(res => setTimeout(res, 4000)).then(() => c.match(PKEY)).then(hit => hit || net);
    return Promise.race([net.catch(() => c.match(PKEY).then(hit => hit || Promise.reject())), late]).catch(() => c.match(PKEY)).then(h => h || Response.error());
  }));
});
// YQI Chat: messages and calls that arrive while the app is closed (push server) or in the background
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = {title: "YQI", body: e.data ? e.data.text() : ""}; }
  const n = Object.assign({}, d.data || {}, d.notification || {}, d.notification || d.data ? {} : d);
  const call = n.kind === "call";
  e.waitUntil(self.registration.showNotification(n.title || "YQI Chat", {
    body: n.body || "", icon: "icon-192.png", badge: "icon-192.png", tag: n.tag || (call ? "call" : "msg"), renotify: true,
    requireInteraction: call, vibrate: call ? [500, 250, 500, 250, 500, 250, 500] : [200, 100, 200], data: {cid: n.cid || "", call: call}
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close(); const cid = (e.notification.data || {}).cid || "";
  e.waitUntil(self.clients.matchAll({type: "window", includeUncontrolled: true}).then(list => {
    for (const c of list) { if (c.url.indexOf(self.registration.scope) === 0) { c.postMessage({yqcOpen: 1, cid: cid}); return c.focus(); } }
    return self.clients.openWindow("./?chat=" + encodeURIComponent(cid));
  }));
});
