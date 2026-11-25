// Proactive intelligence: scheduled scan over recent data looking for the things a
// human QA manager would want flagged automatically - OQL breaches, missing YTM
// numbers, overdue CAPAs, and days with no internal-inspection records at all (a
// likely missed/forgotten activity). Writes land in assistant_alerts, a Jarvis-owned
// collection - this is NOT gated behind approval because it only ever adds
// informational alerts, never touches core business records (is_ext, is_int, capa...).
"use strict";

const { FieldValue } = require("firebase-admin/firestore");

function daysAgo(n) {
  const d = new Date(Date.now() - n * 864e5);
  return d.toISOString().slice(0, 10);
}

async function alreadyAlerted(db, key) {
  const doc = await db.collection("assistant_alert_keys").doc(key).get();
  return doc.exists;
}
async function markAlerted(db, key) {
  await db.collection("assistant_alert_keys").doc(key).set({ at: FieldValue.serverTimestamp() });
}

async function raise(db, { key, title, detail, severity }) {
  if (await alreadyAlerted(db, key)) return false;
  await db.collection("assistant_alerts").add({
    title,
    detail,
    severity: severity || "info",
    source: "jarvis-proactive",
    at: FieldValue.serverTimestamp(),
    read: {},
  });
  await markAlerted(db, key);
  return true;
}

async function scanOqlBreaches(db) {
  const since = daysAgo(30);
  const snap = await db.collection("is_ext").where("date", ">=", since).get();
  const byCustomer = {};
  snap.forEach((d) => {
    const r = d.data();
    const c = r.customer || "Unknown";
    const g = (byCustomer[c] = byCustomer[c] || { s: 0, m: 0, n: 0 });
    g.s += +r.sample || 0;
    g.m += +r.major || 0;
    g.n++;
  });
  for (const [customer, g] of Object.entries(byCustomer)) {
    if (!g.s) continue;
    const oql = (g.m / g.s) * 100;
    if (oql > 2.5) {
      await raise(db, {
        key: `oql-${customer}-${daysAgo(0)}`,
        title: `${customer}: OQL above limit`,
        detail: `${customer}'s external-inspection OQL over the last 30 days is ${oql.toFixed(2)}% (limit 2.5%), from ${g.n} inspections.`,
        severity: "warning",
      });
    }
  }
}

async function scanMissingYtm(db) {
  const since = daysAgo(14);
  const snap = await db.collection("is_ext").where("date", ">=", since).get();
  const missing = snap.docs.filter((d) => !d.data().ytm);
  if (missing.length) {
    await raise(db, {
      key: `missing-ytm-${daysAgo(0)}`,
      title: `${missing.length} inspection(s) missing YTM number`,
      detail: `In the last 14 days, ${missing.length} external inspection record(s) have no YTM number. Upload the inspection sheet to fill them in, or flag each one.`,
      severity: "info",
    });
  }
}

async function scanOverdueCapa(db) {
  const today = daysAgo(0);
  const snap = await db.collection("capa").where("status", "==", "open").get();
  const overdue = snap.docs.filter((d) => d.data().due && d.data().due < today);
  if (overdue.length) {
    await raise(db, {
      key: `overdue-capa-${today}`,
      title: `${overdue.length} CAPA record(s) overdue`,
      detail: overdue.map((d) => `${d.data().customer || "?"}: "${d.data().issue || "(no issue text)"}" was due ${d.data().due}`).join("; ").slice(0, 900),
      severity: "critical",
    });
  }
}

async function scanMissingInternalDay(db) {
  const yesterday = daysAgo(1);
  const snap = await db.collection("is_int").where("date", "==", yesterday).limit(1).get();
  if (snap.empty) {
    const dow = new Date(Date.now() - 864e5).getDay();
    if (dow !== 0) {
      // skip Sundays if the floor doesn't run inspections that day
      await raise(db, {
        key: `no-internal-${yesterday}`,
        title: `No internal inspection records for ${yesterday}`,
        detail: `No internal floor inspections were recorded for ${yesterday}. If this was a working day, check whether the daily data was uploaded.`,
        severity: "info",
      });
    }
  }
}

async function runProactiveScan(db) {
  await Promise.allSettled([scanOqlBreaches(db), scanMissingYtm(db), scanOverdueCapa(db), scanMissingInternalDay(db)]);
}

module.exports = { runProactiveScan };
