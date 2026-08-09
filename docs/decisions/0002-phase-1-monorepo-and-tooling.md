# ADR 0002: Phase 1 Monorepo and Tooling

- Status: Accepted
- Date: 2026-08-09
- Phase: 1

## Decisions

- Use a pnpm workspace with `apps/*` and `packages/*` globs.
- Use `@teamflow/web`, `@teamflow/api`, `@teamflow/types`, and `@teamflow/ui` as package names.
- Keep the web app on Next.js App Router with Server Components by default.
- Keep the API as a separate Fastify TypeScript service.
- Share contracts through `@teamflow/types` and responsibility-based components through `@teamflow/ui`.
- Use Sass and CSS Modules for declarative web and UI styles.
- Use a strict shared TypeScript baseline, ESLint flat config, and Prettier at the workspace root.
- Keep runtime secrets out of source control; provide placeholders through `.env.example` files.

## Consequences

The workspace can develop and typecheck the web app, API, and shared packages independently while preserving a clear boundary between presentation, contracts, and backend behavior. Database, authentication, and infrastructure configuration remain deferred to their planned phases.
