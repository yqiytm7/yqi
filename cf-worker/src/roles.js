// Mirrors the access-level logic in app.js (lvOf, OWNER_EMAIL, EDITORS, LOCKS, isCoEmail),
// ported to the Firestore REST client. Keep in sync by hand with app.js if its role logic
// changes - there is no shared module between the client bundle and this Worker.
import { getDoc } from "./firestoreRest.js";

export const OWNER_EMAIL = "yqi.ytm7@gmail.com";

export function isCoEmail(email) {
  return /@yunustextile\.com$/i.test(email || "");
}

export async function levelOf(token, projectId, email) {
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

export async function canAll(token, projectId, email) {
  const lv = await levelOf(token, projectId, email);
  return lv === "auth" || lv === "qa";
}
export async function isStaffUser(token, projectId, email) {
  const lv = await levelOf(token, projectId, email);
  return lv === "auth" || lv === "qa" || lv === "qc";
}
export async function isOwnerOrEditor(token, projectId, email) {
  return (await levelOf(token, projectId, email)) === "auth";
}
