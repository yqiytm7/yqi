// Verifies a Firebase Auth ID token (the same token firebase.auth().currentUser.getIdToken()
// returns) against Google's public signing keys - this is how the Worker knows who is
// calling without needing the Admin SDK.
import { verifyJwtRS256 } from "./jwt.js";

const JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

export async function verifyFirebaseIdToken(idToken, projectId) {
  const payload = await verifyJwtRS256(idToken, JWKS_URL, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  if (!payload.email_verified) throw new Error("Email not verified");
  return { email: String(payload.email || "").toLowerCase(), uid: payload.user_id || payload.sub };
}
