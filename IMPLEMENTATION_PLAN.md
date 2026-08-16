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
- Determine the active phase from the earliest incomplete exit criteria or review checkpoint. Existing implementation from a later phase does not advance the active phase and must not be extended until the earlier gate is cleared.
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

Status: [x] Completed.

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

Review completed before creating the monorepo.

## Phase 1 — Monorepo and tooling

Status: [x] Completed.

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

Review completed before adding the database.

## Phase 2 — Local development and base infrastructure

Status: [x] Completed.

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

- [x] A clean environment can start dependencies with Docker Compose.
- [x] The API connects to PostgreSQL and Redis.
- [x] Migrations run reproducibly.
- [x] Seed data can be reset without manual intervention.

### Required review

Review completed before implementing authentication.

## Phase 3 — Frontend-first product flow with mock data

Status: [x] Completed — responsive flow reviewed.

Historical note: this frontend-first phase was previously referred to as
“Phase 4A”. The authoritative name and order are Phase 3.

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
- [x] Make the main flow responsive and verify mobile, tablet, and desktop layouts.
- [x] Keep mock data and handlers outside React components.
- [x] Ensure mock responses follow the shared types and Zod schemas.
- [x] Add initial component and Playwright tests against the mock API.

### Exit criteria

- [x] A user can explore the main product flow using mock data.
- [x] No business fixture is hardcoded inside a React component.
- [x] The mock API can be replaced by the real API without changing component contracts.
- [x] Bruno requests document the method, URL, headers, body, and expected responses for the mocked endpoints.
- [x] Loading, error, empty, and success states are visible and tested.
- [x] The main flow works without horizontal scrolling on supported viewports.
- [x] Mock mode is explicit and disabled for production builds.

### Required review

Review completed before implementing authentication.

## Phase 4 — Authentication and multi-tenancy

Status: [x] Completed.

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

Review completed before creating business functionality.

## Phase 5 — Core domain: projects and tasks

Status: [x] Completed — Bruno documentation added; pending required review.

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
- [x] Create or update the corresponding Bruno request for every endpoint.
- [x] Create domain, integration, and authorization tests.

### Exit criteria

- [x] The main flow works end to end through the API.
- [x] Mutations validate permissions and inputs.
- [x] The API has initial OpenAPI documentation.
- [x] Bruno collections cover successful responses and relevant error cases.
- [x] Important queries have justified indexes.
- [x] Coverage includes critical domain rules.

### Required review

Review the API contract, data model, and business rules before building the full dashboard.

## Phase 6 — Next.js dashboard integration

Status: [~] In progress.

### Objective

Integrate and harden the approved Phase 3 product experience against the real API,
with production-ready accessibility, responsive behavior, theming, and localization.

### Tasks

- [x] Consolidate public and authenticated layouts from the Phase 3 shell.
- [ ] Harden dashboard navigation, project pages, and task pages for the real API.
- [x] Replace the mock transport with the real API without changing component contracts.
- [x] Use Server Components by default.
- [x] Use Client Components only for interaction and local state.
- [x] Implement loading, error, and empty states.
- [x] Use Sass, CSS Modules, and responsibility-based components.
- [x] Use Lucide React as the default icon library, with Phosphor Icons as a selective complement and React Icons for brand logos.
- [x] Use Toastify for visual feedback.
- [x] Add light and dark themes using semantic design tokens and CSS variables.
- [x] Respect the system color scheme and provide a persisted manual theme toggle.
- [x] Add internationalization for English and Spanish using the approved i18n solution.
- [x] Keep translations organized by feature and avoid hardcoded user-facing copy.
- [x] Add basic accessibility and keyboard navigation.
- [x] Define and implement `hover`, `active`, `focus-visible`, and `disabled` states for interactive controls.
- [x] Verify touch-friendly feedback without relying exclusively on `hover`.
- [x] Add metadata and SEO for public pages.

### Exit criteria

- [ ] A user can complete the main flow from the interface.
- [ ] No secrets or authorization rules live only in the client.
- [ ] Loading, error, and empty states are covered.
- [ ] Critical flows have Playwright tests.
- [ ] The interface works on mobile, tablet, and desktop viewports without horizontal scrolling.
- [ ] Light and dark themes meet contrast requirements and are covered by UI tests.
- [ ] Primary flows render correctly in English and Spanish.

### Required review

Review UX, accessibility, and Server/Client Component decisions before adding secondary functionality.

## Phase 7 — Quality, security, and performance

Status: [ ] Not started.

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

Status: [ ] Not started.

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

Status: [ ] Not started.

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
| 2026-08-09 | 2     | Use Docker Compose with PostgreSQL and Redis; keep migration state in Drizzle and seed only infrastructure metadata                                                  | Provide a reproducible local environment without implementing Phase 4 authentication or tenant entities | No                                          |
| 2026-08-09 | 3     | Build the frontend-first product flow with typed mock data, MSW handlers, Bruno requests, and responsive dashboard views                                             | Validate the product UX and API contracts before authentication and the real API                        | No                                          |
| 2026-08-09 | 4     | Integrate Supabase Auth with HttpOnly sessions, bearer-token API validation, organization membership authorization, Resend invitations, and append-only audit events | Establish secure identity and tenant isolation before business-domain resources                         | Yes — confirmed in `AGENTS.md` and ADR 0004 |
