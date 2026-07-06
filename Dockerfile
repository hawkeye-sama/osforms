# syntax=docker/dockerfile:1
#
# Production image for the OSForms web app (apps/web) in the pnpm + Turborepo
# monorepo. Builds @osforms/react + @osforms/types first (via Turbo's ^build),
# then the Next.js app with `output: "standalone"`, and runs the traced server
# on a minimal runtime. See SELF_HOSTING.md for the full self-host guide.

# ---------- Base ----------
FROM node:20-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# ---------- Builder ----------
FROM base AS builder
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time. This is
# the URL the browser uses; server-side reads of the same var happen at runtime.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
# Raise V8's heap ceiling above its ~2GB default so `next build` (Turbopack +
# React Compiler over a large app) doesn't OOM. 4GB clears the build while
# leaving VM headroom for Turbopack's native allocations. Needs a >=6GB Docker VM.
ENV NODE_OPTIONS=--max-old-space-size=4096

# Copy the whole workspace. pnpm keeps per-package node_modules symlinks into a
# single virtual store, so install + build happen in one stage (no cross-stage
# node_modules copy, which is what breaks pnpm symlinks).
COPY . .
# Install only what the web app needs (web + its workspace deps: react, types).
# Skips the Mintlify docs app and the playground, cutting install size and the
# memory/IO load that otherwise strains the Docker builder.
RUN pnpm install --frozen-lockfile --filter=@osforms/web...
# Turbo builds @osforms/web and its internal deps (react, types) in order.
RUN pnpm exec turbo run build --filter=@osforms/web

# ---------- Runner ----------
FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone bundle. Tracing root is the monorepo root, so the layout inside
# the standalone folder mirrors the repo: apps/web/server.js + a shared
# node_modules at the root.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# sharp (for next/image optimization) ships as one of Next's optional
# dependencies and is traced into the standalone output automatically, so no
# separate install is needed here.

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
