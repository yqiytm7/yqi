// Retrieval-Augmented Generation layer: pulls grounding context for the assistant
// out of Firestore instead of letting Gemini guess. This is intentionally generic -
// YQI's schema keeps growing (new customer desks, new modules), so rather than hard
// code every field for every collection, each retriever fetches the relevant docs and
// renders them defensively (missing fields are just skipped).
"use strict";

const MAX_DOCS_PER_SOURCE = 40;
const MAX_CHARS_PER_SOURCE = 6000;

function fmtRow(obj, fields) {
  return fields
    .map((f) => (obj[f] !== undefined && obj[f] !== null && obj[f] !== "" ? `${f}=${trim(obj[f])}` : null))
    .filter(Boolean)
    .join(" | ");
}
function trim(v) {
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > 120 ? s.slice(0, 120) + "…" : s;
}
function clip(text) {
  return text.length > MAX_CHARS_PER_SOURCE ? text.slice(0, MAX_CHARS_PER_SOURCE) + "\n…(truncated)" : text;
}

async function queryTopLevel(db, col, { dateField = "date", dateFrom, dateTo, limit = MAX_DOCS_PER_SOURCE } = {}) {
  let q = db.collection(col);
  if (dateFrom) q = q.where(dateField, ">=", dateFrom);
  if (dateTo) q = q.where(dateField, "<=", dateTo);
  try {
    q = q.orderBy(dateField, "desc").limit(limit);
    const snap = await q.get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    // composite index missing, or field absent on some docs - fall back to unsorted
    const snap = await db.collection(col).limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

async function externalInspections(db, opts) {
  const rows = await queryTopLevel(db, "is_ext", opts);
  const filtered = opts.customer
    ? rows.filter((r) => String(r.customer || "").toLowerCase().includes(String(opts.customer).toLowerCase()))
    : rows;
  const lines = filtered
    .slice(0, MAX_DOCS_PER_SOURCE)
    .map((r) => fmtRow(r, ["date", "customer", "ytm", "po", "article", "unit", "bldg", "qty", "sample", "major", "result", "defects"]));
  return { label: "External inspections (is_ext)", count: filtered.length, text: clip(lines.join("\n")) };
}

async function internalInspections(db, opts) {
  const rows = await queryTopLevel(db, "is_int", opts);
  const lines = rows
    .slice(0, MAX_DOCS_PER_SOURCE)
    .map((r) => fmtRow(r, ["date", "floor", "product", "productCat", "ytm", "qty", "result", "defects", "remarks"]));
  return { label: "Internal inspections (is_int)", count: rows.length, text: clip(lines.join("\n")) };
}

async function capaRecords(db, opts) {
  const rows = await queryTopLevel(db, "capa", { ...opts, dateField: opts.dateField || "at" });
  const lines = rows
    .slice(0, MAX_DOCS_PER_SOURCE)
    .map((r) => fmtRow(r, ["at", "customer", "issue", "rootCause", "action", "owner", "status", "due"]));
  return { label: "CAPA records (capa)", count: rows.length, text: clip(lines.join("\n")) };
}

async function amazonComplaints(db, opts) {
  const snap = await db.collection("amzcat").limit(MAX_DOCS_PER_SOURCE).get();
  const lines = snap.docs.map((d) => fmtRow({ id: d.id, ...d.data() }, ["id", "product", "theme", "rating", "count", "note"]));
  return { label: "Amazon complaint themes (amzcat)", count: snap.size, text: clip(lines.join("\n")) };
}

async function customerDesk(db, customer) {
  if (!customer) return null;
  const doc = await db.collection("cust").doc(customer).get();
  if (!doc.exists) return null;
  return { label: `Customer record (cust/${customer})`, count: 1, text: clip(JSON.stringify(doc.data()).slice(0, 2000)) };
}

async function specs(db, { wid, program, limit = 25 } = {}) {
  if (!wid) return { label: "Specs", count: 0, text: "(no workspace specified)" };
  let q = db.collection("ws").doc(wid).collection("specs").limit(limit);
  const snap = await q.get();
  let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (program) rows = rows.filter((r) => String(r.prog || "").toLowerCase() === String(program).toLowerCase());
  const lines = rows.map((r) => fmtRow(r, ["prog", "name", "date", "by"]));
  return { label: `Specs (ws/${wid}/specs)`, count: rows.length, text: clip(lines.join("\n")) };
}

// Decide which sources are relevant from the free-text question + optional scope hints
// (the current customer/workspace screen the user was on when they opened Jarvis).
async function buildContext(db, question, scope = {}) {
  const q = String(question || "").toLowerCase();
  const wants = (...kws) => kws.some((k) => q.includes(k));
  const jobs = [];

  if (wants("external", "inspection", "oql", "ytm", "shipment", "shipping", "offer")) {
    jobs.push(externalInspections(db, { customer: scope.customer, dateFrom: scope.dateFrom, dateTo: scope.dateTo }));
  }
  if (wants("internal", "floor", "line")) {
    jobs.push(internalInspections(db, { dateFrom: scope.dateFrom, dateTo: scope.dateTo }));
  }
  if (wants("capa", "root cause", "corrective")) {
    jobs.push(capaRecords(db, { dateFrom: scope.dateFrom, dateTo: scope.dateTo }));
  }
  if (wants("amazon", "review", "rating", "complaint")) {
    jobs.push(amazonComplaints(db, {}));
  }
  if (scope.customer) jobs.push(customerDesk(db, scope.customer));
  if (wants("spec", "construction", "composition", "cutting", "fabric")) {
    jobs.push(specs(db, { wid: scope.wid, program: scope.program }));
  }

  // Always include a small external-inspection snapshot so the assistant has
  // *something* grounded even for vague questions ("how are we doing").
  if (!jobs.length) jobs.push(externalInspections(db, { customer: scope.customer, dateFrom: scope.dateFrom, dateTo: scope.dateTo, limit: 20 }));

  const results = (await Promise.all(jobs)).filter(Boolean);
  const blocks = results.map((r) => `### ${r.label} (${r.count} matched)\n${r.text || "(no rows)"}`);
  return blocks.join("\n\n");
}

module.exports = { buildContext, externalInspections, internalInspections, capaRecords, amazonComplaints, customerDesk, specs };
