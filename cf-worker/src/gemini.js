// Same Gemini wrapper as the Firebase Functions version - works unchanged on Workers
// since it's plain fetch. Uses the free Google AI Studio API key (no Cloud Billing
// account / card needed for the free tier).
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function generate({ apiKey, model, systemInstruction, contents, tools }) {
  const body = {
    systemInstruction: systemInstruction ? { role: "system", parts: [{ text: systemInstruction }] } : undefined,
    contents,
    tools: tools && tools.length ? [{ functionDeclarations: tools }] : undefined,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  };
  const res = await fetch(`${API_BASE}/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${(await res.text().catch(() => "")).slice(0, 500)}`);
  return res.json();
}

export function parseResponse(raw) {
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
