// YQI Jarvis assistant - Cloud Functions backend.
//
// Callable functions (invoked from jarvis.js in the app with firebase.functions()):
//   assistantChat(text, history?, scope?)   -> { text, pendingActions[], usedTools[] }
//   assistantApprove(pendingId)             -> { ok, result }
//   assistantReject(pendingId)              -> { ok }
//   assistantTTS(text, voiceName, languageCode, speakingRate?, pitch?) -> { audioB64 }
//   assistantListVoices(languageCode?)      -> { voices[] }
//
// Scheduled:
//   assistantProactiveScan  - runs daily, writes to assistant_alerts
//
// Setup required before any of this works (see docs/JARVIS-SETUP.md):
//   1. Firebase project upgraded to the Blaze (pay-as-you-go) plan.
//   2. "Generative Language API" (Gemini) enabled + GEMINI_API_KEY secret set.
//   3. "Cloud Text-to-Speech API" enabled on the same GCP project.
//   4. firebase deploy --only functions,firestore:rules
"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const roles = require("./lib/roles");
const gemini = require("./lib/gemini");
const rag = require("./lib/rag");
const tools = require("./lib/tools");
const tts = require("./lib/tts");
const { logActivity } = require("./lib/log");
const { runProactiveScan } = require("./lib/proactive");

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const SYSTEM_PROMPT = `You are Jarvis, the operational AI assistant built into YQI (Yunus Quality
Intelligence) - a textile-quality-management app for Yunus Textile. You help QA/QC staff and
management understand inspection results, defects, OQL, CAPA records, Amazon customer feedback,
and specs, and you can propose actions (CAPA records, flags, alerts) that a human then approves.

Rules:
- Ground every factual claim in the tool results you are given. If you don't have data for
  something, say so plainly instead of guessing.
- Keep answers short and direct - the people using this are busy on a factory floor or in a QA
  office, not reading essays.
- Numbers matter: when you cite an OQL, pass rate, or count, it must come from a tool result, not
  be estimated.
- For anything that would change a record (CAPA, flags, alerts), use the write tools - never claim
  you already saved something. Write tools are queued for human approval; tell the user that.
- If the user writes in Roman Urdu, reply in Roman Urdu (Latin script), matching their style.`;

function requireAuth(request) {
  if (!request.auth || !request.auth.token || !request.auth.token.email_verified) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  return String(request.auth.token.email || "").toLowerCase();
}

// ---------------------------------------------------------------- assistantChat
exports.assistantChat = onCall({ secrets: [GEMINI_API_KEY], cors: true, timeoutSeconds: 60 }, async (request) => {
  const email = requireAuth(request);
  if (!(await roles.isStaffUser(db, email))) {
    throw new HttpsError("permission-denied", "Jarvis is available to Yunus Textile staff accounts only.");
  }
  process.env.GEMINI_API_KEY = GEMINI_API_KEY.value();

  const { text, history, scope } = request.data || {};
  if (!text || !String(text).trim()) throw new HttpsError("invalid-argument", "text is required.");

  const canWrite = await roles.canAll(db, email); // only editors/owner/qa can trigger write-tool proposals
  const context = await rag.buildContext(db, text, scope || {});

  const contents = [
    ...(Array.isArray(history) ? history.slice(-12) : []),
    {
      role: "user",
      parts: [{ text: `Relevant YQI data for this question:\n${context || "(no matching records found)"}\n\nQuestion: ${text}` }],
    },
  ];

  const pendingActions = [];
  const usedTools = [];
  let finalText = "";
  const availableTools = canWrite ? tools.ALL_TOOL_DECLARATIONS : tools.ALL_TOOL_DECLARATIONS.filter((t) => !tools.WRITE_TOOL_NAMES.has(t.name));

  for (let turn = 0; turn < 4; turn++) {
    const raw = await gemini.generate({ systemInstruction: SYSTEM_PROMPT, contents, tools: availableTools });
    const { text: modelText, calls } = gemini.parseResponse(raw);
    if (modelText) finalText = modelText;
    if (!calls.length) break;

    contents.push({ role: "model", parts: calls.map((c) => ({ functionCall: { name: c.name, args: c.args } })) });
    const functionResponses = [];
    for (const call of calls) {
      usedTools.push(call.name);
      if (tools.WRITE_TOOL_NAMES.has(call.name)) {
        const pendingId = await tools.queueWriteTool(db, call.name, call.args, { email, uid: request.auth.uid, sessionId: scope && scope.sessionId });
        pendingActions.push({ id: pendingId, tool: call.name, args: call.args });
        functionResponses.push({ functionResponse: { name: call.name, response: { queued: true, pendingId } } });
      } else {
        const result = await tools.runReadTool(db, call.name, call.args);
        functionResponses.push({ functionResponse: { name: call.name, response: { result } } });
      }
    }
    contents.push({ role: "user", parts: functionResponses });
  }

  await logActivity(db, { kind: "chat", email, question: text, answer: finalText, usedTools, pendingActions: pendingActions.map((p) => p.id) });

  return { text: finalText || "I couldn't put together an answer from the current data - try rephrasing or narrowing the date range.", pendingActions, usedTools };
});

// ------------------------------------------------------------- assistantApprove
exports.assistantApprove = onCall({ cors: true }, async (request) => {
  const email = requireAuth(request);
  if (!(await roles.isOwnerOrEditor(db, email))) {
    throw new HttpsError("permission-denied", "Only the owner or an authorised editor can approve Jarvis actions.");
  }
  const { pendingId } = request.data || {};
  if (!pendingId) throw new HttpsError("invalid-argument", "pendingId is required.");

  const ref = db.collection("assistant_pending").doc(pendingId);
  const result = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) throw new HttpsError("not-found", "This action no longer exists.");
    if (doc.data().status !== "pending") throw new HttpsError("failed-precondition", `Already ${doc.data().status}.`);
    tx.update(ref, { status: "approving" });
    return doc.data();
  });

  let outcome;
  try {
    outcome = await tools.executeApprovedWrite(db, result);
    await ref.update({ status: "approved", approvedBy: email, approvedAt: admin.firestore.FieldValue.serverTimestamp(), outcome });
  } catch (e) {
    await ref.update({ status: "failed", error: String(e && e.message || e) });
    throw new HttpsError("internal", `Could not apply this action: ${e && e.message}`);
  }

  await logActivity(db, { kind: "approve", email, pendingId, tool: result.tool, args: result.args, outcome });
  return { ok: true, outcome };
});

// -------------------------------------------------------------- assistantReject
exports.assistantReject = onCall({ cors: true }, async (request) => {
  const email = requireAuth(request);
  if (!(await roles.isOwnerOrEditor(db, email))) {
    throw new HttpsError("permission-denied", "Only the owner or an authorised editor can reject Jarvis actions.");
  }
  const { pendingId, reason } = request.data || {};
  if (!pendingId) throw new HttpsError("invalid-argument", "pendingId is required.");
  const ref = db.collection("assistant_pending").doc(pendingId);
  await ref.update({ status: "rejected", rejectedBy: email, rejectedAt: admin.firestore.FieldValue.serverTimestamp(), reason: reason || "" });
  await logActivity(db, { kind: "reject", email, pendingId, reason: reason || "" });
  return { ok: true };
});

// ------------------------------------------------------------------ assistantTTS
exports.assistantTTS = onCall({ cors: true, timeoutSeconds: 30 }, async (request) => {
  const email = requireAuth(request);
  if (!(await roles.isStaffUser(db, email))) throw new HttpsError("permission-denied", "Jarvis is available to staff accounts only.");
  const { text, voiceName, languageCode, speakingRate, pitch } = request.data || {};
  if (!text || !voiceName || !languageCode) throw new HttpsError("invalid-argument", "text, voiceName and languageCode are required.");
  const audioB64 = await tts.synthesize({ text, voiceName, languageCode, speakingRate, pitch });
  return { audioB64 };
});

// -------------------------------------------------------------- assistantListVoices
exports.assistantListVoices = onCall({ cors: true }, async (request) => {
  requireAuth(request);
  const { languageCode } = request.data || {};
  const voices = await tts.listVoices(languageCode);
  return { voices: voices.map((v) => ({ name: v.name, languageCodes: v.languageCodes, ssmlGender: v.ssmlGender, naturalSampleRateHertz: v.naturalSampleRateHertz })) };
});

// --------------------------------------------------------- assistantProactiveScan
exports.assistantProactiveScan = onSchedule({ schedule: "every day 02:00", timeZone: "Asia/Karachi" }, async () => {
  await runProactiveScan(db);
});
