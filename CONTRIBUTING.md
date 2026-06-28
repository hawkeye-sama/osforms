# Contributing to OSForms

Thanks for your interest in contributing! This guide gets you from a fresh fork to an open pull request.

## Prerequisites

- **Node.js** 20+
- **pnpm** 10+ — `corepack enable` (bundled with Node) or `npm i -g pnpm`
- **Docker** (for local MongoDB) or a running MongoDB instance
- **Git**

## Project layout

OSForms is a pnpm + Turborepo monorepo. The pieces you'll touch most:

| Path             | What it is                                                  |
| ---------------- | ----------------------------------------------------------- |
| `apps/web`       | The Next.js app: dashboard, API routes, submission endpoint |
| `apps/docs`      | Mintlify documentation site                                 |
| `packages/react` | `@osforms/react`, the published React SDK                   |
| `packages/types` | `@osforms/types`, shared TypeScript types                   |

## Local development setup

1. **Fork and clone:**

   ```bash
   git clone https://github.com/<your-username>/osforms.git
   cd osforms
   ```

2. **Install dependencies** (installs the whole workspace):

   ```bash
   pnpm install
   ```

3. **Set up environment variables** — the env file lives inside `apps/web`:

   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

   At minimum, set in `apps/web/.env`:
   - `MONGODB_URI` — MongoDB connection string
   - `JWT_SECRET` — any long random string
   - `ENCRYPTION_KEY` — 64 hex characters (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `NEXT_PUBLIC_APP_URL` — `http://localhost:3000`

   See [apps/web/.env.example](apps/web/.env.example) for the full list and the optional Google/Resend keys.

4. **Start MongoDB:**

   ```bash
   docker compose up -d
   ```

5. **Build the SDK once, then run the app:**

   ```bash
   pnpm build --filter @osforms/react
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to verify everything works.

## Code style

Lint, typecheck, and formatting run from the repo root via Turborepo:

```bash
pnpm lint           # ESLint + tsc across all packages
pnpm format:check   # Prettier check
pnpm format         # Prettier auto-fix
```

CI runs format, lint, typecheck, and a full build on every PR — run these locally first.

### Conventions

- **API route handlers:** validate input (Zod) → check auth → execute → return JSON.
- Use `getCurrentUser(req)` for auth checks (reads the JWT from cookie or `Authorization` header).
- Encrypt integration configs before DB writes; decrypt only at execution time.
- Use `runInBackground()` from `apps/web/src/lib/background.ts` for non-blocking async work.
- UI components follow shadcn/ui patterns with Tailwind utility classes.

## Adding a new integration

Integration handlers live in `apps/web/src/lib/integrations`. To add one:

1. Create a handler implementing the `IntegrationHandler` interface in `apps/web/src/lib/integrations/<name>.ts`.
2. Register it in `apps/web/src/lib/integrations/index.ts`.
3. Add a Zod config schema in `apps/web/src/lib/validations.ts`.
4. Add a config UI in `apps/web/src/components/integrations/`.
5. Add the type to the `IntegrationType` union in `apps/web/src/lib/models/integration.ts`.
6. Handle it in the test endpoint at `apps/web/src/app/api/v1/integrations/[id]/test/route.ts`.

## Submitting a pull request

1. **Create a branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and ensure `pnpm lint` and `pnpm format:check` pass.

3. **Verify the build:** `pnpm build`.

4. **Push your branch** and open a PR against `main`.

5. **Describe your changes** — what you changed and why. Link any related issues.

### Branch naming

- `feature/description` — new features
- `fix/description` — bug fixes
- `docs/description` — documentation changes

## Reporting issues

Open an issue at [github.com/hawkeye-sama/osforms/issues](https://github.com/hawkeye-sama/osforms/issues) with:

- A clear title and description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
