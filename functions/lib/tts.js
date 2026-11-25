// Google Cloud Text-to-Speech wrapper. Uses the Cloud Functions runtime's own service
// account (via google-auth-library) rather than a separate API key, so the only setup
// step is enabling the "Cloud Text-to-Speech API" on the yqi-yunus GCP project (Blaze
// plan) and nothing else needs a secret.
//
// Voices are NOT hardcoded here: call listVoices() to get the live catalog from Google
// (names change over time, and language coverage - e.g. whether a Pakistani-Urdu voice
// exists - should be checked against the real list rather than guessed). The frontend
// voice picker in jarvis.js calls assistantListVoices and lets the user preview+pick.
"use strict";

const { GoogleAuth } = require("google-auth-library");

const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
let cachedClient = null;

async function client() {
  if (!cachedClient) cachedClient = await auth.getClient();
  return cachedClient;
}

async function listVoices(languageCode) {
  const c = await client();
  const url = "https://texttospeech.googleapis.com/v1/voices" + (languageCode ? `?languageCode=${encodeURIComponent(languageCode)}` : "");
  const res = await c.request({ url });
  return (res.data && res.data.voices) || [];
}

/**
 * @param {object} opts
 * @param {string} opts.text
 * @param {string} opts.voiceName - e.g. "en-US-Neural2-D"
 * @param {string} opts.languageCode - e.g. "en-US"
 * @param {number} [opts.speakingRate] - 0.25 - 4.0, default 1.0
 * @param {number} [opts.pitch] - -20.0 - 20.0, default 0.0
 * @returns {Promise<string>} base64-encoded MP3 audio
 */
async function synthesize({ text, voiceName, languageCode, speakingRate = 1.0, pitch = 0.0 }) {
  if (!text || !text.trim()) throw new Error("No text to speak.");
  if (text.length > 4800) text = text.slice(0, 4800); // Cloud TTS per-request char limit is 5000
  const c = await client();
  const res = await c.request({
    url: "https://texttospeech.googleapis.com/v1/text:synthesize",
    method: "POST",
    data: {
      input: { text },
      voice: { name: voiceName, languageCode },
      audioConfig: { audioEncoding: "MP3", speakingRate, pitch },
    },
  });
  return res.data.audioContent; // base64
}

module.exports = { listVoices, synthesize };
