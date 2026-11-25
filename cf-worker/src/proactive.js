// Proactive scan, ported to the Firestore REST client. Runs on a Cloudflare Cron
// Trigger (free on Workers' free plan) instead of a Firebase scheduled function.
import { runQuery, getDoc, setDoc, addDoc } from "./firestoreRest.js";

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

export async function runProactiveScan(token, projectId) {
  await Promise.allSettled([scanOqlBreaches(token, projectId), scanMissingYtm(token, projectId), scanOverdueCapa(token, projectId), scanMissingInternalDay(token, projectId)]);
}
