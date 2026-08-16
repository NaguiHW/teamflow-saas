# Phase 7 security and performance review

## Authentication and sessions

- Supabase Auth remains the identity provider.
- Access and refresh tokens are stored in `HttpOnly` cookies at the API boundary.
- Protected routes validate the access token before resolving organization membership.
- The web API client retries a single `401` response after calling `/auth/refresh`.
- Refresh failures are not retried recursively and result in the original authentication error.
- Cookies do not expose token values to browser JavaScript.

## Tenant isolation and authorization

- Organization membership is resolved from the authenticated user and the route organization ID.
- Project, task, label, comment, and audit queries include organization scope.
- Role checks are enforced in Fastify pre-handlers and mutation routes.
- The client does not provide the security boundary; hidden controls are only a UX optimization.

## Input validation and errors

- Route parameters, query strings, and request bodies are parsed with Zod schemas.
- API errors use the `{ error: { code, message, requestId } }` envelope.
- Unexpected errors are logged server-side without exposing stack traces to clients.
- Authentication and invitation endpoints use Redis-backed rate limits and fail closed if Redis is unavailable.

## Logging and observability

- Fastify emits structured logs with a request ID.
- The API returns the request ID in `x-request-id` and in error responses.
- `/health/metrics` exposes aggregate counters only; it must remain private at deployment time.
- Sentry captures unexpected server errors only when `SENTRY_DSN` is configured.
- Metrics are intentionally in-memory for the MVP and reset when the process restarts. Persistent telemetry is deferred to the observability platform.

## Query and index review

- Organization membership lookups use the unique `(organization_id, user_id)` constraint.
- Project and task list queries have organization, project, status, and comment-scope indexes.
- The dashboard loads projects, tasks, and members in parallel and maps member names in memory.
- No per-task member query is performed by the dashboard workspace loader.
- Production query plans should be captured with `EXPLAIN (ANALYZE, BUFFERS)` against representative seed data before public deployment.

## Remaining risks

- Metrics are process-local and need Sentry/OpenTelemetry or another persistent backend for multi-instance deployments.
- Full login, tenant-isolation, project, and task E2E coverage still requires a reproducible authenticated test environment.
- Supabase session lifetime and inactivity limits remain deployment settings and must be reviewed before Phase 8.
