# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: FreeForms

**FreeForms** is an open-source, BYOK (Bring Your Own Keys) form backend SaaS — "Resend for Forms." Users point their HTML forms at a FreeForms endpoint, and we store submissions + forward them to the user's own integrations (Resend email, Google Sheets, webhooks). Free because users bring their own API keys — we never charge for integrations.

### Target Users
- Developers who need quick form backends without vendor lock-in
- LLMs building web applications that need form handling
- Teams wanting privacy-first form handling (data goes to user's own services)

### Why This Exists
Every competitor (Formspree, FormBold, Basin, Formcarry) paywalls integrations behind $5-15+/month even though the user's own API keys power them. FreeForms flips that — 100 free submissions/month with ALL integrations included. See `.claude/competitor-analysis.md` for full competitive breakdown.

## Tech Stack

- **Framework**: Next.js 15 (App Router) — frontend + API in one
- **Database**: MongoDB + Mongoose — flexible schema for varied form data
- **Auth**: Email/password with bcrypt + JWT in httpOnly cookies — no NextAuth
- **Encryption**: AES-256-GCM (Node crypto) for storing user API keys at rest
- **Styling**: Tailwind CSS + shadcn/ui components
- **Integrations**: Resend (email), Google Sheets (googleapis), custom webhooks (fetch)
- **No Redis/BullMQ**: Integrations execute synchronously for MVP. Scale to queues later.

## Development Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

Local MongoDB via Docker:
```bash
docker-compose up -d   # Start MongoDB
```

## Architecture

### Submission Flow
```
HTML Form POST → /api/v1/f/{slug} → Validate → Store in MongoDB → Execute Integrations (sync)
                                                                    ├── Resend Email
                                                                    ├── Google Sheets
                                                                    └── Webhook
```

### User Flow
```
Signup → Onboarding (3 steps) → Dashboard → Create Forms → Configure Integrations → Collect Submissions
```

### Onboarding Steps
1. **Profile**: Full name, website, company/project, role (developer/agency/startup/other)
2. **Integrations**: Connect Resend API key, Google Sheets credentials (encrypted at rest)
3. **Test**: Install SDK, paste sample code, submit test form, validate integration works

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Tailwind + CSS variables
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (dashboard)/              # Authed pages (onboarding, dashboard, form detail)
│   └── api/
│       ├── auth/                 # signup, login, me
│       └── v1/
│           ├── forms/            # CRUD + submissions list
│           ├── f/[slug]/         # PUBLIC submission endpoint
│           └── integrations/     # CRUD
├── lib/
│   ├── db.ts                     # Mongoose connection (singleton)
│   ├── auth.ts                   # JWT sign/verify, bcrypt hash, auth middleware
│   ├── encryption.ts             # AES-256-GCM encrypt/decrypt for API keys
│   ├── rate-limit.ts             # In-memory rate limiter
│   ├── validations.ts            # Zod schemas for all inputs
│   ├── models/                   # Mongoose models
│   │   ├── user.ts
│   │   ├── form.ts
│   │   ├── submission.ts
│   │   ├── integration.ts
│   │   └── integration-log.ts
│   └── integrations/             # Integration handlers
│       ├── base.ts               # IntegrationHandler interface
│       ├── email.ts              # Resend email sender
│       ├── google-sheets.ts      # Google Sheets row appender
│       ├── webhook.ts            # HTTP webhook with HMAC signing
│       └── index.ts              # Handler registry
└── components/
    ├── ui/                       # shadcn/ui primitives (button, input, card, etc.)
    ├── dashboard/                # Dashboard-specific components
    ├── integrations/             # Integration config forms
    └── onboarding/               # Onboarding wizard
```

## Key Data Models (MongoDB/Mongoose)

**User** — Account with hashed password and API key (`ff_live_xxxx`)
**Form** — Container with unique slug for endpoint URL, settings (CORS, honeypot, captcha)
**Submission** — Form data as flexible JSON + metadata (IP, user agent, origin)
**Integration** — Type (EMAIL/WEBHOOK/GOOGLE_SHEETS) + encrypted config (API keys, creds)
**IntegrationLog** — Execution result per integration per submission

## API Endpoints

### Public (no auth)
- `POST /api/v1/f/{slug}` — Submit form data (HTML form post or JSON API)

### Auth
- `POST /api/auth/signup` — Create account, returns JWT
- `POST /api/auth/login` — Verify credentials, returns JWT
- `GET /api/auth/me` — Current user from JWT

### Protected (JWT required)
- `GET/POST /api/v1/forms` — List / create forms
- `GET/PATCH/DELETE /api/v1/forms/{id}` — Form detail / update / delete
- `GET /api/v1/forms/{id}/submissions` — Paginated submissions
- `GET/POST /api/v1/integrations` — List / create integrations
- `PATCH/DELETE /api/v1/integrations/{id}` — Update / delete integration

## Security Rules

- **API keys encrypted at rest** with AES-256-GCM. Encryption key from `ENCRYPTION_KEY` env var. Never log decrypted keys.
- **JWT in httpOnly cookie** — not accessible to client JS. Also supports `Authorization: Bearer` header for API/SDK use.
- **User API key** prefixed `ff_live_` — used by npm SDK for programmatic submissions.
- **Rate limiting** on public submission endpoint (in-memory, per IP + form). Default 10 req/min.
- **CORS** configurable per form via `allowedOrigins`.
- **Honeypot + reCAPTCHA** — user brings their own reCAPTCHA keys.

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/freeforms
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=<64-char hex string>  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Coding Conventions

- All API route handlers follow the pattern: validate input (Zod) → check auth → execute → return JSON
- Auth check uses `getCurrentUser(req)` helper that reads JWT from cookie or Authorization header
- Integration configs are always encrypted before DB write, decrypted only at execution time
- The public submission endpoint (`/api/v1/f/[slug]`) handles 3 content types: `application/x-www-form-urlencoded`, `multipart/form-data`, `application/json`
- For HTML form submissions, redirect to `form.redirectUrl` on success. For JSON/API calls, return `{ success: true }`
- Mongoose models use TypeScript interfaces for type safety
- UI components use shadcn/ui patterns with Tailwind utility classes

## Adding a New Integration

1. Create handler in `src/lib/integrations/my-integration.ts` implementing `IntegrationHandler`
2. Register it in `src/lib/integrations/index.ts`
3. Add Zod validation schema in `src/lib/validations.ts`
4. Add config UI component in `src/components/integrations/`
5. Add the type to the `IntegrationType` union in the Integration model
