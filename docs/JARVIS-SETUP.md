# Jarvis - YQI AI assistant: setup

This adds a Firebase Functions backend (`functions/`) and a frontend module
(`jarvis.js`) implementing a RAG + agentic assistant over YQI's data, with
voice in/out. Nothing in here changes existing modules (app.js logic is
untouched apart from its auto-generated version stamp).

## What you need to do before it works (things only you can authorize)

1. **Upgrade the `yqi-yunus` Firebase project to the Blaze (pay-as-you-go)
   plan.** Cloud Functions that call an external API (Gemini, Text-to-Speech)
   require Blaze - the free Spark plan cannot run them. Blaze still has a
   generous free monthly quota; you only pay for usage beyond that.
   Firebase console -> yqi-yunus -> Upgrade plan.

2. **Get a Gemini API key** from https://aistudio.google.com/apikey (free
   tier available) and set it as a Functions secret:
   ```
   firebase functions:secrets:set GEMINI_API_KEY
   ```
   (paste the key when prompted).

3. **Enable the Cloud Text-to-Speech API** on the same GCP project (used for
   multi-voice spoken replies): console.cloud.google.com -> APIs & Services
   -> enable "Cloud Text-to-Speech API" for project `yqi-yunus`. No separate
   key needed - it uses the Functions service account.

4. **Deploy:**
   ```
   firebase deploy --only functions,firestore:rules
   ```

That's it for the backend. The frontend (`jarvis.js`) is already wired into
`index.html` and will quietly do nothing until the functions above exist and
you're signed in with a staff-level YQI account (qc/qa/auth - guests and
customers don't see it, same as the rest of the company data).

## What's built

- **RAG**: `functions/lib/rag.js` pulls grounded context from `is_ext`,
  `is_int`, `capa`, `amzcat`, `cust/{customer}` and `ws/{wid}/specs` based on
  the question asked, before Gemini answers - it isn't guessing from memory.
- **Agentic tools**: `functions/lib/tools.js`. Read tools (search inspections,
  CAPA, Amazon themes, customer summaries) run immediately. Write tools
  (create CAPA, flag an inspection, raise an alert) are never executed
  directly - they're queued in `assistant_pending` and only applied once an
  owner/editor approves them from the Approvals tab (or rejects them).
- **Proactive intelligence**: `functions/lib/proactive.js` runs daily
  (02:00 Asia/Karachi) and raises alerts for OQL breaches, inspections
  missing a YTM number, overdue CAPA records, and days with no internal
  inspection data at all.
- **Voice in**: browser SpeechRecognition (Web Speech API) - free, no backend
  call, works in Chrome/Edge and most Android WebViews.
- **Voice out / multi-voice**: Google Cloud Text-to-Speech via
  `assistantTTS`, with a live voice picker (`assistantListVoices`) so you
  always see Google's actual current catalog rather than a hardcoded list -
  preview any voice before selecting it, plus speed/pitch sliders and a
  per-user saved preference (`assistant_settings/{uid}`). Falls back to the
  browser's own built-in speech synthesis if the backend isn't reachable.
- **Security**: every assistant collection has its own Firestore rule
  (`assistant_sessions`, `assistant_settings`, `assistant_pending`,
  `assistant_alerts`, `assistant_logs`) scoped by the same role system
  (`OWNER_EMAIL`/editors/levels) the rest of the app already uses. Every
  chat turn, tool call, approval and rejection is written to
  `assistant_logs` (append-only, readable by owner/editors only) as an audit
  trail.

## Known limitations, stated plainly

- **Roman Urdu speech**: there is no dedicated "Roman Urdu" voice in Google's
  TTS catalog as far as this build can check. Spoken replies use the closest
  available English or Hindi voice reading the Roman-Urdu text phonetically -
  it will sound approximate, not native. The chat UI's *text* replies are
  still in Roman Urdu when you write in Roman Urdu, per your usual
  preference.
- **This has not been deployed or tested against a live Firebase project**
  from here - this environment has no Firebase credentials, no billing
  access, and no way to call Gemini/Cloud TTS to verify end to end. The code
  follows the existing app's own data model and role system closely, but
  please run it on `/staging` first and watch the browser console before
  trusting it with real CAPA writes.
- **Scope of "deep integration"**: the RAG/tool layer currently covers
  external/internal inspections, CAPA, Amazon complaint themes, customer
  desks and specs - the modules with the clearest existing data shape. Other
  modules (shipping plans, one-liner/orders, wastage, shade cards) aren't
  wired into tools yet; `rag.js` and `tools.js` are written to make adding a
  new source a short, self-contained addition (one retriever function,
  pattern already established).
- **Cost**: Blaze + Gemini's free tier + Cloud TTS's free monthly quota
  should cover light daily use at no cost; heavier use (long chats, lots of
  spoken replies) will incur small per-request charges. There is no budget
  cap wired in yet - consider setting a GCP budget alert.

## Branch

This was built on `feature/jarvis-ai-assistant` and not merged to `main` -
nothing here is live until you review and merge it.
