// Bundled single-file version of the YQI Jarvis Cloudflare Worker.
// Generated from cf-worker/src/*.js for pasting into the Cloudflare dashboard's
// Quick Edit (which only runs a single module), so no wrangler/npm install is needed.
// Source of truth is cf-worker/src/*.js - regenerate this if those change.


// ===== from src/jwt.js =====

// Small RS256 JWT helpers built on the Web Crypto API (available natively in Cloudflare
// Workers - no jsonwebtoken/jose dependency needed, so `wrangler deploy` works with zero
// npm installs).

function b64urlEncode(bytes) {
  let bin = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlEncodeStr(str) {
  return b64urlEncode(new TextEncoder().encode(str));
}
function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64Decode(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/, "").replace(/-----END [^-]+-----/, "").replace(/\s+/g, "");
  return b64Decode(b64).buffer;
}

// Signs a JWT (RS256) with a PKCS#8 PEM private key, e.g. from a Google service account JSON key.
async function signJwtRS256(claims, privateKeyPem, extraHeader = {}) {
  const header = { alg: "RS256", typ: "JWT", ...extraHeader };
  const toSign = `${b64urlEncodeStr(JSON.stringify(header))}.${b64urlEncodeStr(JSON.stringify(claims))}`;
  const key = await crypto.subtle.importKey("pkcs8", pemToArrayBuffer(privateKeyPem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(toSign));
  return `${toSign}.${b64urlEncode(sig)}`;
}

// Verifies an RS256 JWT against a JWKS endpoint (Google's public keys). Checks signature,
// expiry and (optionally) issuer/audience. Returns the decoded payload or throws.
async function verifyJwtRS256(token, jwksUrl, { issuer, audience } = {}) {
  const [headerB64, payloadB64, sigB64] = token.split(".");
  if (!headerB64 || !payloadB64 || !sigB64) throw new Error("Malformed token");
  const header = JSON.parse(new TextDecoder().decode(b64urlDecode(headerB64)));
  const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadB64)));

  const jwksRes = await fetch(jwksUrl);
  if (!jwksRes.ok) throw new Error("Could not fetch JWKS");
  const jwks = await jwksRes.json();
  const jwk = (jwks.keys || []).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("No matching signing key (kid) found");

  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlDecode(sigB64), new TextEncoder().encode(`${headerB64}.${payloadB64}`));
  if (!ok) throw new Error("Invalid token signature");

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error("Token expired");
  if (issuer && payload.iss !== issuer) throw new Error("Unexpected issuer");
  if (audience && payload.aud !== audience) throw new Error("Unexpected audience");
  return payload;
}


// ===== from src/firestoreRest.js =====

// Minimal Firestore REST client for Cloudflare Workers (no firebase-admin, which needs
// Node APIs Workers don't have). Talks to firestore.googleapis.com directly using an
// OAuth2 access token (see serviceAccountToken.js). Encodes/decodes the small set of
// value types YQI's assistant collections actually use.

function base(projectId) {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

function encodeValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === "object") {
    const fields = {};
    for (const k of Object.keys(v)) fields[k] = encodeValue(v[k]);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}
function encodeFields(obj) {
  const fields = {};
  for (const k of Object.keys(obj || {})) fields[k] = encodeValue(obj[k]);
  return fields;
}

function decodeValue(v) {
  if (!v) return null;
  if ("nullValue" in v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return parseInt(v.integerValue, 10);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("mapValue" in v) return decodeFields(v.mapValue.fields || {});
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(decodeValue);
  return null;
}
function decodeFields(fields) {
  const out = {};
  for (const k of Object.keys(fields || {})) out[k] = decodeValue(fields[k]);
  return out;
}
function docIdFromName(name) {
  return name.split("/").pop();
}

async function req(token, url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Firestore ${opts.method || "GET"} ${url} -> ${res.status}: ${t.slice(0, 400)}`);
  }
  return res.status === 204 ? null : res.json();
}

async function getDoc(token, projectId, path) {
  try {
    const d = await req(token, `${base(projectId)}/${path}`);
    return { id: docIdFromName(d.name), ...decodeFields(d.fields) };
  } catch (e) {
    if (String(e.message).includes(" 404:")) return null;
    throw e;
  }
}

// merge=true -> only the given fields are touched (like Admin SDK's {merge:true})
async function setDoc(token, projectId, path, data, { merge = false } = {}) {
  const fields = encodeFields(data);
  const url = new URL(`${base(projectId)}/${path}`);
  if (merge) Object.keys(data).forEach((k) => url.searchParams.append("updateMask.fieldPaths", k));
  return req(token, url.toString(), { method: "PATCH", body: JSON.stringify({ fields }) });
}

async function addDoc(token, projectId, collectionPath, data) {
  const d = await req(token, `${base(projectId)}/${collectionPath}`, { method: "POST", body: JSON.stringify({ fields: encodeFields(data) }) });
  return { id: docIdFromName(d.name) };
}

// Simple equality/range query against one collection (collectionId relative name, e.g. "is_ext").
// filters: [{field, op: "EQUAL"|"GREATER_THAN_OR_EQUAL"|"LESS_THAN_OR_EQUAL", value}]
async function runQuery(token, projectId, { collectionId, filters = [], orderByField, desc = true, limit = 40 }) {
  const structuredQuery = { from: [{ collectionId }], limit };
  if (filters.length) {
    const mk = (f) => ({ fieldFilter: { field: { fieldPath: f.field }, op: f.op, value: encodeValue(f.value) } });
    structuredQuery.where = filters.length === 1 ? mk(filters[0]) : { compositeFilter: { op: "AND", filters: filters.map(mk) } };
  }
  if (orderByField) structuredQuery.orderBy = [{ field: { fieldPath: orderByField }, direction: desc ? "DESCENDING" : "ASCENDING" }];

  const d = await req(token, `${base(projectId)}:runQuery`, { method: "POST", body: JSON.stringify({ structuredQuery }) });
  return (Array.isArray(d) ? d : []).filter((r) => r.document).map((r) => ({ id: docIdFromName(r.document.name), ...decodeFields(r.document.fields) }));
}



// ===== from src/serviceAccountToken.js =====

// Mints a short-lived Google OAuth2 access token from a service-account key JSON
// (the standard JWT-bearer flow), so the Worker can call Firestore's REST API with the
// same permissions firebase-admin would have had - without needing Node or the Admin SDK.

let cached = null; // { token, exp }

async function getAccessToken(serviceAccountJson, scope = "https://www.googleapis.com/auth/datastore") {
  if (cached && cached.exp - 30 > Math.floor(Date.now() / 1000)) return cached.token;

  const sa = typeof serviceAccountJson === "string" ? JSON.parse(serviceAccountJson) : serviceAccountJson;
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: sa.client_email,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const assertion = await signJwtRS256(claims, sa.private_key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!res.ok) throw new Error(`Could not mint Google access token: ${res.status} ${await res.text().catch(() => "")}`);
  const data = await res.json();
  cached = { token: data.access_token, exp: now + (data.expires_in || 3600) };
  return cached.token;
}


// ===== from src/firebaseAuth.js =====

// Verifies a Firebase Auth ID token (the same token firebase.auth().currentUser.getIdToken()
// returns) against Google's public signing keys - this is how the Worker knows who is
// calling without needing the Admin SDK.

const JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

async function verifyFirebaseIdToken(idToken, projectId) {
  const payload = await verifyJwtRS256(idToken, JWKS_URL, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  if (!payload.email_verified) throw new Error("Email not verified");
  return { email: String(payload.email || "").toLowerCase(), uid: payload.user_id || payload.sub };
}


// ===== from src/roles.js =====

// Mirrors the access-level logic in app.js (lvOf, OWNER_EMAIL, EDITORS, LOCKS, isCoEmail),
// ported to the Firestore REST client. Keep in sync by hand with app.js if its role logic
// changes - there is no shared module between the client bundle and this Worker.

const OWNER_EMAIL = "yqi.ytm7@gmail.com";

function isCoEmail(email) {
  return /@yunustextile\.com$/i.test(email || "");
}

async function levelOf(token, projectId, email) {
  email = String(email || "").toLowerCase();
  if (!email) return "guest";
  if (email === OWNER_EMAIL) return "auth";

  const editorsDoc = await getDoc(token, projectId, "meta/editors");
  const editors = (editorsDoc && editorsDoc.emails) || [];
  if (editors.map((e) => String(e).toLowerCase()).includes(email)) return "auth";

  const levelsDoc = await getDoc(token, projectId, "meta/levels");
  const levels = (levelsDoc && levelsDoc.m) || {};
  if (levels[email]) return levels[email];

  const locksDoc = await getDoc(token, projectId, "meta/locks");
  const locks = (locksDoc && locksDoc.emails) || [];
  if (locks.map((e) => String(e).toLowerCase()).includes(email)) return "qa";

  if (isCoEmail(email)) return "qc";
  return "guest";
}

async function canAll(token, projectId, email) {
  const lv = await levelOf(token, projectId, email);
  return lv === "auth" || lv === "qa";
}
async function isStaffUser(token, projectId, email) {
  const lv = await levelOf(token, projectId, email);
  return lv === "auth" || lv === "qa" || lv === "qc";
}
async function isOwnerOrEditor(token, projectId, email) {
  return (await levelOf(token, projectId, email)) === "auth";
}


// ===== from src/gemini.js =====

// Same Gemini wrapper as the Firebase Functions version - works unchanged on Workers
// since it's plain fetch. Uses the free Google AI Studio API key (no Cloud Billing
// account / card needed for the free tier).
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

async function generate({ apiKey, model, systemInstruction, contents, tools }) {
  const body = {
    systemInstruction: systemInstruction ? { role: "system", parts: [{ text: systemInstruction }] } : undefined,
    contents,
    tools: tools && tools.length ? [{ functionDeclarations: tools }] : undefined,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  };
  const res = await fetch(`${API_BASE}/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${(await res.text().catch(() => "")).slice(0, 500)}`);
  return res.json();
}

function parseResponse(raw) {
  const cand = raw && raw.candidates && raw.candidates[0];
  const parts = (cand && cand.content && cand.content.parts) || [];
  let text = "";
  const calls = [];
  for (const p of parts) {
    if (p.text) text += p.text;
    if (p.functionCall) calls.push({ name: p.functionCall.name, args: p.functionCall.args || {} });
  }
  return { text: text.trim(), calls, finishReason: cand && cand.finishReason };
}


// ===== from src/rag.js =====

// RAG layer, ported to the Firestore REST client. Same approach as the Firebase
// Functions version: pull grounding context out of Firestore before Gemini answers.

const MAX_DOCS = 40;
const MAX_CHARS = 6000;

function fmtRow(obj, fields) {
  return fields.map((f) => (obj[f] != null && obj[f] !== "" ? `${f}=${trim(obj[f])}` : null)).filter(Boolean).join(" | ");
}
function trim(v) {
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > 120 ? s.slice(0, 120) + "…" : s;
}
function clip(t) {
  return t.length > MAX_CHARS ? t.slice(0, MAX_CHARS) + "\n…(truncated)" : t;
}

async function dateRangeQuery(token, projectId, collectionId, { dateFrom, dateTo, limit = MAX_DOCS }) {
  const filters = [];
  if (dateFrom) filters.push({ field: "date", op: "GREATER_THAN_OR_EQUAL", value: dateFrom });
  if (dateTo) filters.push({ field: "date", op: "LESS_THAN_OR_EQUAL", value: dateTo });
  try {
    return await runQuery(token, projectId, { collectionId, filters, orderByField: "date", desc: true, limit });
  } catch (e) {
    // composite index missing - fall back to an unsorted/unfiltered fetch
    return runQuery(token, projectId, { collectionId, limit });
  }
}

async function externalInspections(token, projectId, opts) {
  const rows = await dateRangeQuery(token, projectId, "is_ext", opts);
  const filtered = opts.customer ? rows.filter((r) => String(r.customer || "").toLowerCase().includes(String(opts.customer).toLowerCase())) : rows;
  const lines = filtered.slice(0, MAX_DOCS).map((r) => fmtRow(r, ["date", "customer", "ytm", "po", "article", "unit", "bldg", "qty", "sample", "major", "result", "defects"]));
  return { label: "External inspections (is_ext)", count: filtered.length, text: clip(lines.join("\n")) };
}

async function internalInspections(token, projectId, opts) {
  const rows = await dateRangeQuery(token, projectId, "is_int", opts);
  const lines = rows.slice(0, MAX_DOCS).map((r) => fmtRow(r, ["date", "floor", "product", "productCat", "ytm", "qty", "result", "defects", "remarks"]));
  return { label: "Internal inspections (is_int)", count: rows.length, text: clip(lines.join("\n")) };
}

async function capaRecords(token, projectId, opts) {
  const rows = await runQuery(token, projectId, { collectionId: "capa", limit: MAX_DOCS });
  const lines = rows.slice(0, MAX_DOCS).map((r) => fmtRow(r, ["at", "customer", "issue", "rootCause", "action", "owner", "status", "due"]));
  return { label: "CAPA records (capa)", count: rows.length, text: clip(lines.join("\n")) };
}

async function amazonComplaints(token, projectId) {
  const rows = await runQuery(token, projectId, { collectionId: "amzcat", limit: MAX_DOCS });
  const lines = rows.map((r) => fmtRow(r, ["id", "product", "theme", "rating", "count", "note"]));
  return { label: "Amazon complaint themes (amzcat)", count: rows.length, text: clip(lines.join("\n")) };
}

async function customerDesk(token, projectId, customer) {
  if (!customer) return null;
  const doc = await getDoc(token, projectId, `cust/${encodeURIComponent(customer)}`);
  if (!doc) return null;
  return { label: `Customer record (cust/${customer})`, count: 1, text: clip(JSON.stringify(doc).slice(0, 2000)) };
}

async function buildContext(token, projectId, question, scope = {}) {
  const q = String(question || "").toLowerCase();
  const wants = (...kws) => kws.some((k) => q.includes(k));
  const jobs = [];

  if (wants("external", "inspection", "oql", "ytm", "shipment", "shipping", "offer")) {
    jobs.push(externalInspections(token, projectId, { customer: scope.customer, dateFrom: scope.dateFrom, dateTo: scope.dateTo }));
  }
  if (wants("internal", "floor", "line")) jobs.push(internalInspections(token, projectId, { dateFrom: scope.dateFrom, dateTo: scope.dateTo }));
  if (wants("capa", "root cause", "corrective")) jobs.push(capaRecords(token, projectId, {}));
  if (wants("amazon", "review", "rating", "complaint")) jobs.push(amazonComplaints(token, projectId));
  if (scope.customer) jobs.push(customerDesk(token, projectId, scope.customer));
  if (!jobs.length) jobs.push(externalInspections(token, projectId, { customer: scope.customer, dateFrom: scope.dateFrom, dateTo: scope.dateTo, limit: 20 }));

  const results = (await Promise.all(jobs)).filter(Boolean);
  return results.map((r) => `### ${r.label} (${r.count} matched)\n${r.text || "(no rows)"}`).join("\n\n");
}


// ===== from src/tools.js =====

// Agentic tool layer, ported to the Firestore REST client. Same rule as the Firebase
// Functions version: READ tools run immediately; WRITE tools only ever queue a pending
// action in assistant_pending - they never touch core YQI collections directly. The
// actual write happens in executeApprovedWrite, called only from the /assistantApprove
// route after an owner/editor approves it.

const READ_TOOLS = [
  {
    name: "search_inspections",
    description: "Search external or internal inspection records in YQI (OQL, pass/fail, defects, YTM numbers). Use this before answering any question about inspection results, quality trends, or a specific customer/date range.",
    parameters: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["external", "internal"] },
        customer: { type: "string" },
        dateFrom: { type: "string" },
        dateTo: { type: "string" },
      },
      required: ["kind"],
    },
  },
  { name: "get_capa_records", description: "List open or recent CAPA (corrective/preventive action) records.", parameters: { type: "object", properties: {} } },
  { name: "get_amazon_complaint_themes", description: "List recorded Amazon customer-complaint themes per product.", parameters: { type: "object", properties: {} } },
  { name: "get_customer_summary", description: "Get the stored customer-desk summary record for one named customer.", parameters: { type: "object", properties: { customer: { type: "string" } }, required: ["customer"] } },
];

const WRITE_TOOLS = [
  {
    name: "create_capa",
    description: "Propose a new CAPA record. Queued for human approval - does not save until an editor approves it.",
    parameters: {
      type: "object",
      properties: { customer: { type: "string" }, issue: { type: "string" }, rootCause: { type: "string" }, action: { type: "string" }, owner: { type: "string" }, due: { type: "string" } },
      required: ["customer", "issue", "action"],
    },
  },
  {
    name: "flag_inspection",
    description: "Propose flagging an existing inspection with a note. Queued for approval.",
    parameters: { type: "object", properties: { inspectionId: { type: "string" }, kind: { type: "string", enum: ["external", "internal"] }, note: { type: "string" } }, required: ["inspectionId", "kind", "note"] },
  },
  {
    name: "create_alert",
    description: "Raise a proactive alert for the team. Queued for approval before it is shown to others.",
    parameters: { type: "object", properties: { title: { type: "string" }, detail: { type: "string" }, severity: { type: "string", enum: ["info", "warning", "critical"] } }, required: ["title", "detail"] },
  },
];

const ALL_TOOL_DECLARATIONS = [...READ_TOOLS, ...WRITE_TOOLS];
const WRITE_TOOL_NAMES = new Set(WRITE_TOOLS.map((t) => t.name));

async function runReadTool(token, projectId, name, args) {
  switch (name) {
    case "search_inspections": {
      const r = args.kind === "internal" ? await rag.internalInspections(token, projectId, args) : await rag.externalInspections(token, projectId, args);
      return r.text || "No matching inspection records.";
    }
    case "get_capa_records":
      return (await rag.capaRecords(token, projectId, {})).text || "No CAPA records found.";
    case "get_amazon_complaint_themes":
      return (await rag.amazonComplaints(token, projectId)).text || "No Amazon complaint data recorded.";
    case "get_customer_summary": {
      const r = await rag.customerDesk(token, projectId, args.customer);
      return (r && r.text) || `No stored summary for "${args.customer}".`;
    }
    default:
      return `Unknown read tool: ${name}`;
  }
}

async function queueWriteTool(token, projectId, name, args, { email, uid, sessionId }) {
  const { id } = await addDoc(token, projectId, "assistant_pending", {
    tool: name,
    args: JSON.stringify(args),
    status: "pending",
    requestedByEmail: email || "",
    requestedByUid: uid || "",
    sessionId: sessionId || "",
    createdAt: new Date(),
  });
  return id;
}

async function executeApprovedWrite(token, projectId, pending) {
  const tool = pending.tool;
  const args = typeof pending.args === "string" ? JSON.parse(pending.args) : pending.args;
  switch (tool) {
    case "create_capa": {
      const { id } = await addDoc(token, projectId, "capa", {
        customer: args.customer || "", issue: args.issue || "", rootCause: args.rootCause || "", action: args.action || "",
        owner: args.owner || "", due: args.due || "", status: "open", source: "jarvis", at: new Date(),
      });
      return { collection: "capa", id };
    }
    case "flag_inspection": {
      const col = args.kind === "internal" ? "is_int" : "is_ext";
      await setDoc(token, projectId, `${col}/${args.inspectionId}`, { jarvisFlag: { note: args.note || "", at: new Date() } }, { merge: true });
      return { collection: col, id: args.inspectionId };
    }
    case "create_alert": {
      const { id } = await addDoc(token, projectId, "assistant_alerts", {
        title: args.title || "", detail: args.detail || "", severity: args.severity || "info", source: "jarvis", at: new Date(),
      });
      return { collection: "assistant_alerts", id };
    }
    default:
      throw new Error(`Unknown write tool: ${tool}`);
  }
}


// ===== from src/log.js =====


async function logActivity(token, projectId, entry) {
  try {
    await addDoc(token, projectId, "assistant_logs", { ...entry, at: new Date() });
  } catch (e) {
    console.error("assistant log write failed", e);
  }
}


// ===== from src/proactive.js =====

// Proactive scan, ported to the Firestore REST client. Runs on a Cloudflare Cron
// Trigger (free on Workers' free plan) instead of a Firebase scheduled function.

function daysAgo(n) {
  return new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
}

async function alreadyAlerted(token, projectId, key) {
  return !!(await getDoc(token, projectId, `assistant_alert_keys/${encodeURIComponent(key)}`));
}
async function markAlerted(token, projectId, key) {
  await setDoc(token, projectId, `assistant_alert_keys/${encodeURIComponent(key)}`, { at: new Date() });
}
async function raise(token, projectId, { key, title, detail, severity }) {
  if (await alreadyAlerted(token, projectId, key)) return;
  await addDoc(token, projectId, "assistant_alerts", { title, detail, severity: severity || "info", source: "jarvis-proactive", at: new Date() });
  await markAlerted(token, projectId, key);
}

async function scanOqlBreaches(token, projectId) {
  const rows = await runQuery(token, projectId, { collectionId: "is_ext", filters: [{ field: "date", op: "GREATER_THAN_OR_EQUAL", value: daysAgo(30) }], limit: 1000 });
  const byCustomer = {};
  for (const r of rows) {
    const c = r.customer || "Unknown";
    const g = (byCustomer[c] = byCustomer[c] || { s: 0, m: 0, n: 0 });
    g.s += +r.sample || 0; g.m += +r.major || 0; g.n++;
  }
  for (const [customer, g] of Object.entries(byCustomer)) {
    if (!g.s) continue;
    const oql = (g.m / g.s) * 100;
    if (oql > 2.5) {
      await raise(token, projectId, {
        key: `oql-${customer}-${daysAgo(0)}`,
        title: `${customer}: OQL above limit`,
        detail: `${customer}'s external-inspection OQL over the last 30 days is ${oql.toFixed(2)}% (limit 2.5%), from ${g.n} inspections.`,
        severity: "warning",
      });
    }
  }
}

async function scanMissingYtm(token, projectId) {
  const rows = await runQuery(token, projectId, { collectionId: "is_ext", filters: [{ field: "date", op: "GREATER_THAN_OR_EQUAL", value: daysAgo(14) }], limit: 1000 });
  const missing = rows.filter((r) => !r.ytm);
  if (missing.length) {
    await raise(token, projectId, {
      key: `missing-ytm-${daysAgo(0)}`,
      title: `${missing.length} inspection(s) missing YTM number`,
      detail: `In the last 14 days, ${missing.length} external inspection record(s) have no YTM number.`,
      severity: "info",
    });
  }
}

async function scanOverdueCapa(token, projectId) {
  const today = daysAgo(0);
  const rows = await runQuery(token, projectId, { collectionId: "capa", filters: [{ field: "status", op: "EQUAL", value: "open" }], limit: 500 });
  const overdue = rows.filter((r) => r.due && r.due < today);
  if (overdue.length) {
    await raise(token, projectId, {
      key: `overdue-capa-${today}`,
      title: `${overdue.length} CAPA record(s) overdue`,
      detail: overdue.map((r) => `${r.customer || "?"}: "${r.issue || "(no issue text)"}" was due ${r.due}`).join("; ").slice(0, 900),
      severity: "critical",
    });
  }
}

async function scanMissingInternalDay(token, projectId) {
  const yesterday = daysAgo(1);
  const rows = await runQuery(token, projectId, { collectionId: "is_int", filters: [{ field: "date", op: "EQUAL", value: yesterday }], limit: 1 });
  if (!rows.length && new Date(Date.now() - 864e5).getDay() !== 0) {
    await raise(token, projectId, {
      key: `no-internal-${yesterday}`,
      title: `No internal inspection records for ${yesterday}`,
      detail: `No internal floor inspections were recorded for ${yesterday}. If this was a working day, check whether the daily data was uploaded.`,
      severity: "info",
    });
  }
}

async function runProactiveScan(token, projectId) {
  await Promise.allSettled([scanOqlBreaches(token, projectId), scanMissingYtm(token, projectId), scanOverdueCapa(token, projectId), scanMissingInternalDay(token, projectId)]);
}


// ===== namespace shims for `import * as X` usages in index.js / tools.js =====

const roles = { OWNER_EMAIL, isCoEmail, levelOf, canAll, isStaffUser, isOwnerOrEditor };

const gemini = { generate, parseResponse };

const rag = { externalInspections, internalInspections, capaRecords, amazonComplaints, customerDesk, buildContext };

const tools = { READ_TOOLS, WRITE_TOOLS, ALL_TOOL_DECLARATIONS, WRITE_TOOL_NAMES, runReadTool, queueWriteTool, executeApprovedWrite };


// ===== from src/index.js =====

// YQI Jarvis assistant backend - Cloudflare Worker (free plan, no card needed).
// Routes (all POST, JSON body, `Authorization: Bearer <Firebase ID token>`):
//   /assistantChat     { text, history?, scope? }  -> { text, pendingActions[], usedTools[] }
//   /assistantApprove  { pendingId }                -> { ok, outcome }
//   /assistantReject   { pendingId, reason? }        -> { ok }
// Scheduled (Cron Trigger, see wrangler.toml): runs the proactive scan daily.
//
// Required secrets (wrangler secret put ...): GEMINI_API_KEY, GOOGLE_SERVICE_ACCOUNT_JSON
// Required var (wrangler.toml [vars]): FIREBASE_PROJECT_ID
//
// There is NO text-to-speech call here - voice output uses the browser's own free
// speechSynthesis in jarvis.js, since Google Cloud Text-to-Speech requires a Cloud
// Billing account (a card), which this backend was built specifically to avoid.

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...CORS } });
}

const SYSTEM_PROMPT = `You are Jarvis, the operational AI assistant built into YQI (Yunus Quality
Intelligence) - a textile-quality-management app for Yunus Textile. You help QA/QC staff and
management understand inspection results, defects, OQL, CAPA records, Amazon customer feedback,
and specs, and you can propose actions (CAPA records, flags, alerts) that a human then approves.

Rules:
- Ground every factual claim in the tool results you are given. If you don't have data for
  something, say so plainly instead of guessing.
- Keep answers short and direct.
- Numbers you cite must come from a tool result, never be estimated.
- For anything that would change a record, use the write tools - never claim you already saved
  something. Write tools are queued for human approval; tell the user that.
- If the user writes in Roman Urdu, reply in Roman Urdu (Latin script), matching their style.`;

async function authEmail(request, env) {
  const h = request.headers.get("authorization") || "";
  const m = h.match(/^Bearer (.+)$/i);
  if (!m) throw new Error("UNAUTHENTICATED");
  const { email } = await verifyFirebaseIdToken(m[1], env.FIREBASE_PROJECT_ID);
  return email;
}

async function handleChat(request, env) {
  const email = await authEmail(request, env);
  const fsToken = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const projectId = env.FIREBASE_PROJECT_ID;
  if (!(await roles.isStaffUser(fsToken, projectId, email))) return json({ error: "Jarvis is available to Yunus Textile staff accounts only." }, 403);

  const { text, history, scope } = await request.json();
  if (!text || !String(text).trim()) return json({ error: "text is required." }, 400);

  const canWrite = await roles.canAll(fsToken, projectId, email);
  const context = await rag.buildContext(fsToken, projectId, text, scope || {});
  const contents = [
    ...(Array.isArray(history) ? history.slice(-12) : []),
    { role: "user", parts: [{ text: `Relevant YQI data for this question:\n${context || "(no matching records found)"}\n\nQuestion: ${text}` }] },
  ];

  const availableTools = canWrite ? tools.ALL_TOOL_DECLARATIONS : tools.ALL_TOOL_DECLARATIONS.filter((t) => !tools.WRITE_TOOL_NAMES.has(t.name));
  const pendingActions = [];
  const usedTools = [];
  let finalText = "";

  for (let turn = 0; turn < 4; turn++) {
    const raw = await gemini.generate({ apiKey: env.GEMINI_API_KEY, model: env.GEMINI_MODEL || "gemini-2.0-flash", systemInstruction: SYSTEM_PROMPT, contents, tools: availableTools });
    const { text: modelText, calls } = gemini.parseResponse(raw);
    if (modelText) finalText = modelText;
    if (!calls.length) break;

    contents.push({ role: "model", parts: calls.map((c) => ({ functionCall: { name: c.name, args: c.args } })) });
    const functionResponses = [];
    for (const call of calls) {
      usedTools.push(call.name);
      if (tools.WRITE_TOOL_NAMES.has(call.name)) {
        const pendingId = await tools.queueWriteTool(fsToken, projectId, call.name, call.args, { email, sessionId: scope && scope.sessionId });
        pendingActions.push({ id: pendingId, tool: call.name, args: call.args });
        functionResponses.push({ functionResponse: { name: call.name, response: { queued: true, pendingId } } });
      } else {
        const result = await tools.runReadTool(fsToken, projectId, call.name, call.args);
        functionResponses.push({ functionResponse: { name: call.name, response: { result } } });
      }
    }
    contents.push({ role: "user", parts: functionResponses });
  }

  await logActivity(fsToken, projectId, { kind: "chat", email, question: text, answer: finalText, usedTools: usedTools.join(","), pendingActions: pendingActions.map((p) => p.id).join(",") });
  return json({ text: finalText || "I couldn't put together an answer from the current data - try rephrasing or narrowing the date range.", pendingActions, usedTools });
}

async function handleApprove(request, env) {
  const email = await authEmail(request, env);
  const fsToken = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const projectId = env.FIREBASE_PROJECT_ID;
  if (!(await roles.isOwnerOrEditor(fsToken, projectId, email))) return json({ error: "Only the owner or an authorised editor can approve Jarvis actions." }, 403);

  const { pendingId } = await request.json();
  if (!pendingId) return json({ error: "pendingId is required." }, 400);
  const pending = await getDoc(fsToken, projectId, `assistant_pending/${pendingId}`);
  if (!pending) return json({ error: "This action no longer exists." }, 404);
  if (pending.status !== "pending") return json({ error: `Already ${pending.status}.` }, 409);

  let outcome;
  try {
    outcome = await tools.executeApprovedWrite(fsToken, projectId, pending);
    await setDoc(fsToken, projectId, `assistant_pending/${pendingId}`, { status: "approved", approvedBy: email, approvedAt: new Date(), outcome: JSON.stringify(outcome) }, { merge: true });
  } catch (e) {
    await setDoc(fsToken, projectId, `assistant_pending/${pendingId}`, { status: "failed", error: String(e.message || e) }, { merge: true });
    return json({ error: `Could not apply this action: ${e.message}` }, 500);
  }
  await logActivity(fsToken, projectId, { kind: "approve", email, pendingId, tool: pending.tool, outcome: JSON.stringify(outcome) });
  return json({ ok: true, outcome });
}

async function handleReject(request, env) {
  const email = await authEmail(request, env);
  const fsToken = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const projectId = env.FIREBASE_PROJECT_ID;
  if (!(await roles.isOwnerOrEditor(fsToken, projectId, email))) return json({ error: "Only the owner or an authorised editor can reject Jarvis actions." }, 403);

  const { pendingId, reason } = await request.json();
  if (!pendingId) return json({ error: "pendingId is required." }, 400);
  await setDoc(fsToken, projectId, `assistant_pending/${pendingId}`, { status: "rejected", rejectedBy: email, rejectedAt: new Date(), reason: reason || "" }, { merge: true });
  await logActivity(fsToken, projectId, { kind: "reject", email, pendingId, reason: reason || "" });
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    try {
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/assistantChat") return await handleChat(request, env);
      if (request.method === "POST" && url.pathname === "/assistantApprove") return await handleApprove(request, env);
      if (request.method === "POST" && url.pathname === "/assistantReject") return await handleReject(request, env);
      return json({ error: "Not found" }, 404);
    } catch (e) {
      const status = String(e.message) === "UNAUTHENTICATED" ? 401 : 500;
      return json({ error: String(e.message || e) }, status);
    }
  },

  async scheduled(event, env, ctx) {
    const fsToken = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
    ctx.waitUntil(runProactiveScan(fsToken, env.FIREBASE_PROJECT_ID));
  },
};
