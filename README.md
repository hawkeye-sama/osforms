# osforms

Open-source form backend with BYOK (Bring Your Own Keys) integrations. Point your HTML forms at osforms, and we store submissions + route them to your own Resend, Google Sheets, and webhooks.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/hawkeye-sama/osforms)](https://github.com/hawkeye-sama/osforms)
[![Live](https://img.shields.io/badge/live-osforms.com-black)](https://osforms.com)

## Why osforms?

Every form backend (Formspree, FormBold, Basin, Formcarry) paywalls integrations behind $5-15+/month — for basic features that you can get for free if you bring your own keys. osforms flips that: **100 free submissions/month with all integrations included**, because you bring your own keys or if you have more demand, you can self host it without any limits.

## Features

- **BYOK Integrations** — Resend email, Google Sheets, webhooks. All free, powered by your API keys.
- **Instant Setup** — Create a form, get an endpoint URL, point your HTML form at it.
- **API Keys Encrypted at Rest** — AES-256-GCM encryption. Keys decrypted only during execution.
- **Webhook HMAC Signatures** — SHA-256 signed payloads for request verification.
- **CORS Control** — Configure allowed origins per form.
- **Spam Protection** — Honeypot fields + reCAPTCHA/hCaptcha/Turnstile support (BYOK).
- **Rate Limiting** — Configurable per-form rate limits (default: 10 req/min).
- **Submission Analytics** — Dashboard with charts, export to CSV/JSON.
- **Open Source** — MIT licensed. Self-host or use the hosted version.

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (for local MongoDB) or a MongoDB connection string
- npm

### Setup

```bash
# Clone the repo
git clone https://github.com/hawkeye-sama/osforms.git
cd osforms

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

Edit `.env` with your values:

```bash
MONGODB_URI=mongodb://localhost:27017/osforms
JWT_SECRET=your-random-secret-string
ENCRYPTION_KEY=<64-char hex string>  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run

```bash
# Start MongoDB (Docker)
docker-compose up -d

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. Create a form in your dashboard and get an endpoint URL
2. Point your HTML form at it:

```html
<form action="https://osforms.com/api/v1/f/your-form-slug" method="POST">
  <input type="text" name="name" placeholder="Name" />
  <input type="email" name="email" placeholder="Email" />
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send</button>
</form>
```

1. Submissions are stored and routed to your configured integrations (email, Google Sheets, webhooks) — all in the background.

## Tech Stack

| Layer           | Technology                                   |
| --------------- | -------------------------------------------- |
| Framework       | Next.js 15 (App Router)                      |
| Database        | MongoDB + Mongoose                           |
| Auth            | Email/password + OTP verification + JWT      |
| Encryption      | AES-256-GCM (Node crypto)                    |
| Styling         | Tailwind CSS + shadcn/ui                     |
| Integrations    | Resend, Google Sheets (googleapis), Webhooks |
| Background Jobs | `@vercel/functions` waitUntil                |
| Charts          | Recharts                                     |

## Project Structure

```text
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, signup pages
│   ├── (dashboard)/        # Dashboard, onboarding, form detail
│   └── api/
│       ├── auth/           # Signup, login, verify-email, OAuth
│       └── v1/
│           ├── forms/      # CRUD + submissions
│           ├── f/[slug]/   # Public submission endpoint
│           └── integrations/
├── lib/
│   ├── models/             # Mongoose models (User, Form, Submission, etc.)
│   ├── integrations/       # Email, Google Sheets, Webhook handlers
│   ├── auth.ts             # JWT + bcrypt helpers
│   ├── encryption.ts       # AES-256-GCM encrypt/decrypt
│   └── validations.ts      # Zod schemas
└── components/
    ├── ui/                 # shadcn/ui primitives
    ├── dashboard/          # Dashboard components
    └── integrations/       # Integration config forms
```

## Environment Variables

| Variable                      | Description                         | Required |
| ----------------------------- | ----------------------------------- | -------- |
| `MONGODB_URI`                 | MongoDB connection string           | Yes      |
| `JWT_SECRET`                  | Secret for signing JWT tokens       | Yes      |
| `ENCRYPTION_KEY`              | 64-char hex string for AES-256-GCM  | Yes      |
| `NEXT_PUBLIC_APP_URL`         | Public app URL                      | Yes      |
| `GOOGLE_CLIENT_ID`            | Google OAuth client ID (for Sheets) | Optional |
| `GOOGLE_CLIENT_SECRET`        | Google OAuth client secret          | Optional |
| `RESEND_API_KEY`              | Resend API key (for system emails)  | Optional |
| `RESEND_EMAIL_SIGNING_SECRET` | Resend webhook signing secret       | Optional |

See [.env.example](.env.example) for a template.

## Development

```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run lint           # Run ESLint
npm run format         # Format with Prettier
npm run format:check   # Check formatting
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on setting up your development environment, code style, and submitting pull requests.

## License

MIT — see [LICENSE](LICENSE) for details.

## Links

- [Live Site](https://osforms.com)
- [GitHub](https://github.com/hawkeye-sama/osforms)
- [Report an Issue](https://github.com/hawkeye-sama/osforms/issues)
