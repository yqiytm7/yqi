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
import { verifyFirebaseIdToken } from "./firebaseAuth.js";
import { getAccessToken } from "./serviceAccountToken.js";
import * as roles from "./roles.js";
import * as gemini from "./gemini.js";
import * as rag from "./rag.js";
import * as tools from "./tools.js";
import { getDoc, setDoc } from "./firestoreRest.js";
import { logActivity } from "./log.js";
import { runProactiveScan } from "./proactive.js";

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
