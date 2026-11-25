# Jarvis AI Assistant — Setup (Free, No Card Required)

Jarvis is built into YQI as `jarvis.js`, loaded on every screen. The backend
runs on **Cloudflare Workers** (free tier, no credit card needed) instead of
Firebase Cloud Functions, because Cloud Functions require the Blaze plan,
which Google will not enable without a card on file — even for usage that
stays inside the free quota. This setup avoids that entirely.

Firestore itself (your existing database) is untouched — Jarvis reads/writes
it over the Firestore REST API using a Google service account, no SDK needed.

## What's built
- Chat with RAG grounding over external/internal inspections, CAPA, Amazon
  complaints, customer desks, and specs.
- Agentic tools: read tools run immediately; write tools (create CAPA, flag
  inspection, raise alert) are queued to `assistant_pending` and only applied
  after a staff member with owner/editor access approves them in the Jarvis
  panel.
- Proactive daily scan (Cloudflare Cron, 02:00 Asia/Karachi) for OQL
  breaches, missing YTM numbers, overdue open CAPA, and days with no internal
  inspections — raised as deduplicated alerts.
- Voice input via the browser's built-in `SpeechRecognition`.
- Voice output via the browser's built-in `speechSynthesis` — completely
  free, uses whatever voices are already installed on the device/browser.

## One-time setup (you do this; it only takes a few minutes)

### 1. Create a free Gemini API key
Go to https://aistudio.google.com/apikey → "Create API key". This is the
no-card free tier (separate from Vertex AI / Cloud Billing). Copy the key.

### 2. Create a Google service account for Firestore access
In the Google Cloud Console for project **yqi-yunus**:
1. IAM & Admin → Service Accounts → Create Service Account.
2. Grant it the role **Cloud Datastore User** (lets it read/write Firestore).
3. Create a JSON key for it and download the file.

Creating a service account and granting it a role does **not** require a
Cloud Billing account — only turning on certain paid APIs does, and this
does not touch any of those.

### 3. Sign up for Cloudflare (free, no card)
https://dash.cloudflare.com/sign-up — email + password only.

### 4. Deploy the Worker
From the `cf-worker/` folder in this repo:
```bash
npm install
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
# paste the key from step 1

npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON
# paste the *entire contents* of the JSON key file from step 2

npx wrangler deploy
```
`wrangler deploy` prints your Worker's URL, e.g.
`https://yqi-jarvis.<your-subdomain>.workers.dev`.

### 5. Point jarvis.js at your Worker
In `index.html`, add this line right **before** the `<script src="jarvis.js">`
tag:
```html
<script>window.JARVIS_WORKER_URL = "https://yqi-jarvis.<your-subdomain>.workers.dev";</script>
```
(Or edit the `WORKER_URL` constant directly in `stg/jarvis.js` and re-run
`python3 tools/bump.py --release`.)

### 6. Deploy the updated Firestore rules
```bash
firebase deploy --only firestore:rules
```

That's it — no credit card touched anywhere in this process.

## Known limitations
- Voice quality depends entirely on the voices already installed on the
  user's device/browser — there is no cloud multi-voice catalog. Some
  devices have very few voices, and Roman Urdu text is read phonetically by
  the closest available English/Hindi/Urdu voice rather than natively.
- This has not been deployed or tested against a live Cloudflare account
  from this environment — the code has been validated for syntax and the
  cryptographic/REST pieces (JWT signing, Firestore REST encoding) have been
  verified with passing runtime tests, but an end-to-end deploy should be
  checked after setup.
- Jarvis currently integrates with: external/internal inspections, CAPA,
  Amazon complaints, customer desks, and specs. Other YQI modules (daily
  activities, user records, etc.) can be added to the RAG/tool layer later.
- The old Firebase Functions backend (`functions/`) is kept in the repo for
  reference only — see `functions/README-DEPRECATED.md` — and is not wired
  into `firebase.json`, so it will not be deployed.

## Work location
This work lives on branch `feature/jarvis-ai-assistant` (PR open), not yet
merged to `main`.
