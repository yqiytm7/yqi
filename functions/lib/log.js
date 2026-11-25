"use strict";
const { FieldValue } = require("firebase-admin/firestore");

// Append-only activity log: every chat turn, tool call, approval and rejection goes
// here so there is a full audit trail of what Jarvis did and who approved what.
async function logActivity(db, entry) {
  try {
    await db.collection("assistant_logs").add({ ...entry, at: FieldValue.serverTimestamp() });
  } catch (e) {
    // Logging must never break the user-facing request.
    console.error("assistant log write failed", e);
  }
}

module.exports = { logActivity };
