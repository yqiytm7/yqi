// YQI push sender (Cloudflare Worker).
// Wakes phones (Android app and Chrome) when a YQI Chat message or call arrives while YQI is closed.
// Secrets/vars set in Cloudflare: SA = Firebase service-account JSON (secret), API_KEY = Firebase web API key.
const PROJECT = "yqi-yunus";
let TOKEN = null, TOKEN_EXP = 0;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};
const json = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { ...cors, "content-type": "application/json" } });

function b64url(buf) {
  const s = typeof buf === "string" ? btoa(buf) : btoa(String.fromCharCode(...new Uint8Array(buf)));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function accessToken(env) {
  if (TOKEN && Date.now() < TOKEN_EXP) return TOKEN;
  const sa = JSON.parse(env.SA);
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(head + "." + claim));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + head + "." + claim + "." + b64url(sig),
  });
  const t = await r.json();
  if (!t.access_token) throw new Error("token: " + JSON.stringify(t));
  TOKEN = t.access_token; TOKEN_EXP = Date.now() + 50 * 60 * 1000;
  return TOKEN;
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return json({ ok: true, service: "YQI push" });
    let b;
    try { b = await req.json(); } catch (e) { return json({ error: "bad json" }, 400); }
    // only signed-in YQI users can send
    const who = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + env.API_KEY, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken: b.idToken || "" }),
    });
    if (!who.ok) return json({ error: "not signed in" }, 401);
    const tokens = (b.tokens || []).filter(t => typeof t === "string" && t.length > 20).slice(0, 60);
    if (!tokens.length) return json({ sent: 0 });
    const call = b.kind === "call";
    const data = { cid: String(b.cid || ""), kind: String(b.kind || "msg") };
    const at = await accessToken(env);
    const res = await Promise.all(tokens.map(token => fetch("https://fcm.googleapis.com/v1/projects/" + PROJECT + "/messages:send", {
      method: "POST",
      headers: { authorization: "Bearer " + at, "content-type": "application/json" },
      body: JSON.stringify({ message: {
        token,
        notification: { title: String(b.title || "YQI").slice(0, 80), body: String(b.body || "").slice(0, 200) },
        data,
        android: { priority: "HIGH", ttl: call ? "45s" : "86400s", notification: { channel_id: call ? "yqi_call" : "yqi_msg", sound: "default", tag: call ? "call" : data.cid } },
        webpush: { headers: { Urgency: "high", TTL: call ? "45" : "86400" }, notification: { icon: "https://yqiytm7.github.io/yqi/icon-192.png", tag: call ? "call" : data.cid, requireInteraction: call }, fcm_options: { link: "https://yqiytm7.github.io/yqi/?chat=" + encodeURIComponent(data.cid) } },
      } }),
    }).then(r => r.status).catch(() => 0)));
    return json({ sent: res.filter(s => s === 200).length, gone: res.filter(s => s === 404).length });
  },
};
