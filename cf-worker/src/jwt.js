// Small RS256 JWT helpers built on the Web Crypto API (available natively in Cloudflare
// Workers - no jsonwebtoken/jose dependency needed, so `wrangler deploy` works with zero
// npm installs).

function b64urlEncode(bytes) {
  let bin = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlEncodeStr(str) {
  return b64urlEncode(new TextEncoder().encode(str));
}
function b64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64Decode(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/, "").replace(/-----END [^-]+-----/, "").replace(/\s+/g, "");
  return b64Decode(b64).buffer;
}

// Signs a JWT (RS256) with a PKCS#8 PEM private key, e.g. from a Google service account JSON key.
export async function signJwtRS256(claims, privateKeyPem, extraHeader = {}) {
  const header = { alg: "RS256", typ: "JWT", ...extraHeader };
  const toSign = `${b64urlEncodeStr(JSON.stringify(header))}.${b64urlEncodeStr(JSON.stringify(claims))}`;
  const key = await crypto.subtle.importKey("pkcs8", pemToArrayBuffer(privateKeyPem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(toSign));
  return `${toSign}.${b64urlEncode(sig)}`;
}

// Verifies an RS256 JWT against a JWKS endpoint (Google's public keys). Checks signature,
// expiry and (optionally) issuer/audience. Returns the decoded payload or throws.
export async function verifyJwtRS256(token, jwksUrl, { issuer, audience } = {}) {
  const [headerB64, payloadB64, sigB64] = token.split(".");
  if (!headerB64 || !payloadB64 || !sigB64) throw new Error("Malformed token");
  const header = JSON.parse(new TextDecoder().decode(b64urlDecode(headerB64)));
  const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadB64)));

  const jwksRes = await fetch(jwksUrl);
  if (!jwksRes.ok) throw new Error("Could not fetch JWKS");
  const jwks = await jwksRes.json();
  const jwk = (jwks.keys || []).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("No matching signing key (kid) found");

  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlDecode(sigB64), new TextEncoder().encode(`${headerB64}.${payloadB64}`));
  if (!ok) throw new Error("Invalid token signature");

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error("Token expired");
  if (issuer && payload.iss !== issuer) throw new Error("Unexpected issuer");
  if (audience && payload.aud !== audience) throw new Error("Unexpected audience");
  return payload;
}
