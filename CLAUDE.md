# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: osforms

**osforms** is an open-source, BYOK (Bring Your Own Keys) form backend SaaS — "Resend for Forms." Users point their HTML forms at a osforms endpoint, and we store submissions + forward them to the user's own integrations (Resend email, Google Sheets, webhooks). Free because users bring their own API keys — we never charge for integrations.

### Target Users

- Developers who need quick form backends without vendor lock-in
- LLMs building web applications that need form handling
- Teams wanting privacy-first form handling (data goes to user's own services)

### Why This Exists

Every competitor (Formspree, FormBold, Basin, Formcarry) paywalls integrations behind $5-15+/month even though the user's own API keys power them. osforms flips that — 100 free submissions/month with ALL integrations included. See `.claude/competitor-analysis.md` for full competitive breakdown.

## Tech Stack

- **Framework**: Next.js 15 (App Router) — frontend + API in one
- **Database**: MongoDB + Mongoose — flexible schema for varied form data
- **Auth**: Email/password with OTP verification + bcrypt + JWT in httpOnly cookies — no NextAuth
- **OAuth**: Google OAuth2 for Google Sheets integration (googleapis/oauth2)
- **Encryption**: AES-256-GCM (Node crypto) for storing user API keys at rest
- **Styling**: Tailwind CSS + shadcn/ui components
- **Background Jobs**: `@vercel/functions` waitUntil for async integration execution
- **Integrations**: Resend (email), Google Sheets (googleapis), custom webhooks (fetch)
- **Notifications**: In-app notifications + email alerts for integration failures
- **Charts**: Recharts for analytics dashboard
- **Animations**: Framer Motion for UI transitions
- **No Redis/BullMQ**: Integrations execute **asynchronously** via `waitUntil()` in background. User gets instant response.

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

### Submission Flow (Async with waitUntil)

```mermaid
HTML Form POST → /api/v1/f/{slug} → Validate → Check Rate Limit → Check Monthly Limit
                                        ↓
                                   Store in MongoDB
                                        ↓
                                  Return 200 OK (instant response)
                                        ↓
                          waitUntil: Execute Integrations (async, parallel)
                                        ↓
                          Promise.allSettled([Email, Sheets, Webhook])
                                        ↓
                          Log results → Create notifications if failures
```

**Key Details**:
- User receives instant 200 response after submission is stored
- Integrations run in **background** via `@vercel/functions.waitUntil()`
- All integrations execute in **parallel** using `Promise.allSettled()`
- Each integration has independent timeout (30s for webhooks, varies by type)
- Failures logged in `IntegrationLog` + in-app notification + email alert
- **Vercel Limits**: `waitUntil` has 10s limit on Hobby plan, 60s on Pro

### User Flow

```mermaid
Signup → Email Verification (OTP) → Onboarding (3 steps) → Dashboard → Create Forms → Configure Integrations → Collect Submissions
```

**Auth Flow Details**:
1. User signs up with email/password
2. System generates 6-digit OTP (30 min expiry)
3. Verification email sent via Resend
4. User enters OTP code
5. Email verified → JWT issued in httpOnly cookie (`ff_token`, 7-day expiry)
6. Welcome email sent (non-blocking)

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

**User** — Account with hashed password, monthly submission limits, verification status
- `monthlySubmissionCount` / `monthlySubmissionLimit` (default: 100)
- `currentBillingMonth` (format: "2026-01", UTC-based)
- `isVerified` / `verifiedAt` / `onboardingComplete`

**Form** — Container with unique slug for endpoint URL, settings (CORS, honeypot, captcha)
- Slug generated via `nanoid(12)`
- Supports Google reCAPTCHA, hCaptcha, Cloudflare Turnstile
- `rateLimit` (default: 10 req/min, configurable per form)

**Submission** — Form data as flexible JSON + metadata (IP, user agent, origin)
- Files stored as `[File: filename, size bytes]`
- CAPTCHA tokens stripped from stored data

**Integration** — Type (EMAIL/WEBHOOK/GOOGLE_SHEETS) + encrypted config (API keys, creds)
- Config encrypted at rest with AES-256-GCM
- Decrypted only during execution

**IntegrationLog** — Execution result per integration per submission
- Tracks status (success/failed) + error messages
- One log entry per integration per submission

**Notification** (NEW) — In-app notifications for users
- Created when integrations fail
- Tracks `read` status + `createdAt` timestamp
- Index: `{ userId: 1, read: 1, createdAt: -1 }`

**EmailVerification** (NEW) — OTP-based email verification
- 6-digit code, 30-minute expiry
- One-time use, deleted after verification
- Index: `{ email: 1 }`, `{ expiresAt: 1 }`

## API Endpoints

### Public (no auth)

- `POST /api/v1/f/{slug}` — Submit form data (HTML form post or JSON API)
  - Returns 303 redirect (HTML forms) or `{ success: true }` (JSON)
  - Rate limited per IP + form (configurable, default 10 req/min)
  - Checks monthly submission limit (returns 403 if exceeded)

### Auth

- `POST /api/auth/signup` — Create account, send OTP verification email
- `POST /api/auth/verify-email` — Verify OTP code, returns JWT
- `POST /api/auth/resend-otp` — Resend verification email
- `POST /api/auth/login` — Verify credentials, returns JWT
- `POST /api/auth/logout` — Clear auth cookie
- `GET /api/auth/me` — Current user from JWT
- `GET /api/auth/google/login` — Initiate Google OAuth flow
- `GET /api/auth/google/callback` — Handle Google OAuth callback

### Protected (JWT required)

**Forms**:
- `GET /api/v1/forms` — List all user's forms
- `POST /api/v1/forms` — Create new form
- `GET /api/v1/forms/{id}` — Get form details
- `PATCH /api/v1/forms/{id}` — Update form settings
- `DELETE /api/v1/forms/{id}` — Delete form
- `GET /api/v1/forms/{id}/submissions` — List submissions (paginated)
- `GET /api/v1/forms/{id}/stats/submissions` — Form submission stats
- `GET /api/v1/forms/{id}/export` — Export submissions (CSV/JSON)

**Integrations**:
- `GET /api/v1/integrations` — List all user's integrations
- `POST /api/v1/integrations` — Create new integration
- `PATCH /api/v1/integrations/{id}` — Update integration config
- `DELETE /api/v1/integrations/{id}` — Delete integration
- `GET /api/v1/integrations/{id}/status` — Check integration health
- `POST /api/v1/integrations/{id}/test` — Send test webhook/email

**Submissions**:
- `GET /api/v1/submissions/{id}/logs` — Get integration logs for submission

**Notifications**:
- `GET /api/v1/notifications` — List user notifications
- `PATCH /api/v1/notifications/{id}` — Mark notification as read

**Stats**:
- `GET /api/v1/stats/submissions` — User-level submission statistics

## Security Rules

- **API keys encrypted at rest** with AES-256-GCM. Encryption key from `ENCRYPTION_KEY` env var. Never log decrypted keys.
- **JWT in httpOnly cookie** — not accessible to client JS. Also supports `Authorization: Bearer` header for API/SDK use.
- **User API key** prefixed `ff_live_` — used by npm SDK for programmatic submissions.
- **Rate limiting** on public submission endpoint (in-memory, per IP + form). Default 10 req/min.
- **CORS** configurable per form via `allowedOrigins`.
- **Honeypot + reCAPTCHA** — user brings their own reCAPTCHA keys.

## Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/osforms

# Auth
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=<64-char hex string>  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# OAuth (Google Sheets Integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_EMAIL_SIGNING_SECRET=your-signing-secret
```

**Important**:
- `ENCRYPTION_KEY` must be exactly 64 hex characters (32 bytes)
- JWT tokens expire after 7 days
- Email verification OTPs expire after 30 minutes

## Background Execution & Integration Details

### How Integrations Execute

All integrations run **asynchronously in the background** after a submission is stored:

```typescript
// src/lib/background.ts
import { waitUntil as VercelWaitUntil } from '@vercel/functions';

export function runInBackground(task: () => Promise<void>): void {
  const promise = task().catch((err) => {
    console.error('[Background] Task failed:', err);
  });
  VercelWaitUntil(promise);
}
```

**Execution Flow**:
1. User submits form → 200 OK returned immediately
2. `waitUntil()` schedules integration execution in background
3. All integrations run in parallel via `Promise.allSettled()`
4. Each integration logs success/failure to `IntegrationLog`
5. If any fail → create in-app notification + send email alert

**Vercel `waitUntil` Limits**:
- **Hobby Plan**: 10 seconds after response sent
- **Pro Plan**: Up to 60 seconds (region-dependent)
- Each integration has its own timeout (e.g., webhooks: 30s)

### Integration Failure Handling

When integrations fail, users are notified via **two channels**:

1. **In-app Notification** (always created):
   - Stored in `Notification` collection
   - Shown in dashboard bell icon
   - Includes error message and submission link

2. **Email Alert** (best-effort, non-blocking):
   - Sent via Resend
   - Lists all failed integrations
   - Links to dashboard for remediation

### Google Sheets Auto-Column Detection

The Google Sheets integration automatically detects and creates missing columns:

```typescript
// src/lib/integrations/google-sheets.ts
1. Fetch header row from sheet
2. Compare with submission data keys
3. Detect missing columns
4. Append missing columns to header row
5. Map submission data to correct column positions
6. Append row with data + "Submission ID" + "Submitted At" system columns
```

**System Columns** (automatically added):
- `Submission ID` — MongoDB ObjectId
- `Submitted At` — ISO 8601 timestamp

### Webhook HMAC Signing

Webhooks use HMAC-SHA256 for request verification:

```typescript
// Header: X-osforms-Signature-256: sha256=<hex>
const signature = crypto
  .createHmac('sha256', signingKey)
  .update(JSON.stringify(body))
  .digest('hex');
```

**Webhook Timeout**: 30 seconds (hardcoded)

### Monthly Submission Limits

Users have a monthly submission limit (default: 100):

```typescript
// Checked on every POST /api/v1/f/{slug}
if (user.monthlySubmissionCount >= user.monthlySubmissionLimit) {
  return Response 403: "Monthly submission limit reached"
}

// Lazy reset on first submission of new month
const currentMonth = new Date().toISOString().slice(0, 7); // "2026-02"
if (user.currentBillingMonth !== currentMonth) {
  user.monthlySubmissionCount = 0;
  user.currentBillingMonth = currentMonth;
}
```

## Coding Conventions

- All API route handlers follow the pattern: validate input (Zod) → check auth → execute → return JSON
- Auth check uses `getCurrentUser(req)` helper that reads JWT from cookie or Authorization header
- Integration configs are always encrypted before DB write, decrypted only at execution time
- The public submission endpoint (`/api/v1/f/[slug]`) handles 3 content types: `application/x-www-form-urlencoded`, `multipart/form-data`, `application/json`
- For HTML form submissions, redirect to `form.redirectUrl` on success. For JSON/API calls, return `{ success: true }`
- Mongoose models use TypeScript interfaces for type safety
- UI components use shadcn/ui patterns with Tailwind utility classes
- **Background jobs**: Always use `runInBackground()` from `src/lib/background.ts` for non-blocking tasks

## Adding a New Integration

1. **Create handler** in `src/lib/integrations/my-integration.ts` implementing `IntegrationHandler`
   ```typescript
   export class MyIntegrationHandler implements IntegrationHandler {
     async execute(ctx: IntegrationContext, config: unknown): Promise<void> {
       // Validate config, execute integration logic
       // Throw error on failure (will be caught and logged)
     }
   }
   ```

2. **Register handler** in `src/lib/integrations/index.ts`
   ```typescript
   import { MyIntegrationHandler } from './my-integration';

   const handlers: Record<IntegrationType, IntegrationHandler> = {
     EMAIL: new EmailHandler(),
     WEBHOOK: new WebhookHandler(),
     GOOGLE_SHEETS: new GoogleSheetsHandler(),
     MY_INTEGRATION: new MyIntegrationHandler(), // Add here
   };
   ```

3. **Add Zod validation schema** in `src/lib/validations.ts`
   ```typescript
   export const myIntegrationConfigSchema = z.object({
     apiKey: z.string().min(1),
     // ... other config fields
   });
   ```

4. **Add config UI component** in `src/components/integrations/my-integration-config.tsx`
   - Include form fields for config
   - Add "Send Test" button that calls `POST /api/v1/integrations/{id}/test`

5. **Update Integration model** in `src/lib/models/integration.ts`
   - Add type to `IntegrationType` union

6. **Add test endpoint support** in `src/app/api/v1/integrations/[id]/test/route.ts`
   - Handle test requests for your integration type
   - Send sample data to verify configuration works

**Test Integration Pattern**:
```typescript
// Send sample submission data for testing
const testData = {
  submissionId: "test_sub_123",
  formId: "test",
  formName: "Test Form",
  timestamp: new Date().toISOString(),
  data: {
    name: "Test User",
    email: "test@example.com",
    message: "This is a test from osforms"
  }
};
```
