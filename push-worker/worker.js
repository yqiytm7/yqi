// YQI server (Cloudflare Worker): push notifications + "link a computer" QR login.
// Secret set in Cloudflare: SA = Firebase service-account JSON.
const PROJECT = "yqi-yunus", WEBKEY = "AIzaSyDuYarXV14aENaqjRA-G3nKk_HgrFYgOho";
const FS = "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents/qrl/";
let TOKEN = null, TOKEN_EXP = 0, KEY = null;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "content-type" };
const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { ...cors, "content-type": "application/json" } });
const b64url = buf => (typeof buf === "string" ? btoa(unescape(encodeURIComponent(buf))) : btoa(String.fromCharCode(...new Uint8Array(buf)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function signJwt(env, payload) {
  const sa = JSON.parse(env.SA);
  if (!KEY) { const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")), c => c.charCodeAt(0)); KEY = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]); }
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" })), body = b64url(JSON.stringify(payload(sa)));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", KEY, new TextEncoder().encode(head + "." + body));
  return head + "." + body + "." + b64url(sig);
}
async function accessToken(env) {
  if (TOKEN && Date.now() < TOKEN_EXP) return TOKEN;
  const now = Math.floor(Date.now() / 1000);
  const jwt = await signJwt(env, sa => ({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + jwt });
  const t = await r.json();
  if (!t.access_token) throw new Error("token: " + JSON.stringify(t));
  TOKEN = t.access_token; TOKEN_EXP = Date.now() + 50 * 60 * 1000;
  return TOKEN;
}
async function whoIs(idToken) {
  const r = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + WEBKEY, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken: idToken || "" }) });
  if (!r.ok) return null;
  const j = await r.json(); return (j.users || [])[0] || null;
}
const okSid = s => typeof s === "string" && /^[A-Za-z0-9]{24,64}$/.test(s);

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") { let ok = false; try { ok = !!(env.SA && await accessToken(env)); } catch (e) {} return json({ ok: true, service: "YQI push", ready: ok }); }
    let b; try { b = await req.json(); } catch (e) { return json({ error: "bad json" }, 400); }
    const at = await accessToken(env);
    // ---- computer asks: has a phone approved this QR yet? ----
    if (b.op === "qrpoll") {
      if (!okSid(b.sid)) return json({ error: "bad" }, 400);
      const r = await fetch(FS + b.sid, { headers: { authorization: "Bearer " + at } });
      if (r.status !== 200) return json({ wait: 1 });
      const d = await r.json(), f = d.fields || {};
      await fetch(FS + b.sid, { method: "DELETE", headers: { authorization: "Bearer " + at } });
      if (Date.now() - Number((f.at || {}).integerValue || 0) > 120000) return json({ expired: 1 });
      return json({ token: (f.tok || {}).stringValue || "" });
    }
    // ---- phone approves: sign the computer in as me ----
    if (b.op === "qrok") {
      if (!okSid(b.sid)) return json({ error: "bad" }, 400);
      const u = await whoIs(b.idToken); if (!u || !u.emailVerified) return json({ error: "not signed in" }, 401);
      const now = Math.floor(Date.now() / 1000);
      const tok = await signJwt(env, sa => ({ iss: sa.client_email, sub: sa.client_email, aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit", iat: now, exp: now + 3600, uid: u.localId }));
      const w = await fetch(FS + b.sid, { method: "PATCH", headers: { authorization: "Bearer " + at, "content-type": "application/json" }, body: JSON.stringify({ fields: { tok: { stringValue: tok }, at: { integerValue: String(Date.now()) }, by: { stringValue: u.email || "" } } }) });
      return json({ ok: w.ok });
    }
    // ---- push to phones ----
    const u = await whoIs(b.idToken); if (!u) return json({ error: "not signed in" }, 401);
    const tokens = (b.tokens || []).filter(t => typeof t === "string" && t.length > 20).slice(0, 60);
    if (!tokens.length) return json({ sent: 0 });
    const call = b.kind === "call", data = { cid: String(b.cid || ""), kind: String(b.kind || "msg") };
    const res = await Promise.all(tokens.map(token => fetch("https://fcm.googleapis.com/v1/projects/" + PROJECT + "/messages:send", {
      method: "POST", headers: { authorization: "Bearer " + at, "content-type": "application/json" },
      body: JSON.stringify({ message: { token, notification: { title: String(b.title || "YQI").slice(0, 80), body: String(b.body || "").slice(0, 200) }, data,
        android: { priority: "HIGH", ttl: call ? "45s" : "86400s", notification: { channel_id: call ? "yqi_call" : "yqi_msg", sound: "default", tag: call ? "call" : data.cid } },
        webpush: { headers: { Urgency: "high", TTL: call ? "45" : "86400" }, notification: { icon: "https://yqi-app.pages.dev/icon-192.png", tag: call ? "call" : data.cid, requireInteraction: call }, fcm_options: { link: "https://yqi-app.pages.dev/?chat=" + encodeURIComponent(data.cid) } } } }),
    }).then(r => r.status).catch(() => 0)));
    return json({ sent: res.filter(s => s === 200).length, gone: res.filter(s => s === 404).length });
  },
};
