// Agentic tool layer, ported to the Firestore REST client. Same rule as the Firebase
// Functions version: READ tools run immediately; WRITE tools only ever queue a pending
// action in assistant_pending - they never touch core YQI collections directly. The
// actual write happens in executeApprovedWrite, called only from the /assistantApprove
// route after an owner/editor approves it.
import { addDoc, setDoc } from "./firestoreRest.js";
import * as rag from "./rag.js";

export const READ_TOOLS = [
  {
    name: "search_inspections",
    description: "Search external or internal inspection records in YQI (OQL, pass/fail, defects, YTM numbers). Use this before answering any question about inspection results, quality trends, or a specific customer/date range.",
    parameters: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["external", "internal"] },
        customer: { type: "string" },
        dateFrom: { type: "string" },
        dateTo: { type: "string" },
      },
      required: ["kind"],
    },
  },
  { name: "get_capa_records", description: "List open or recent CAPA (corrective/preventive action) records.", parameters: { type: "object", properties: {} } },
  { name: "get_amazon_complaint_themes", description: "List recorded Amazon customer-complaint themes per product.", parameters: { type: "object", properties: {} } },
  { name: "get_customer_summary", description: "Get the stored customer-desk summary record for one named customer.", parameters: { type: "object", properties: { customer: { type: "string" } }, required: ["customer"] } },
];

export const WRITE_TOOLS = [
  {
    name: "create_capa",
    description: "Propose a new CAPA record. Queued for human approval - does not save until an editor approves it.",
    parameters: {
      type: "object",
      properties: { customer: { type: "string" }, issue: { type: "string" }, rootCause: { type: "string" }, action: { type: "string" }, owner: { type: "string" }, due: { type: "string" } },
      required: ["customer", "issue", "action"],
    },
  },
  {
    name: "flag_inspection",
    description: "Propose flagging an existing inspection with a note. Queued for approval.",
    parameters: { type: "object", properties: { inspectionId: { type: "string" }, kind: { type: "string", enum: ["external", "internal"] }, note: { type: "string" } }, required: ["inspectionId", "kind", "note"] },
  },
  {
    name: "create_alert",
    description: "Raise a proactive alert for the team. Queued for approval before it is shown to others.",
    parameters: { type: "object", properties: { title: { type: "string" }, detail: { type: "string" }, severity: { type: "string", enum: ["info", "warning", "critical"] } }, required: ["title", "detail"] },
  },
];

export const ALL_TOOL_DECLARATIONS = [...READ_TOOLS, ...WRITE_TOOLS];
export const WRITE_TOOL_NAMES = new Set(WRITE_TOOLS.map((t) => t.name));

export async function runReadTool(token, projectId, name, args) {
  switch (name) {
    case "search_inspections": {
      const r = args.kind === "internal" ? await rag.internalInspections(token, projectId, args) : await rag.externalInspections(token, projectId, args);
      return r.text || "No matching inspection records.";
    }
    case "get_capa_records":
      return (await rag.capaRecords(token, projectId, {})).text || "No CAPA records found.";
    case "get_amazon_complaint_themes":
      return (await rag.amazonComplaints(token, projectId)).text || "No Amazon complaint data recorded.";
    case "get_customer_summary": {
      const r = await rag.customerDesk(token, projectId, args.customer);
      return (r && r.text) || `No stored summary for "${args.customer}".`;
    }
    default:
      return `Unknown read tool: ${name}`;
  }
}

export async function queueWriteTool(token, projectId, name, args, { email, uid, sessionId }) {
  const { id } = await addDoc(token, projectId, "assistant_pending", {
    tool: name,
    args: JSON.stringify(args),
    status: "pending",
    requestedByEmail: email || "",
    requestedByUid: uid || "",
    sessionId: sessionId || "",
    createdAt: new Date(),
  });
  return id;
}

export async function executeApprovedWrite(token, projectId, pending) {
  const tool = pending.tool;
  const args = typeof pending.args === "string" ? JSON.parse(pending.args) : pending.args;
  switch (tool) {
    case "create_capa": {
      const { id } = await addDoc(token, projectId, "capa", {
        customer: args.customer || "", issue: args.issue || "", rootCause: args.rootCause || "", action: args.action || "",
        owner: args.owner || "", due: args.due || "", status: "open", source: "jarvis", at: new Date(),
      });
      return { collection: "capa", id };
    }
    case "flag_inspection": {
      const col = args.kind === "internal" ? "is_int" : "is_ext";
      await setDoc(token, projectId, `${col}/${args.inspectionId}`, { jarvisFlag: { note: args.note || "", at: new Date() } }, { merge: true });
      return { collection: col, id: args.inspectionId };
    }
    case "create_alert": {
      const { id } = await addDoc(token, projectId, "assistant_alerts", {
        title: args.title || "", detail: args.detail || "", severity: args.severity || "info", source: "jarvis", at: new Date(),
      });
      return { collection: "assistant_alerts", id };
    }
    default:
      throw new Error(`Unknown write tool: ${tool}`);
  }
}
