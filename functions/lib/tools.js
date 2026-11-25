// Agentic tool layer. READ tools run immediately and feed results back to the model.
// WRITE tools never touch Firestore directly here - they create a row in
// assistant_pending/{id} and the actual write only happens when a human approves it
// via the assistantApprove callable (see index.js). This is the "approval controls for
// sensitive operations" requirement: Jarvis can propose and prepare an action, but a
// person with edit rights has to confirm it before anything changes in the app.
"use strict";

const { FieldValue } = require("firebase-admin/firestore");
const rag = require("./rag");

const READ_TOOLS = [
  {
    name: "search_inspections",
    description:
      "Search external or internal inspection records in YQI (OQL, pass/fail, defects, YTM numbers). Use this before answering any question about inspection results, quality trends, or a specific customer/date range.",
    parameters: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["external", "internal"], description: "external = is_ext (buyer/3rd-party inspections), internal = is_int (floor inspections)" },
        customer: { type: "string", description: "Customer name, e.g. Bedsure, Target, Walmart. Omit for all customers." },
        dateFrom: { type: "string", description: "YYYY-MM-DD, inclusive" },
        dateTo: { type: "string", description: "YYYY-MM-DD, inclusive" },
      },
      required: ["kind"],
    },
  },
  {
    name: "get_capa_records",
    description: "List open or recent CAPA (corrective/preventive action) records.",
    parameters: { type: "object", properties: { dateFrom: { type: "string" }, dateTo: { type: "string" } } },
  },
  {
    name: "get_amazon_complaint_themes",
    description: "List recorded Amazon customer-complaint themes per product (why ratings are low/high).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_customer_summary",
    description: "Get the stored customer-desk summary record (OQL, grade, notes) for one named customer.",
    parameters: { type: "object", properties: { customer: { type: "string" } }, required: ["customer"] },
  },
];

const WRITE_TOOLS = [
  {
    name: "create_capa",
    description:
      "Propose a new CAPA (corrective/preventive action) record. This is queued for human approval - it does not save until an editor approves it.",
    parameters: {
      type: "object",
      properties: {
        customer: { type: "string" },
        issue: { type: "string" },
        rootCause: { type: "string" },
        action: { type: "string" },
        owner: { type: "string", description: "Person responsible" },
        due: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["customer", "issue", "action"],
    },
  },
  {
    name: "flag_inspection",
    description: "Propose flagging an existing inspection record with a note (e.g. 'missing YTM number', 'needs re-check'). Queued for approval.",
    parameters: {
      type: "object",
      properties: { inspectionId: { type: "string" }, kind: { type: "string", enum: ["external", "internal"] }, note: { type: "string" } },
      required: ["inspectionId", "kind", "note"],
    },
  },
  {
    name: "create_alert",
    description: "Raise a proactive alert for the team about a quality issue, trend, or gap you noticed. Queued for approval before it is shown to others.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        detail: { type: "string" },
        severity: { type: "string", enum: ["info", "warning", "critical"] },
      },
      required: ["title", "detail"],
    },
  },
];

const ALL_TOOL_DECLARATIONS = [...READ_TOOLS, ...WRITE_TOOLS];
const WRITE_TOOL_NAMES = new Set(WRITE_TOOLS.map((t) => t.name));

async function runReadTool(db, name, args) {
  switch (name) {
    case "search_inspections": {
      const r =
        args.kind === "internal"
          ? await rag.internalInspections(db, { dateFrom: args.dateFrom, dateTo: args.dateTo })
          : await rag.externalInspections(db, { customer: args.customer, dateFrom: args.dateFrom, dateTo: args.dateTo });
      return r.text || "No matching inspection records.";
    }
    case "get_capa_records": {
      const r = await rag.capaRecords(db, { dateFrom: args.dateFrom, dateTo: args.dateTo });
      return r.text || "No CAPA records found.";
    }
    case "get_amazon_complaint_themes": {
      const r = await rag.amazonComplaints(db, {});
      return r.text || "No Amazon complaint data recorded.";
    }
    case "get_customer_summary": {
      const r = await rag.customerDesk(db, args.customer);
      return (r && r.text) || `No stored summary for "${args.customer}".`;
    }
    default:
      return `Unknown read tool: ${name}`;
  }
}

// Queues a write tool call for human approval. Returns the pending-action doc id so the
// frontend can show an Approve/Reject card and the model can tell the user it's queued.
async function queueWriteTool(db, name, args, { email, uid, sessionId }) {
  const ref = db.collection("assistant_pending").doc();
  await ref.set({
    tool: name,
    args,
    status: "pending",
    requestedByEmail: email || null,
    requestedByUid: uid || null,
    sessionId: sessionId || null,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

// Actually performs a write tool once a human has approved it (called from assistantApprove).
async function executeApprovedWrite(db, pending) {
  const { tool, args } = pending;
  switch (tool) {
    case "create_capa": {
      const ref = db.collection("capa").doc();
      await ref.set({
        customer: args.customer || "",
        issue: args.issue || "",
        rootCause: args.rootCause || "",
        action: args.action || "",
        owner: args.owner || "",
        due: args.due || "",
        status: "open",
        source: "jarvis",
        at: FieldValue.serverTimestamp(),
      });
      return { collection: "capa", id: ref.id };
    }
    case "flag_inspection": {
      const col = args.kind === "internal" ? "is_int" : "is_ext";
      await db.collection(col).doc(args.inspectionId).set(
        { jarvisFlag: { note: args.note || "", at: FieldValue.serverTimestamp() } },
        { merge: true }
      );
      return { collection: col, id: args.inspectionId };
    }
    case "create_alert": {
      const ref = db.collection("assistant_alerts").doc();
      await ref.set({
        title: args.title || "",
        detail: args.detail || "",
        severity: args.severity || "info",
        source: "jarvis",
        at: FieldValue.serverTimestamp(),
        read: {},
      });
      return { collection: "assistant_alerts", id: ref.id };
    }
    default:
      throw new Error(`Unknown write tool: ${tool}`);
  }
}

module.exports = { ALL_TOOL_DECLARATIONS, WRITE_TOOL_NAMES, runReadTool, queueWriteTool, executeApprovedWrite };
