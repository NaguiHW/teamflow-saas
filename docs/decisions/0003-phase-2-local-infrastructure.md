# ADR 0003: Phase 2 Local Infrastructure

- Status: Accepted
- Date: 2026-08-09
- Phase: 2

## Decisions

- Use Docker Compose for local PostgreSQL and Redis dependencies.
- Use Drizzle ORM with the `postgres` driver and committed SQL migrations.
- Keep the Phase 2 schema limited to `app_metadata`, which allows migration and seed verification without implementing Phase 3 authentication or tenant entities.
- Expose API liveness at `/health` and dependency readiness at `/health/dependencies`.
- Return HTTP 503 from dependency readiness when PostgreSQL or Redis is unavailable.

## Consequences

Any developer can start the local dependencies with the same commands and configuration. Database changes are reproducible and can be reset and reseeded through scripts. Authentication, authorization, and organization data remain intentionally deferred to Phase 3.
