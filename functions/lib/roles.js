// Mirrors the access-level logic in app.js (lvOf, OWNER_EMAIL, EDITORS, LOCKS, isCoEmail)
// so the backend enforces exactly the same roles the app's UI and firestore.rules use.
// Keep this in sync by hand if app.js's role logic changes - there is no shared module
// between the client bundle and Functions today.
"use strict";

const OWNER_EMAIL = "yqi.ytm7@gmail.com";

function isCoEmail(email) {
  return /@yunustextile\.com$/i.test(email || "");
}

// level: "auth" (owner/editor) > "qa" > "qc" > "guest"
async function levelOf(db, email) {
  email = String(email || "").toLowerCase();
  if (!email) return "guest";
  if (email === OWNER_EMAIL) return "auth";

  const editorsDoc = await db.collection("meta").doc("editors").get();
  const editors = (editorsDoc.exists && editorsDoc.data().emails) || [];
  if (editors.map((e) => String(e).toLowerCase()).includes(email)) return "auth";

  const levelsDoc = await db.collection("meta").doc("levels").get();
  const levels = (levelsDoc.exists && levelsDoc.data().m) || {};
  if (levels[email]) return levels[email];

  const locksDoc = await db.collection("meta").doc("locks").get();
  const locks = (locksDoc.exists && locksDoc.data().emails) || [];
  if (locks.map((e) => String(e).toLowerCase()).includes(email)) return "qa";

  if (isCoEmail(email)) return "qc";
  return "guest";
}

// duties (somos / lead / insp) set per-email in meta/levels.du
async function dutiesOf(db, email) {
  email = String(email || "").toLowerCase();
  const levelsDoc = await db.collection("meta").doc("levels").get();
  const du = (levelsDoc.exists && levelsDoc.data().du) || {};
  return du[email] || [];
}

// Whole-app access (what app.js calls canAll()): owner, editor, or level qa/auth.
async function canAll(db, email) {
  const lv = await levelOf(db, email);
  return lv === "auth" || lv === "qa";
}

// Staff access (canAll() or level qc): can see company data but not do everything.
async function isStaffUser(db, email) {
  const lv = await levelOf(db, email);
  return lv === "auth" || lv === "qa" || lv === "qc";
}

async function isOwnerOrEditor(db, email) {
  const lv = await levelOf(db, email);
  return lv === "auth";
}

module.exports = { OWNER_EMAIL, isCoEmail, levelOf, dutiesOf, canAll, isStaffUser, isOwnerOrEditor };
