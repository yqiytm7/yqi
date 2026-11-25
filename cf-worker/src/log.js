import { addDoc } from "./firestoreRest.js";

export async function logActivity(token, projectId, entry) {
  try {
    await addDoc(token, projectId, "assistant_logs", { ...entry, at: new Date() });
  } catch (e) {
    console.error("assistant log write failed", e);
  }
}
