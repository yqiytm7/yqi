// Thin wrapper around the Gemini API (generativelanguage.googleapis.com) using Node's
// built-in fetch, so no extra SDK dependency is required. Supports function calling
// (tools) which is how the agentic workflow and RAG grounding are wired together.
"use strict";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function apiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured (see functions secrets).");
  return key;
}

/**
 * @param {object} opts
 * @param {string} opts.systemInstruction - grounding + persona + rules for the assistant
 * @param {Array}  opts.contents - Gemini "contents" array (chat history incl. latest turn)
 * @param {Array}  [opts.tools] - Gemini tool/function declarations
 * @returns {Promise<object>} raw Gemini response JSON
 */
async function generate({ systemInstruction, contents, tools }) {
  const body = {
    systemInstruction: systemInstruction ? { role: "system", parts: [{ text: systemInstruction }] } : undefined,
    contents,
    tools: tools && tools.length ? [{ functionDeclarations: tools }] : undefined,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  };
  const res = await fetch(`${API_BASE}/models/${MODEL}:generateContent?key=${apiKey()}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${t.slice(0, 500)}`);
  }
  return res.json();
}

// Pulls out: plain text (if any), and any functionCall parts the model asked to run.
function parseResponse(raw) {
  const cand = raw && raw.candidates && raw.candidates[0];
  const parts = (cand && cand.content && cand.content.parts) || [];
  let text = "";
  const calls = [];
  for (const p of parts) {
    if (p.text) text += p.text;
    if (p.functionCall) calls.push({ name: p.functionCall.name, args: p.functionCall.args || {} });
  }
  return { text: text.trim(), calls, finishReason: cand && cand.finishReason };
}

module.exports = { generate, parseResponse, MODEL };
