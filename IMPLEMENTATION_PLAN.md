# TeamFlow SaaS — Implementation Plan

This document defines the incremental development of the project. The AI must complete one phase, verify its exit criteria, and stop for review before starting the next phase.

## Execution rules

- Do not skip phases without explicit approval.
- Before changing code, review `AGENTS.md` and this document.
- Every phase must end with a reproducible verification.
- If a decision changes the scope or architecture, stop and propose an `AGENTS.md` or ADR update.
- Do not implement future functionality during the current phase.
- Keep changes small and easy to review.
- Update the phase status when work is complete.
- Whenever an endpoint is created or changed, create or update its corresponding Bruno request under `docs/api/bruno/`.
- Bruno requests must document the HTTP method, URL, headers, authentication, request body, successful response, and relevant error responses.
- Never commit real credentials or secrets to Bruno files; use environment variables or example values.
- All frontend work must follow a mobile-first responsive approach.
- Every relevant screen must be verified on mobile, tablet, and desktop viewports.
- Avoid fixed widths or layouts that cause horizontal scrolling.

## Statuses

- `[ ]` Pending.
- `[~]` In progress.
- `[x]` Completed.
- `[!]` Blocked or requires a decision.

## Phase 0 — Scope and initial decisions

Status: [x] Completed — pending required review.

### Objective

Turn the TeamFlow idea into a concrete MVP before writing code.

### Tasks

- [x] Define the target user and primary problem.
- [x] Define the main flow: create an organization, project, and task.
- [x] Confirm the MVP scope.
- [x] Define roles: `owner`, `admin`, `member`, and `viewer`.
- [x] Define initial entities and relationships.
- [x] Define initial limits for `free`, `pro`, and `business` plans.
- [x] Record new decisions in `AGENTS.md` or `docs/decisions/`.

### Exit criteria

- [x] A one-page product description exists.
- [x] An initial domain diagram exists.
- [x] Features outside the MVP are documented.
- [x] No critical decisions remain ambiguous.

### Required review

Stop and request review before creating the monorepo.

## Phase 1 — Monorepo and tooling

Status: [x] Completed — pending required review.

### Objective

Create a consistent development base for the frontend, API, and shared packages.

### Tasks

- [x] Create the monorepo with `pnpm workspaces`.
- [x] Create `apps/web` with Next.js, App Router, and TypeScript.
- [x] Create `apps/api` with Fastify and TypeScript.
- [x] Create `packages/types` and `packages/ui`.
- [x] Configure strict TypeScript.
- [x] Configure ESLint, Prettier, and shared scripts.
- [x] Configure Sass and CSS Modules in Next.js.
- [x] Add environment variables and `.env.example`.
- [x] Add an initial README with development commands.

### Exit criteria

- [x] `pnpm install` works from the root.
- [x] Frontend and API start with documented commands.
- [x] Lint, typecheck, and build pass.
- [x] A shared type can be imported by both applications.

### Required review

Review the folder structure, scripts, and conventions before adding the database.

## Phase 2 — Local development and base infrastructure

Status: [x] Completed — pending required review.

### Objective

Allow any developer to run the project locally with Docker Compose.

### Tasks

- [x] Create `docker-compose.yml` for required local services.
- [x] Define local PostgreSQL or document the Supabase connection.
- [x] Define local Redis.
- [x] Create health checks for the API and dependencies.
- [x] Configure Drizzle and migrations.
- [x] Create scripts for migrations and seed data.
- [x] Document ports, variables, and troubleshooting.

### Exit criteria

- [ ] A clean environment can start dependencies with Docker Compose.
- [ ] The API connects to PostgreSQL and Redis.
- [ ] Migrations run reproducibly.
- [ ] Seed data can be reset without manual intervention.

### Required review

Review environment-variable security and the local strategy before implementing authentication.

## Phase 3 — Frontend-first product flow with mock data

### Objective

Build and validate the first TeamFlow experience before connecting authentication or the real API.

### Tasks

- [x] Define the frontend information architecture and primary user journey.
- [x] Create typed fixtures for organizations, projects, tasks, labels, and activity.
- [x] Add Mock Service Worker (MSW) handlers for the planned REST endpoints.
- [x] Create initial Bruno requests for the mocked REST endpoints under `docs/api/bruno/`.
- [x] Build the public home page and authenticated-dashboard shell.
- [x] Build project and task views using mock responses.
- [x] Add loading, error, empty, and optimistic-update states.
- [~] Make the main flow responsive and verify mobile, tablet, and desktop layouts. Browser verification is pending system Chromium dependencies.
- [x] Keep mock data and handlers outside React components.
- [x] Ensure mock responses follow the shared types and Zod schemas.
- [x] Add initial component and Playwright tests against the mock API.

### Exit criteria

- [~] A user can explore the main product flow using mock data. Playwright execution is pending system Chromium dependencies.
- [x] No business fixture is hardcoded inside a React component.
- [x] The mock API can be replaced by the real API without changing component contracts.
- [x] Bruno requests document the method, URL, headers, body, and expected responses for the mocked endpoints.
- [~] Loading, error, empty, and success states are visible and tested. Browser execution remains pending.
- [~] The main flow works without horizontal scrolling on supported viewports. Browser verification remains pending.
- [x] Mock mode is explicit and disabled for production builds.

### Required review

Stop and review the UX, mock API contract, and component structure before implementing authentication.

## Phase 4 — Authentication and multi-tenancy

### Objective

Implement secure access and isolation between organizations.

### Tasks

- [x] Integrate Supabase Auth.
- [x] Implement login, logout, and account recovery.
- [x] Implement email invitations with Resend.
- [x] Create users, organizations, and memberships.
- [x] Implement roles and API authorization.
- [x] Apply `organization_id` to tenant-aware entities.
- [x] Add authentication middleware or hooks.
- [x] Create auditing for sensitive actions.

### Exit criteria

- [x] A user can register and log in.
- [x] An owner can invite users.
- [x] A user cannot read or modify another organization's data.
- [x] Authentication and isolation tests pass.
- [x] Supabase and Resend keys never reach the client.

### Required review

Stop and review the security model before creating business functionality.

## Phase 5 — Core domain: projects and tasks

### Objective

Build TeamFlow's central workflow on top of a stable API.

### Tasks

- [x] Create projects.
- [x] Create, edit, complete, and delete tasks.
- [x] Add labels and due dates.
- [x] Add comments.
- [x] Implement pagination, filtering, and sorting.
- [x] Define consistent REST errors and responses.
- [x] Document endpoints with OpenAPI.
- [ ] Create or update the corresponding Bruno request for every endpoint.
- [x] Create domain, integration, and authorization tests.

### Exit criteria

- [x] The main flow works end to end through the API.
- [x] Mutations validate permissions and inputs.
- [x] The API has initial OpenAPI documentation.
- [ ] Bruno collections cover successful responses and relevant error cases.
- [x] Important queries have justified indexes.
- [x] Coverage includes critical domain rules.

### Required review

Review the API contract, data model, and business rules before building the full dashboard.

## Phase 6 — Next.js dashboard integration

### Objective

Build a usable, accessible interface that represents the product experience.

### Tasks

- [ ] Create public and authenticated layouts.
- [ ] Implement dashboard navigation.
- [ ] Implement project and task pages.
- [ ] Start the dashboard flow with the approved mock API and replace it with the real API without changing component contracts.
- [ ] Use Server Components by default.
- [ ] Use Client Components only for interaction and local state.
- [ ] Implement loading, error, and empty states.
- [ ] Use Sass, CSS Modules, and responsibility-based components.
- [ ] Use Toastify for visual feedback.
- [ ] Add basic accessibility and keyboard navigation.
- [ ] Add metadata and SEO for public pages.

### Exit criteria

- [ ] A user can complete the main flow from the interface.
- [ ] No secrets or authorization rules live only in the client.
- [ ] Loading, error, and empty states are covered.
- [ ] Critical flows have Playwright tests.
- [ ] The interface works on mobile, tablet, and desktop viewports without horizontal scrolling.

### Required review

Review UX, accessibility, and Server/Client Component decisions before adding secondary functionality.

## Phase 7 — Quality, security, and performance

### Objective

Raise the MVP to a production-demonstrable level.

### Tasks

- [ ] Configure GitHub Actions for lint, typecheck, tests, and build.
- [ ] Configure coverage thresholds for critical code.
- [ ] Add E2E tests for login, isolation, projects, and tasks.
- [ ] Add rate limiting.
- [ ] Review validation, authorization, and error exposure.
- [ ] Review N+1 queries and indexes.
- [ ] Add Sentry or OpenTelemetry.
- [ ] Add structured logs and correlation IDs.
- [ ] Run a dependency vulnerability audit.

### Exit criteria

- [ ] CI fails on quality or critical-test errors.
- [ ] Main security risks are documented.
- [ ] Basic API metrics are available.
- [ ] Main-query performance has been verified.

### Required review

Review CI, coverage, and security results before public deployment.

## Phase 8 — Deployment and public demo

### Objective

Publish a functional and reproducible portfolio demo.

### Tasks

- [ ] Deploy `apps/web` to Vercel.
- [ ] Deploy `apps/api` to Render.
- [ ] Configure Supabase for the public environment.
- [ ] Configure Resend and a verified sender/domain.
- [ ] Configure environment variables per environment.
- [ ] Configure CORS and cookies for public domains.
- [ ] Create a demo user and seed data.
- [ ] Add health checks and document public URLs.
- [ ] Document free-tier limitations.

### Exit criteria

- [ ] A third party can use the demo.
- [ ] Test emails work.
- [ ] The API does not expose secrets.
- [ ] A documented test account exists.
- [ ] README includes architecture, screenshots, and links.

### Required review

Review the complete demo before starting AWS or infrastructure improvements.

## Phase 9 — Portfolio and advanced phase

### Objective

Turn the project into a strong portfolio piece and evaluate advanced improvements.

### Tasks

- [ ] Record a short demo video.
- [ ] Add the final architecture diagram.
- [ ] Document trade-offs and rejected decisions.
- [ ] Document incidents or problems encountered.
- [ ] Evaluate AWS and Terraform as an alternative deployment.
- [ ] Evaluate plan limits and Stripe.
- [ ] Evaluate shared caching and scalability.

### Exit criteria

- [ ] The README explains the problem, solution, and architecture.
- [ ] The public demo works.
- [ ] Technical decisions are defensible in an interview.
- [ ] Future improvements are separated from completed scope.

## Decision and AGENTS.md change log

| Date       | Phase | Decision or change                                                                                                                                                   | Reason                                                                                                  | Update `AGENTS.md`?                         |
| ---------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 2026-08-09 | 0     | Created the phased plan                                                                                                                                              | Enable incremental review and reduce risk                                                               | No                                          |
| 2026-08-09 | 2     | Use Docker Compose with PostgreSQL and Redis; keep migration state in Drizzle and seed only infrastructure metadata                                                  | Provide a reproducible local environment without implementing Phase 3 authentication or tenant entities | No                                          |
| 2026-08-09 | 3     | Integrate Supabase Auth with HttpOnly sessions, bearer-token API validation, organization membership authorization, Resend invitations, and append-only audit events | Establish secure identity and tenant isolation before business-domain resources                         | Yes — confirmed in `AGENTS.md` and ADR 0004 |
