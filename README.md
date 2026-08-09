# TeamFlow SaaS

TeamFlow is a multi-tenant workspace for coordinating organizations, projects, tasks, and operational activity.

## Workspace structure

```text
apps/web       Next.js App Router application
apps/api       Fastify REST API
packages/types Shared TypeScript contracts
packages/ui    Shared React components and Sass modules
docs           Product, domain, API, and architecture decisions
```

## Requirements

- Node.js 24+
- pnpm 11

## Development

```bash
pnpm install
pnpm dev:web
pnpm dev:api
```

The web application runs at `http://localhost:3000`. The API health endpoint is available at `http://localhost:4000/health`.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

Copy `.env.example` files when local environment values are needed. Secrets must remain in environment variables and must never be committed.

## Local infrastructure

Phase 2 provides PostgreSQL and Redis through Docker Compose. Copy the root environment file for Compose and the API environment file for migration and seed commands:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
docker compose up -d
pnpm --filter @teamflow/api db:migrate
pnpm --filter @teamflow/api db:seed
```

The API liveness endpoint is `http://localhost:4000/health`; dependency readiness is reported by `http://localhost:4000/health/dependencies` and returns HTTP 503 when PostgreSQL or Redis is unavailable.

Useful commands:

```bash
pnpm --filter @teamflow/api db:generate
pnpm --filter @teamflow/api db:reset
docker compose ps
docker compose down
```

The local defaults are PostgreSQL `localhost:5432` and Redis `localhost:6379`. Override `DATABASE_URL`, `REDIS_URL`, and the `POSTGRES_*` or `REDIS_PORT` variables in `.env` when ports or credentials differ. Never commit real credentials.

Phase 2 establishes local infrastructure and migration tooling. Authentication and tenant entities remain deferred to Phase 3.
