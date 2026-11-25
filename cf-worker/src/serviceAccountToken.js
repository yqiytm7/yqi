// Mints a short-lived Google OAuth2 access token from a service-account key JSON
// (the standard JWT-bearer flow), so the Worker can call Firestore's REST API with the
// same permissions firebase-admin would have had - without needing Node or the Admin SDK.
import { signJwtRS256 } from "./jwt.js";

let cached = null; // { token, exp }

export async function getAccessToken(serviceAccountJson, scope = "https://www.googleapis.com/auth/datastore") {
  if (cached && cached.exp - 30 > Math.floor(Date.now() / 1000)) return cached.token;

  const sa = typeof serviceAccountJson === "string" ? JSON.parse(serviceAccountJson) : serviceAccountJson;
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: sa.client_email,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const assertion = await signJwtRS256(claims, sa.private_key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!res.ok) throw new Error(`Could not mint Google access token: ${res.status} ${await res.text().catch(() => "")}`);
  const data = await res.json();
  cached = { token: data.access_token, exp: now + (data.expires_in || 3600) };
  return cached.token;
}
