# Self-Hosting OSForms

Run your own OSForms instance, with submission limits you control (see [Raise the submission limit](#raise-the-submission-limit)). This guide goes from a fresh fork to a deployed app, end to end. Three paths:

- **[Docker](#run-with-docker)** — the fastest way to run the whole stack.
- **[Local](#local-development)** — run it from source on your machine for development.
- **[Production](#deploy-to-production)** — deploy to Vercel + MongoDB Atlas (what osforms.com runs on).

OSForms is a standard Next.js app, so anywhere Next.js runs (Docker, a VPS, Railway, Render, Vercel) works.

---

## Run with Docker

If you have Docker, this is the whole thing:

```bash
git clone https://github.com/hawkeye-sama/osforms.git
cd osforms

# 1. Create your env file from the template
cp .env.docker.example .env

# 2. Generate the two required secrets (run twice, paste into .env)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Start it
docker compose up
```

Compose builds the app, starts MongoDB, wires them together, and serves OSForms at [http://localhost:3000](http://localhost:3000).

Your config lives in `.env`, not in `docker-compose.yml`, so no secrets sit in a tracked file. Set `JWT_SECRET` and `ENCRYPTION_KEY` (the two generated values) and you're running. `MONGODB_URI` defaults to the bundled mongo service, so you only touch it to point at an external database like Atlas. If you skip step 1, Compose stops with an "env file .env not found" error.

Two more things:

- **Your domain.** For a real deployment set `NEXT_PUBLIC_APP_URL` in `.env` to your URL, then rebuild so it's baked into the client bundle: `docker compose up --build`.
- **Verification email won't arrive.** Signup sends a 6-digit OTP, but a self-hosted instance can't deliver system emails yet, and the code is never logged. Read it from MongoDB instead: see [Verify your account without email](#verify-your-account-without-email).

Integrations run correctly under Docker. They execute in the background after each submission is stored, in the long-running Node process — see [background execution](#background-execution-limits) for why that differs from the serverless setup.

---

## Prerequisites

- **Node.js 20+** and **pnpm 10+** (`corepack enable`, or `npm i -g pnpm`)
- A **MongoDB** database (local Docker or MongoDB Atlas)
- Optional: a **Resend** account (emails) and **Google Cloud** project (Google Sheets)

---

## Local development

```bash
# 1. Fork on GitHub, then clone your fork
git clone https://github.com/<your-username>/osforms.git
cd osforms

# 2. Install the workspace
pnpm install

# 3. Create your env file (it lives inside apps/web)
cp apps/web/.env.example apps/web/.env
```

Generate the two secrets and paste them into `apps/web/.env`:

```bash
# Run twice — once for JWT_SECRET, once for ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Minimum working `apps/web/.env`:

```bash
MONGODB_URI=mongodb://localhost:27017/osforms
JWT_SECRET=<paste a random hex string>
ENCRYPTION_KEY=<paste a 64-char hex string>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start MongoDB and the app:

```bash
docker compose up -d mongodb          # only MongoDB, on localhost:27017
pnpm build --filter @osforms/react    # build the SDK once (the app imports it)
pnpm dev                              # start the app
```

Name the `mongodb` service. A bare `docker compose up` also builds and starts the `web` container on port 3000, which clashes with `pnpm dev` and needs a root `.env`.

Open [http://localhost:3000](http://localhost:3000) and sign up.

> **Email in local dev:** the verification email won't arrive and the OTP isn't logged. Read it from MongoDB (next section).

---

## Verify your account without email

Signup sends a 6-digit OTP, but a self-hosted instance can't deliver it yet:

- System emails (OTP, welcome, integration-failure alerts) are sent from hardcoded `@osforms.com` addresses. Resend rejects those for your account and OSForms doesn't surface the error, so signup looks fine but nothing arrives. Sending system emails from your own domain isn't supported yet.
- Without `RESEND_API_KEY`, sending throws and signup returns a 500. Your account and code were already saved, so you can still verify.

Read the latest code from MongoDB:

```bash
# Docker (self-host or local dev with the bundled mongo)
docker compose exec mongodb mongosh osforms --eval 'db.emailverifications.find().sort({createdAt:-1}).limit(1)'

# Any other MongoDB (local install, Atlas): use your MONGODB_URI
mongosh "<your MONGODB_URI>" --eval 'db.emailverifications.find().sort({createdAt:-1}).limit(1)'
```

Then open `/verify-email?email=<your email>` (e.g. `http://localhost:3000/verify-email?email=you@example.com`) and enter the `code`. Logging in with an unverified account also sends you there. Codes expire after 30 minutes; if yours has, click resend on that page and query again.

---

## Raise the submission limit

Every account gets a 100 submissions/month limit (`monthlySubmissionLimit` on the user), enforced by the submission endpoint. No env var changes it. Raise it in MongoDB:

```bash
# Docker
docker compose exec mongodb mongosh osforms --eval 'db.users.updateMany({}, {$set: {monthlySubmissionLimit: 1000000}})'

# Any other MongoDB: use your MONGODB_URI
mongosh "<your MONGODB_URI>" --eval 'db.users.updateMany({}, {$set: {monthlySubmissionLimit: 1000000}})'
```

This only updates existing users. Accounts created later still start at 100, so rerun it after new signups.

---

## Configure integrations (optional)

All three integrations are BYOK — you add the keys, you own the data. None are required to run OSForms, but here's how to wire each one.

### Resend (email)

The Resend email integration needs no server config. Each user adds their own Resend API key when they set it up on a form, and that key is what sends the notification and auto-reply emails.

`RESEND_API_KEY` is separate: it's only for system emails (OTP / verification, welcome, integration-failure alerts). Those are sent from hardcoded `@osforms.com` addresses, so on a self-hosted instance they won't be delivered even with a key (see [Verify your account without email](#verify-your-account-without-email)).

`RESEND_EMAIL_SIGNING_SECRET` is only used by osforms.com's inbound email forwarding. Leave it blank when self-hosting.

### Google Sheets (Google OAuth)

1. In the [Google Cloud Console](https://console.cloud.google.com), create a project.
2. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application.**
3. Add an **Authorized redirect URI** that exactly matches your app URL plus the callback path:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
4. Copy the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

The redirect URI is built from `NEXT_PUBLIC_APP_URL`, so that variable must match the domain you registered.

### Webhooks

No setup or keys required — users add a webhook URL per form in the dashboard. When the webhook has a secret, deliveries carry an `X-osforms-Signature` header: the lowercase hex HMAC-SHA256 of the raw JSON body, with no `sha256=` prefix.

---

## Signup spam protection (optional)

If your instance is reachable from the internet, bots will find `/signup` and fill your database with junk accounts. Skip this for a private or local-only install.

Out of the box, every instance gets a **per-IP rate limit** with no setup: 5 signup attempts and 10 OTP resends per IP per hour, stored in MongoDB so it holds across serverless instances. The client IP comes from the leftmost `X-Forwarded-For` entry, so run behind a proxy that sets or overwrites that header (Vercel does); exposed directly, clients can spoof it.

To block scripted signups as well, turn on Google reCAPTCHA v3. It's invisible: real users never see a challenge.

1. Go to [google.com/recaptcha/admin/create](https://www.google.com/recaptcha/admin/create) and sign in with a Google account.
2. Choose **Score based (v3)**. Add your domain (e.g. `forms.yourdomain.com`). Add `localhost` too if you want it active in local dev.
3. Pick (or create) a Google Cloud project when asked. reCAPTCHA keys now live inside Google Cloud; the first 10,000 checks a month are free, which covers signups for any normal instance.
4. Copy both keys into your env:

   ```bash
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...   # "Site key" — baked into the browser bundle
   RECAPTCHA_SECRET_KEY=6Lc...             # "Secret key" — server only
   # RECAPTCHA_MIN_SCORE=0.5               # optional, 0.0 (bot) to 1.0 (human)
   ```

5. Rebuild. The site key is inlined at build time, so redeploy on Vercel or run `docker compose up --build`.

Set **both keys or neither**. The CAPTCHA turns on when `RECAPTCHA_SECRET_KEY` is set, so a secret without a site key in the build rejects every signup.

Rejected attempts are logged as `[reCAPTCHA] low score` or `[reCAPTCHA] rejected token`. If real users get blocked, lower `RECAPTCHA_MIN_SCORE` (e.g. `0.3`); if spam still gets through, raise it.

---

## Deploy to production

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and copy the connection string (`mongodb+srv://...`).
3. Under **Network Access**, allow your host's IPs (for Vercel, `0.0.0.0/0` is the simplest option).
4. This string is your production `MONGODB_URI`.

### 2. Vercel

1. Import your fork at [vercel.com/new](https://vercel.com/new).
2. Set these project settings (the monorepo needs the SDK built before the web app):

   | Setting          | Value                                                                    |
   | ---------------- | ------------------------------------------------------------------------ |
   | Framework Preset | Next.js                                                                  |
   | Root Directory   | `apps/web`                                                               |
   | Install Command  | `pnpm install`                                                           |
   | Build Command    | `pnpm --filter @osforms/react build && pnpm --filter @osforms/web build` |

3. Add the environment variables (Project → Settings → Environment Variables):
   - `MONGODB_URI` — your Atlas string
   - `JWT_SECRET` — a fresh random hex string
   - `ENCRYPTION_KEY` — a fresh 64-char hex string
   - `NEXT_PUBLIC_APP_URL` — your production URL, e.g. `https://forms.yourdomain.com`
   - Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY` (system emails; see [Resend](#resend-email))
   - Recommended for public instances: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` (see [signup spam protection](#signup-spam-protection-optional))
4. Deploy. After the first deploy, update your Google OAuth redirect URI (above) to the production domain.

> Keep `JWT_SECRET` and `ENCRYPTION_KEY` stable once you have live data. Rotating `ENCRYPTION_KEY` makes already-stored integration keys undecryptable.

### Background execution limits

Integrations run after the submission is stored, so the form POST returns immediately. How long the background work is allowed to run depends on where you host:

- **Docker / VPS / any long-running Node server:** no cap. The process stays alive, so the integration promise just completes on the event loop. `waitUntil` is a harmless no-op here; the work runs regardless. This is the fire-and-forget setup.
- **Vercel Hobby:** ~10 seconds of background execution after the response is sent.
- **Vercel Pro:** up to 60 seconds.

On Vercel, a slow integration (a sluggish webhook endpoint, a large Sheets append) can be cut off by the serverless window. Use Pro for heavier workloads, or self-host on a platform without that cap.

---

## Keep your fork in sync

Your fork ships with a scheduled GitHub Action — [.github/workflows/sync-fork.yml](.github/workflows/sync-fork.yml) — that pulls upstream changes into your fork's `main` automatically. It only runs on forks (the upstream repo skips it).

**Enable it once:**

1. On your fork, open the **Actions** tab and click **"I understand my workflows, go ahead and enable them"** (GitHub disables Actions on new forks by default).
2. That's it. The **Sync Fork** workflow then runs daily at 06:00 UTC. To sync immediately, open **Actions → Sync Fork → Run workflow**.

**How it behaves:**

- It does a **fast-forward-only** sync — it never force-overwrites your branch.
- If your fork's `main` has **diverged** from upstream (you committed directly to `main`), the sync fails instead of clobbering your commits. Do your own work on feature branches and keep `main` a clean mirror of upstream, or rebase your `main` onto upstream before the next sync.

Prefer to sync by hand? GitHub's **"Sync fork"** button on your fork's homepage does the same thing on demand, and `gh repo sync <your-fork> --source hawkeye-sama/osforms --branch main` does it from the CLI.

---

## Troubleshooting

| Symptom                                            | Fix                                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ENCRYPTION_KEY must be a 64-character hex string` | Regenerate with the `crypto.randomBytes(32)` command; it must be exactly 64 chars.                                                  |
| App can't reach MongoDB locally                    | `docker compose up -d mongodb` running? Is `MONGODB_URI` `mongodb://localhost:27017/osforms`?                                       |
| Verification email never arrives                   | Expected when self-hosting. Read the code from MongoDB: [Verify your account without email](#verify-your-account-without-email).    |
| Signup returns "Internal server error"             | No `RESEND_API_KEY`, so the email send throws. The account was saved; [verify it from MongoDB](#verify-your-account-without-email). |
| Submissions return 403 "limit reached"             | Every account defaults to 100/month. [Raise the submission limit](#raise-the-submission-limit).                                     |
| Every signup fails with "Spam check did not run"   | `RECAPTCHA_SECRET_KEY` is set but the build has no `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`. Set it and rebuild.                            |
| Signup says "could not confirm you are human"      | reCAPTCHA score below `RECAPTCHA_MIN_SCORE`. Check the domain is on the key, or lower the threshold.                                |
| Google OAuth `redirect_uri_mismatch`               | The Authorized redirect URI must equal `<NEXT_PUBLIC_APP_URL>/api/auth/google/callback` exactly.                                    |
| `@osforms/react` not found when running the app    | Run `pnpm build --filter @osforms/react` once, then `pnpm dev`.                                                                     |

Still stuck? [Open an issue](https://github.com/hawkeye-sama/osforms/issues).
