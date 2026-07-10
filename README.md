# OSForms

Open-source form backend with BYOK (Bring Your Own Keys) integrations. Point your HTML forms at OSForms, and it stores submissions + routes them to your own Resend, Google Sheets, and webhooks.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/hawkeye-sama/osforms)](https://github.com/hawkeye-sama/osforms)
[![npm](https://img.shields.io/npm/v/@osforms/react?label=%40osforms%2Freact)](https://www.npmjs.com/package/@osforms/react)
[![Live](https://img.shields.io/badge/live-osforms.com-black)](https://osforms.com)

## Why OSForms?

Every form backend (Formspree, FormBold, Basin, Formcarry) paywalls integrations behind $5–15+/month — for basic features you can get for free if you bring your own keys. OSForms flips that: **100 free submissions/month with all integrations included**, because you bring your own keys. Need more? Self-host it with no limits.

## Features

- **BYOK integrations** — Resend email, Google Sheets, webhooks. All free, powered by your API keys.
- **Instant setup** — Create a form, get an endpoint URL, point your HTML form at it.
- **API keys encrypted at rest** — AES-256-GCM. Keys decrypted only during execution.
- **Webhook HMAC signatures** — SHA-256 signed payloads for request verification.
- **CORS control** — Configure allowed origins per form.
- **Spam protection** — Honeypot fields + reCAPTCHA/hCaptcha/Turnstile support (BYOK).
- **Rate limiting** — Configurable per-form rate limits (default: 10 req/min).
- **Submission analytics** — Dashboard with charts, export to CSV/JSON.
- **React SDK** — [`@osforms/react`](https://www.npmjs.com/package/@osforms/react) for classic and conversational (Typeform-style) forms.
- **Open source** — MIT licensed. Self-host or use the hosted version.

## Repository layout

OSForms is a [pnpm](https://pnpm.io) + [Turborepo](https://turbo.build) monorepo:

```text
.
├── apps/
│   ├── web/        # The Next.js 15 app — dashboard, API, public submission endpoint
│   └── docs/       # Mintlify documentation site (osforms.com/docs)
├── packages/
│   ├── react/      # @osforms/react — the published React SDK
│   └── types/      # @osforms/types — shared TypeScript types
├── docker-compose.yml   # Local MongoDB
└── turbo.json
```

The app source lives in [apps/web/src](apps/web/src). The environment file lives at [apps/web/.env.example](apps/web/.env.example).

## Quick Start

### Prerequisites

- **Node.js 20+**
- **pnpm 10+** — `corepack enable` (ships with Node) or `npm i -g pnpm`
- **Docker** (for local MongoDB) or a MongoDB connection string

### Setup

```bash
# 1. Clone (or your fork)
git clone https://github.com/hawkeye-sama/osforms.git
cd osforms

# 2. Install all workspace dependencies
pnpm install

# 3. Create your env file (note the path — it's inside apps/web)
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env`. At minimum you need:

```bash
MONGODB_URI=mongodb://localhost:27017/osforms
JWT_SECRET=any-long-random-string
ENCRYPTION_KEY=<64-char hex string>   # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Google and Resend keys are optional — see [Environment Variables](#environment-variables).

### Run

```bash
# Start MongoDB
docker compose up -d

# Build the workspace packages once (the web app imports @osforms/react)
pnpm build --filter @osforms/react

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and complete onboarding.

> `pnpm dev` runs Turborepo, which starts the Next.js app and rebuilds `@osforms/react` in watch mode. Building the package once first avoids a first-run race where the app boots before the SDK is built.

## How It Works

**1. Create a form** in your dashboard and copy its endpoint URL.

**2. Point your HTML form at it:**

```html
<form action="https://osforms.com/api/v1/f/your-form-slug" method="POST">
  <input type="text" name="name" placeholder="Name" />
  <input type="email" name="email" placeholder="Email" />
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send</button>
</form>
```

**3. The submission is stored**, then your configured integrations (email, Google Sheets, webhooks) run in the background.

The endpoint returns `{ "success": true }` for JSON/API calls, or redirects to your form's redirect URL when one is set (for classic HTML forms).

## Tech Stack

| Layer           | Technology                                   |
| --------------- | -------------------------------------------- |
| Framework       | Next.js 15 (App Router)                      |
| Monorepo        | pnpm workspaces + Turborepo                  |
| Database        | MongoDB + Mongoose                           |
| Auth            | Email/password + OTP verification + JWT      |
| Encryption      | AES-256-GCM (Node crypto)                    |
| Styling         | Tailwind CSS + shadcn/ui                     |
| Integrations    | Resend, Google Sheets (googleapis), Webhooks |
| Background jobs | `@vercel/functions` waitUntil                |
| Charts          | Recharts                                     |
| SDK             | `@osforms/react` (built with tsup)           |

## Environment Variables

All variables live in `apps/web/.env` (copy from [apps/web/.env.example](apps/web/.env.example)).

| Variable                      | Description                                         | Required |
| ----------------------------- | --------------------------------------------------- | -------- |
| `MONGODB_URI`                 | MongoDB connection string                           | Yes      |
| `JWT_SECRET`                  | Secret for signing JWT auth tokens                  | Yes      |
| `ENCRYPTION_KEY`              | 64-char hex string (32 bytes) for AES-256-GCM       | Yes      |
| `NEXT_PUBLIC_APP_URL`         | Public app URL for CORS, redirects, OAuth callback  | Yes      |
| `GOOGLE_CLIENT_ID`            | Google OAuth client ID (Google Sheets only)         | No       |
| `GOOGLE_CLIENT_SECRET`        | Google OAuth client secret                          | No       |
| `RESEND_API_KEY`              | Resend API key (system emails + Resend integration) | No       |
| `RESEND_EMAIL_SIGNING_SECRET` | Signing secret for inbound Resend email webhook     | No       |

> Without `RESEND_API_KEY`, account verification emails won't send. For local dev you can read the OTP from the server logs, or set a Resend key.

## Deploy / Self-Host

The fastest way to run the whole stack yourself is Docker:

```bash
git clone https://github.com/hawkeye-sama/osforms.git
cd osforms
cp .env.docker.example .env          # then generate the two secrets it lists
docker compose up
```

That builds the app, starts MongoDB, and serves OSForms at [http://localhost:3000](http://localhost:3000). Config lives in `.env` (secrets stay out of tracked files); `MONGODB_URI` defaults to the bundled mongo service. Full walkthrough — generating secrets, your domain, integrations, and deploying to Vercel + MongoDB Atlas (what osforms.com runs on) — is in **[SELF_HOSTING.md](SELF_HOSTING.md)**.

OSForms runs anywhere Next.js runs. On a long-running server (Docker, a VPS) background integrations run in-process with no time cap. On Vercel they use `waitUntil`, capped at ~10s on Hobby and up to 60s on Pro.

## Forking & staying in sync

Forks ship with a scheduled GitHub Action ([.github/workflows/sync-fork.yml](.github/workflows/sync-fork.yml)) that keeps your fork's `main` up to date with upstream automatically. It only runs on forks — never on the upstream repo. Enable Actions on your fork once and it runs daily. See [SELF_HOSTING.md → Keep your fork in sync](SELF_HOSTING.md#keep-your-fork-in-sync).

## Development

Scripts run from the repo root via Turborepo (they fan out to every workspace package):

```bash
pnpm dev            # Start the app + SDK watch build
pnpm build          # Production build of all packages
pnpm lint           # Lint + typecheck all packages
pnpm format         # Format with Prettier
pnpm format:check   # Check formatting
```

Target a single package with `--filter`, e.g. `pnpm build --filter @osforms/web`.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for environment setup, code style, and how to open a pull request.

## License

MIT — see [LICENSE](LICENSE).

## Links

- [Live site](https://osforms.com)
- [Documentation](https://osforms.com/docs)
- [npm: @osforms/react](https://www.npmjs.com/package/@osforms/react)
- [Report an issue](https://github.com/hawkeye-sama/osforms/issues)

JSON export: [docs/json-export.md](docs/json-export.md).
