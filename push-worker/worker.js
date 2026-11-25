// YQI server (Cloudflare Worker): push notifications + "link a computer" QR login.
// Secret set in Cloudflare: SA = Firebase service-account JSON.
// Cron trigger: every minute → inspection feed (#INTERNAL / #EXTERNAL chat messages → Inspection Summary).
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

// ---- inspection feed: #INTERNAL / #EXTERNAL messages in the inspection groups → Inspection Summary (every minute) ----
const DOCS = "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents/";
const FEEDG = { grp_insp_int: "int", grp_insp_ext: "ext" };
let OLX = {};
const pad = n => (n < 10 ? "0" : "") + n;
const now = () => Date.now();
function fromV(v) { if (!v) return null; if ("stringValue" in v) return v.stringValue; if ("integerValue" in v) return Number(v.integerValue); if ("doubleValue" in v) return v.doubleValue; if ("booleanValue" in v) return v.booleanValue; if ("nullValue" in v) return null;
  if ("mapValue" in v) { const o = {}, f = v.mapValue.fields || {}; for (const k in f) o[k] = fromV(f[k]); return o; } if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromV); if ("timestampValue" in v) return v.timestampValue; return null; }
function toV(x) { if (x === null || x === undefined) return { nullValue: null }; if (typeof x === "string") return { stringValue: x }; if (typeof x === "boolean") return { booleanValue: x };
  if (typeof x === "number") return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x }; if (Array.isArray(x)) return { arrayValue: { values: x.map(toV) } };
  const f = {}; for (const k in x) if (x[k] !== undefined) f[k] = toV(x[k]); return { mapValue: { fields: f } }; }
const fields = o => toV(o).mapValue.fields;
function fdHash(t){ var h = 0; t = String(t || ""); for(var i = 0; i < t.length; i++){ h = (h * 31 + t.charCodeAt(i)) | 0; } return h; }
function fdKind(t){ var m = /^\s*#\s*(INTERNAL|EXTERNAL)\b/i.exec(String(t || "")); return m ? (m[1].toUpperCase() === "INTERNAL" ? "int" : "ext") : ""; }
function fdNum(v){ var n = parseFloat(String(v || "").replace(/,/g, "")); return isFinite(n) ? n : 0; }
function fdDate(v){ v = String(v || "").trim(); if(/^today$/i.test(v)){ var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  var m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})$/.exec(v); if(m){ var y = +m[3]; if(y < 100) y += 2000; if(+m[2] > 12 || +m[1] > 31) return ""; return y + "-" + pad(+m[2]) + "-" + pad(+m[1]); }
  m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v); return m ? m[1] + "-" + pad(+m[2]) + "-" + pad(+m[3]) : ""; }
function fdRes(v, kind){ v = String(v || "").trim().toLowerCase().replace(/[^a-z]/g, ""); var M = {pass: "Pass", passed: "Pass", ok: "Pass", fail: "Fail", failed: "Fail", abort: "Abort", aborted: "Abort", inprocess: "In process", inprogress: "In process", pending: "Pending"}; var r = M[v] || ""; if(r === "In process" && kind === "ext") r = "Pending"; if(r === "Pending" && kind === "int") r = "In process"; return r; }
function fdOqlPct(v){ var m = /([\d.]+)\s*%?\s*$/.exec(String(v || "").trim()); return m ? +m[1] : null; }
function fdDefects(v){ var L = []; String(v || "").split(/[,;\n]+/).forEach(function(p){ p = p.trim(); if(!p || /^(nil|none|no|-|0)$/i.test(p)) return; var m = /^(.*?)[\s:x×-]*(\d+)\s*(pcs)?$/i.exec(p), n = m && m[1].trim() ? m[1].trim() : p, q = m && m[1].trim() ? +m[2] : 1; var c = /sew|stitch|seam|pleat|skip|broken/i.test(n) ? "Sewing" : /pack|label|carton|poly|sticker/i.test(n) ? "Packaging" : /fabric|hole|slub|shade|weav/i.test(n) ? "Fabric" : /measure|size/i.test(n) ? "Measurement" : /stain|spot|dirt|oil/i.test(n) ? "Stain" : "Other"; var ex = L.filter(function(x){ return x.n.toLowerCase() === n.toLowerCase(); })[0]; if(ex) ex.q += q; else L.push({n: n, q: q, c: c}); }); return L; }
var FDORD = {G: "GROUND", GROUND: "GROUND", "1": "FIRST", "1ST": "FIRST", FIRST: "FIRST", "2": "SECOND", "2ND": "SECOND", SECOND: "SECOND", "3": "THIRD", "3RD": "THIRD", THIRD: "THIRD", "4": "FOURTH", "4TH": "FOURTH", FOURTH: "FOURTH", "5": "FIFTH", "5TH": "FIFTH", FIFTH: "FIFTH"};
function fdFloor(v){ var u = String(v || "").toUpperCase().replace(/FLOOR|FLR|UNIT/g, " ").replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim(); var known = [];
  var cmp = function(x){ return String(x).toUpperCase().replace(/[^A-Z0-9]/g, ""); }, k0 = known.filter(function(x){ return cmp(x) === cmp(v) || cmp(x) === cmp(v + " FLOOR"); })[0]; if(k0) return k0;
  var m = /^(?:YTM\s*)?(\d+)\s*([A-Z])?\s*(GROUND|G|FIRST|SECOND|THIRD|FOURTH|FIFTH|\d(?:ST|ND|RD|TH)?)$/.exec(u); if(!m) return "";
  var nm = "YTM-" + m[1] + (m[2] ? " " + m[2] : "") + " " + FDORD[m[3]] + " FLOOR"; var k1 = known.filter(function(x){ return cmp(x) === cmp(nm); })[0]; return k1 || nm; }
function fdParse(t){ var kind = fdKind(t), F = {}; String(t || "").split(/\n/).slice(1).forEach(function(l){ var m = /^\s*([A-Za-z .\/]+?)\s*[:=]\s*(.*)$/.exec(l); if(m) F[m[1].toLowerCase().replace(/[^a-z]/g, "")] = m[2].trim(); });
  var g = function(){ for(var i = 0; i < arguments.length; i++){ var v = F[arguments[i]]; if(v != null && v !== "") return v; } return ""; }, err = [];
  var date = fdDate(g("date")); if(!date) err.push("Date (write DD-MM-YYYY)");
  var ytm = g("ytm", "ytmno", "ytmnumber").toUpperCase().replace(/^YTM\s*[-#:]?\s*/, ""), ol = null; ol = OLX[ytm] || null;
  var cust = g("customer", "buyer", "client", "buyername") || (ol && ol.cust) || "";  if(!cust) err.push("Customer");
  var res = fdRes(g("result", "status"), kind), dl = fdDefects(g("defects", "defect", "defectlist"));
  var r = {date: date, customer: cust, result: res, count: 1, src: "chat", at: new Date().toISOString(), dlist: dl, defects: dl.map(function(d){ return d.n + " " + d.q; }).join(", ")};
  if(ytm) r.ytm = ytm; var insp = g("inspector", "inspectedby", "qc"); if(insp) r.inspector = insp;
  if(kind === "int"){
    var fl = fdFloor(g("unit", "floor", "line")); if(!fl) err.push("Unit (write like YTM-3 FIRST FLOOR)"); r.floor = fl;
    r.product = g("article", "product", "item") || (ol && (ol.art || ol.prog)) || ""; r.qty = fdNum(g("offerqty", "offerquantity", "qty", "quantity")); r.sample = fdNum(g("sample", "samplesize")); r.allowed = fdNum(g("allowed", "alloweddefects")); r.found = fdNum(g("found", "founddefects")); r.major = r.found; r.minor = 0; r.critical = 0; r.inspection = g("inspection", "type") || "PARTIAL FRI";
    var pk = fdRes(g("packaging", "packing"), kind), wk = fdRes(g("workmanship"), kind); if(pk) r.packaging = pk; if(wk) r.workmanship = wk;
    if(!res && (pk || wk)) r.result = pk === "Fail" || wk === "Fail" ? "Fail" : "Pass";
    if(r.result === "Pass" && (pk === "Fail" || wk === "Fail")) err.push("Result says Pass but Packaging / Workmanship is Fail");
    var oqlGivenI = fdOqlPct(g("oql"));
    if(!r.major && oqlGivenI != null && r.sample){ r.oql = oqlGivenI / 100; r.major = Math.round(r.oql * r.sample); }
    else r.oql = r.sample ? r.major / r.sample : 0;
  } else {
    r.po = g("po", "pono", "ponumber", "purchaseorder"); r.article = g("article", "articles", "product", "item") || (ol && (ol.art || ol.prog)) || ""; r.unit = g("unit", "inspectiongoodsunit"); r.qty = fdNum(g("qty", "totalquantity", "quantity", "orderqty", "totalqty")); r.sample = fdNum(g("sample", "samplesize", "sampleqty"));
    var mj = /^\s*([\d.]+)(?:\s*\/\s*([\d.]+))?/.exec(g("major", "majordefects", "majorfound")), mn = /^\s*([\d.]+)(?:\s*\/\s*([\d.]+))?/.exec(g("minor", "minordefects")), cr = /^\s*([\d.]+)/.exec(g("critical"));
    r.minor = mn ? +mn[1] : 0; r.critical = cr ? +cr[1] : 0; if(mj && mj[2]) r.majAllow = +mj[2]; if(mn && mn[2]) r.minAllow = +mn[2];
    if(!r.sample) err.push("Sample");
    var oqlGivenE = fdOqlPct(g("oql"));
    // priority when Major has no usable number: 1) an explicit OQL%, 2) the Defects list total
    // (most inspectors only ever write Major, not Minor - whatever is listed as a defect counts
    // as major unless it was already put under Minor).
    if(mj) r.major = +mj[1];
    else if(oqlGivenE != null && r.sample) r.major = Math.round((oqlGivenE / 100) * r.sample);
    else if(dl.length) r.major = dl.reduce(function(s, d){ return s + (+d.q || 0); }, 0);
    else r.major = 0;
    r.oql = r.sample ? r.major / r.sample : 0;
  }
  if(!r.result) err.push("Result (Pass / Fail / Abort / " + (kind === "int" ? "In process" : "Pending") + ")");
  return {kind: kind, rec: r, err: err}; }

async function fsGet(at, path) { const r = await fetch(DOCS + path, { headers: { authorization: "Bearer " + at } }); return r.ok ? r.json() : null; }
async function fsPatch(at, path, obj, mask) { const q = mask ? "?" + mask.map(m => "updateMask.fieldPaths=" + encodeURIComponent(m)).join("&") : ""; return fetch(DOCS + path + q, { method: "PATCH", headers: { authorization: "Bearer " + at, "content-type": "application/json" }, body: JSON.stringify({ fields: fields(obj) }) }); }
async function fsDel(at, path) { return fetch(DOCS + path, { method: "DELETE", headers: { authorization: "Bearer " + at } }); }
async function userName(at, uid) { try { const d = await fsGet(at, "people/" + uid); const f = d && d.fields ? fromV({ mapValue: { fields: d.fields } }) : {}; return f.name || f.displayName || ""; } catch (e) { return ""; } }
async function feedRun(env) {
  const at = await accessToken(env); let done = 0, seen = 0; const G = FEEDG;
  for (const gid of Object.keys(G)) {
    const r = await fetch(DOCS + "chats/" + gid + ":runQuery", { method: "POST", headers: { authorization: "Bearer " + at, "content-type": "application/json" },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "m" }], orderBy: [{ field: { fieldPath: "at" }, direction: "DESCENDING" }], limit: 40 } }) });
    if (!r.ok) continue;
    const rows = (await r.json()).filter(x => x.document); seen += rows.length;
    for (const x of rows) {
      const name = x.document.name, mid = name.split("/").pop(), m = fromV({ mapValue: { fields: x.document.fields || {} } }), f = m.fed || {};
      const kind = fdKind(m.t), id = "chat_" + gid.slice(-3) + "_" + mid, mpath = "chats/" + gid + "/m/" + mid;
      if (m.del) { if (f.ok && !f.gone) { await fsDel(at, "ws/_all/" + ((f.k || G[gid]) === "int" ? "is_int" : "is_ext") + "/" + (f.id || id)); await fsPatch(at, mpath, { fed: Object.assign({}, f, { gone: 1 }) }, ["fed"]); done++; } continue; }
      if (!kind) continue; const h = fdHash(m.t); if (f.h === h) continue;
      const ytm = ((/\bYTM\s*(?:no)?\s*[:=]\s*([A-Za-z0-9-]+)/i.exec(m.t) || [])[1] || "").toUpperCase();
      if (ytm && !(ytm in OLX)) { const d = await fsGet(at, "ol/" + encodeURIComponent(ytm)); OLX[ytm] = d && d.fields ? fromV({ mapValue: { fields: d.fields } }) : null; }
      const P = fdParse(m.t); if (P.kind !== G[gid]) P.err.unshift("Send #" + (G[gid] === "int" ? "INTERNAL" : "EXTERNAL") + " in this group");
      if (P.err.length) { await fsPatch(at, mpath, { fed: { ok: 0, h, at: now(), err: P.err.slice(0, 4) } }, ["fed"]); if (f.ok) await fsDel(at, "ws/_all/" + (f.k === "int" ? "is_int" : "is_ext") + "/" + f.id); done++; continue; }
      const rec = P.rec; rec.chat = { gid, mid, by: m.by || "", name: await userName(at, m.by || "") }; rec.by = "server";
      const col = P.kind === "int" ? "is_int" : "is_ext", w = await fsPatch(at, "ws/_all/" + col + "/" + id, rec);
      if (w.ok) { await fsPatch(at, mpath, { fed: { ok: 1, h, at: now(), id, k: P.kind, s: rec.customer + " · " + rec.result + (rec.sample ? " · OQL " + (rec.oql * 100).toFixed(1) + "%" : "") + (rec.floor ? " · " + rec.floor : "") } }, ["fed"]); done++; }
    }
  }
  return { done, seen };
}

const okSid = s => typeof s === "string" && /^[A-Za-z0-9]{24,64}$/.test(s);

export default {
  async scheduled(ev, env, ctx) { ctx.waitUntil(feedRun(env).catch(e => console.log("feed", e && e.message))); },
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method === "GET" && new URL(req.url).searchParams.has("feed")) { try { return json(Object.assign({ ok: true }, await feedRun(env))); } catch (e) { return json({ ok: false, error: e.message }); } }
    if (req.method !== "POST") { let ok = false; try { ok = !!(env.SA && await accessToken(env)); } catch (e) {} return json({ ok: true, service: "YQI push", ready: ok, v: 6 }); }
    let b; try { b = await req.json(); } catch (e) { return json({ error: "bad json" }, 400); }
    const at = await accessToken(env);
    // ---- app error from a phone or computer: one record per error per day, with a count ----
    if (b.op === "err") {
      const u = await whoIs(b.idToken); if (!u) return json({ error: "not signed in" }, 401);
      const e = b.e || {}, day = new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10), key = day + "_" + (fdHash(String(e.m) + "|" + e.f + "|" + e.l) >>> 0).toString(36);
      const name = "projects/" + PROJECT + "/databases/(default)/documents/ws/_all/errs/" + key;
      const f = { day, m: String(e.m || "").slice(0, 300), f: String(e.f || "").slice(0, 60), l: Number(e.l) || 0, c: Number(e.c) || 0, s: String(e.s || "").slice(0, 600), v: String(b.v || "").slice(0, 20), p: String(b.p || "").slice(0, 80), ua: String(b.ua || "").slice(0, 160), email: u.email || "", last: Date.now() };
      const w = await fetch(DOCS.replace(/\/$/, "") .replace(/documents$/, "documents:commit"), { method: "POST", headers: { authorization: "Bearer " + at, "content-type": "application/json" },
        body: JSON.stringify({ writes: [{ update: { name, fields: fields(f) }, updateMask: { fieldPaths: Object.keys(f) }, updateTransforms: [{ fieldPath: "n", increment: { integerValue: "1" } }] }] }) });
      return json({ ok: w.ok });
    }
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
