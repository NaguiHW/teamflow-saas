# ADR 0001: Phase 0 Product and Architecture Decisions

- Status: Accepted
- Date: 2026-08-09
- Phase: 0

## Context

TeamFlow needs a concrete MVP boundary and security model before the monorepo and application code are created.

## Decisions

1. TeamFlow targets small and medium-sized teams coordinating operational work.
2. The first complete workflow is organization → project → task, with invitations and task collaboration around it.
3. The MVP includes authentication, organizations, memberships, projects, tasks, labels, comments, due dates, audit events, basic activity/health views, and common list controls.
4. The initial roles are `owner`, `admin`, `member`, and `viewer`.
5. Tenant ownership is represented by `organization_id`; the API is responsible for membership and resource authorization.
6. Plans are simulated as `free`, `pro`, and `business` with server-enforced usage limits. Stripe is deferred.
7. The API is REST-based, schema-validated with Zod, documented with OpenAPI, and uses a consistent error envelope.
8. Supabase Auth provides identity. The web tier uses secure HttpOnly session cookies and forwards validated access tokens server-to-server to the API.
9. The system remains a modular monolith. Redis, asynchronous email jobs, and observability are infrastructure capabilities added in later implementation phases as specified by the plan.

## Consequences

These decisions prioritize a reviewable, secure portfolio MVP. They leave room for configurable roles, billing, real-time features, and AWS deployment later without requiring those systems in the initial domain model.

## Deferred decisions

Exact workspace package names, scripts, dependency versions, and final monorepo layout remain Phase 1 decisions. They are intentionally not resolved or implemented during Phase 0.
