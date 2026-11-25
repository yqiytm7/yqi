# DEPRECATED — not used, do not deploy

This `functions/` directory (Firebase Cloud Functions backend) is **not used**
by the Jarvis AI assistant and must not be deployed.

It requires the Firebase **Blaze** (pay-as-you-go) billing plan, which
requires a credit/debit card on file — even though actual usage would stay
within free quotas, Google requires a card to enable Blaze at all.

Per the project owner's requirement (no card, ever), the active backend is
instead **`cf-worker/`** — a Cloudflare Worker that needs no billing account
and no card. See `docs/JARVIS-SETUP.md` for the real setup steps.

This folder is kept only as reference code (same logic, Admin-SDK style)
in case Blaze is ever adopted later. `firebase.json` no longer references
it, so `firebase deploy` will not touch it.
