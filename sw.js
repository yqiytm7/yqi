// YQI app shell: always fetch fresh from the network (data stays live); only the icons are kept for offline start.
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open("yqi-shell-v7").then(c => c.addAll(["icon-192.png", "icon-512.png"])).catch(() => {})); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });
// The app page opens instantly from the copy kept on the phone, and is refreshed in the background for next time.
const PAGE = "yqi-page-v1", PKEY = "/__yqi_page";
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const isPage = e.request.mode === "navigate" || u.pathname === self.registration.scope.replace(location.origin, "") || /\/index\.html$/.test(u.pathname);
  if (!isPage || u.searchParams.has("nc")) { e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); return; }
  e.respondWith(caches.open(PAGE).then(c => c.match(PKEY).then(hit => {
    const net = fetch(e.request, {cache: "no-store"}).then(r => {
      if (!r.ok) return r;
      const cp = r.clone(), done = cp.text().then(t => (hit ? hit.clone().text() : Promise.resolve("")).then(o => {
        if (o === t) return;
        return c.put(PKEY, new Response(t, {headers: {"content-type": "text/html; charset=utf-8"}})).then(() => { if (o) return self.clients.matchAll({type: "window"}).then(l => l.forEach(x => x.postMessage({yqUpdate: 1}))); });
      })).catch(() => {});
      return hit ? done.then(() => r) : r;
    });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit.clone(); }
    return net;
  })));
});
// YQI Chat: messages and calls that arrive while the app is closed (push server) or in the background
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = {title: "YQI", body: e.data ? e.data.text() : ""}; }
  const n = d.notification || d.data || d;
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
