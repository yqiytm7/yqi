// RAG layer, ported to the Firestore REST client. Same approach as the Firebase
// Functions version: pull grounding context out of Firestore before Gemini answers.
import { runQuery, getDoc } from "./firestoreRest.js";

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

export async function externalInspections(token, projectId, opts) {
  const rows = await dateRangeQuery(token, projectId, "is_ext", opts);
  const filtered = opts.customer ? rows.filter((r) => String(r.customer || "").toLowerCase().includes(String(opts.customer).toLowerCase())) : rows;
  const lines = filtered.slice(0, MAX_DOCS).map((r) => fmtRow(r, ["date", "customer", "ytm", "po", "article", "unit", "bldg", "qty", "sample", "major", "result", "defects"]));
  return { label: "External inspections (is_ext)", count: filtered.length, text: clip(lines.join("\n")) };
}

export async function internalInspections(token, projectId, opts) {
  const rows = await dateRangeQuery(token, projectId, "is_int", opts);
  const lines = rows.slice(0, MAX_DOCS).map((r) => fmtRow(r, ["date", "floor", "product", "productCat", "ytm", "qty", "result", "defects", "remarks"]));
  return { label: "Internal inspections (is_int)", count: rows.length, text: clip(lines.join("\n")) };
}

export async function capaRecords(token, projectId, opts) {
  const rows = await runQuery(token, projectId, { collectionId: "capa", limit: MAX_DOCS });
  const lines = rows.slice(0, MAX_DOCS).map((r) => fmtRow(r, ["at", "customer", "issue", "rootCause", "action", "owner", "status", "due"]));
  return { label: "CAPA records (capa)", count: rows.length, text: clip(lines.join("\n")) };
}

export async function amazonComplaints(token, projectId) {
  const rows = await runQuery(token, projectId, { collectionId: "amzcat", limit: MAX_DOCS });
  const lines = rows.map((r) => fmtRow(r, ["id", "product", "theme", "rating", "count", "note"]));
  return { label: "Amazon complaint themes (amzcat)", count: rows.length, text: clip(lines.join("\n")) };
}

export async function customerDesk(token, projectId, customer) {
  if (!customer) return null;
  const doc = await getDoc(token, projectId, `cust/${encodeURIComponent(customer)}`);
  if (!doc) return null;
  return { label: `Customer record (cust/${customer})`, count: 1, text: clip(JSON.stringify(doc).slice(0, 2000)) };
}

export async function buildContext(token, projectId, question, scope = {}) {
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
