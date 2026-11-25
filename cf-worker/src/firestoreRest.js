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

export async function getDoc(token, projectId, path) {
  try {
    const d = await req(token, `${base(projectId)}/${path}`);
    return { id: docIdFromName(d.name), ...decodeFields(d.fields) };
  } catch (e) {
    if (String(e.message).includes(" 404:")) return null;
    throw e;
  }
}

// merge=true -> only the given fields are touched (like Admin SDK's {merge:true})
export async function setDoc(token, projectId, path, data, { merge = false } = {}) {
  const fields = encodeFields(data);
  const url = new URL(`${base(projectId)}/${path}`);
  if (merge) Object.keys(data).forEach((k) => url.searchParams.append("updateMask.fieldPaths", k));
  return req(token, url.toString(), { method: "PATCH", body: JSON.stringify({ fields }) });
}

export async function addDoc(token, projectId, collectionPath, data) {
  const d = await req(token, `${base(projectId)}/${collectionPath}`, { method: "POST", body: JSON.stringify({ fields: encodeFields(data) }) });
  return { id: docIdFromName(d.name) };
}

// Simple equality/range query against one collection (collectionId relative name, e.g. "is_ext").
// filters: [{field, op: "EQUAL"|"GREATER_THAN_OR_EQUAL"|"LESS_THAN_OR_EQUAL", value}]
export async function runQuery(token, projectId, { collectionId, filters = [], orderByField, desc = true, limit = 40 }) {
  const structuredQuery = { from: [{ collectionId }], limit };
  if (filters.length) {
    const mk = (f) => ({ fieldFilter: { field: { fieldPath: f.field }, op: f.op, value: encodeValue(f.value) } });
    structuredQuery.where = filters.length === 1 ? mk(filters[0]) : { compositeFilter: { op: "AND", filters: filters.map(mk) } };
  }
  if (orderByField) structuredQuery.orderBy = [{ field: { fieldPath: orderByField }, direction: desc ? "DESCENDING" : "ASCENDING" }];

  const d = await req(token, `${base(projectId)}:runQuery`, { method: "POST", body: JSON.stringify({ structuredQuery }) });
  return (Array.isArray(d) ? d : []).filter((r) => r.document).map((r) => ({ id: docIdFromName(r.document.name), ...decodeFields(r.document.fields) }));
}

export { encodeFields, decodeFields };
