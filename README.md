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

Phase 1 establishes the monorepo and tooling foundation. Database, authentication, Docker Compose, and migrations belong to later phases.
