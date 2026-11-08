# 🗺️ Product Roadmap & Community Goals

The mission of **OSForms** is to provide a headless, developer-first form backend that empowers users to own their data. We prioritize features that eliminate "feature taxes" found in commercial alternatives.

## ✅ Shipped

| Feature                   | Notes                                                                                                           |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------- |
| **Honeypot & CORS**       | Per-form honeypot field and allowed origins in form settings. Optional reCAPTCHA / hCaptcha / Turnstile (BYOK). |
| **Webhooks**              | HMAC-SHA256 signed (`X-osforms-Signature`), custom headers, 30s timeout.                                        |
| **Custom Redirects**      | Per-form redirect URL; HTML form posts get a 303 redirect.                                                      |
| **Auto-Responders**       | Optional auto-reply on the Resend email integration, sent with the user's own key.                              |
| **Submission Dashboard**  | Browse submissions, submission charts, integration logs, in-app notifications.                                  |
| **Data Export (CSV)**     | CSV export per form. JSON export is still open (issue #16).                                                     |
| **API Keys & Pull API**   | Read-only `osf_live_` keys scoped to selected forms; `GET /api/v1/submissions`, 60 req/min per key.             |
| **Visual Code Generator** | Form builder plus copy-paste snippets on the form page and in onboarding.                                       |
| **Self-Hosting Docs**     | `SELF_HOSTING.md` and a one-command `docker compose up` (Dockerfile + bundled MongoDB).                         |

---

## 🟢 Phase 1: The "Trust & Utility" Layer

**Goal:** Make the API production-ready and unblock custom workflows.

All Phase 1 items (honeypot & CORS, webhooks, redirects, auto-responders) have shipped. See above.

---

## 🟡 Phase 2: The "BYOK" Value Unlock

**Goal:** Disrupt the market by offering "Enterprise" features for free using User Keys.

| Feature                    | Importance | Why it helps user acquisition                                                  |
| :------------------------- | :--------- | :----------------------------------------------------------------------------- |
| **Google Drive Uploads**   | Very High  | **Our "Killer Feature."** Free file uploads (unlimited) via user's GCP.        |
| **Data Export (JSON)**     | High       | Shows developers they own their data. CSV ships today; JSON is issue #16.      |
| **Advanced Rate Limiting** | Medium     | Protects our infra and user's Resend quotas from abuse.                        |
| **Submission Filtering**   | Medium     | Search and filter results in the dashboard (browsing and charts already ship). |

---

## 🔵 Phase 3: Community & Expansion

**Goal:** Build the ecosystem and invite outside contributors.

| Feature                 | Importance | Why it helps user acquisition                                |
| :---------------------- | :--------- | :----------------------------------------------------------- |
| **Native Integrations** | Medium     | One-click Slack, Discord, and Notion buttons for non-coders. |
| **CLI Tool**            | Low        | Manage forms and keys from the terminal (Dev-favored).       |

---

## 📈 Community Goals

1. **GitHub Stars:** Target 100 stars by Phase 1 completion via "Show HN" and Reddit (r/selfhosted).
2. **Contributors:** Tag issues with `good-first-issue` for Webhooks and UI polish.
3. **Transparency:** Maintain a public "Integrations Request" board.
