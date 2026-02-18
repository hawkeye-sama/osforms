# Contributing to osforms

Thanks for your interest in contributing to osforms! This guide will help you get set up and submit your first pull request.

## Prerequisites

- **Node.js** 18+
- **Docker** (for local MongoDB) or a running MongoDB instance
- **npm**
- **Git**

## Local Development Setup

1. **Fork and clone** the repository:

```bash
git clone https://github.com/<your-username>/osforms.git
cd osforms
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

```bash
cp .env.example .env
```

Edit `.env` with your local values. At minimum you need:

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — any random string
- `ENCRYPTION_KEY` — 64 hex characters (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000`

4. **Start MongoDB**:

```bash
docker-compose up -d
```

5. **Run the dev server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to verify everything works.

## Code Style

We use ESLint and Prettier to maintain consistent code. Run these before submitting a PR:

```bash
npm run lint           # Check for lint errors
npm run format:check   # Check formatting
npm run format         # Auto-fix formatting
```

### Conventions

- API route handlers: validate input (Zod) → check auth → execute → return JSON
- Use `getCurrentUser(req)` for auth checks
- Encrypt integration configs before DB writes, decrypt only at execution
- Use `runInBackground()` from `src/lib/background.ts` for async tasks
- UI components follow shadcn/ui patterns with Tailwind utility classes

## Submitting a Pull Request

1. **Create a branch** from `main`:

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** and ensure lint/format pass.

3. **Test your changes** — run `npm run build` to verify the production build succeeds.

4. **Push your branch** and open a PR against `main`.

5. **Describe your changes** — include what you changed and why. Link to any related issues.

### Branch Naming

- `feature/description` — new features
- `fix/description` — bug fixes
- `docs/description` — documentation changes

## Reporting Issues

Open an issue at [github.com/hawkeye-sama/osforms/issues](https://github.com/hawkeye-sama/osforms/issues) with:

- A clear title and description
- Steps to reproduce (if it's a bug)
- Expected vs actual behavior
- Screenshots if applicable

## Adding a New Integration

See the "Adding a New Integration" section in [CLAUDE.md](CLAUDE.md) for a step-by-step guide on implementing new integration types.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
