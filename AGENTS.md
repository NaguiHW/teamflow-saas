# TeamFlow SaaS — AGENTS.md

## Objective

Build a multi-tenant platform for managing teams, projects, tasks, and operational activity. The project must demonstrate product design, data isolation, authorization, and production readiness.

## Initial stack

- Frontend: Next.js with App Router, React, and TypeScript.
- Backend: Fastify, Node.js, and TypeScript.
- ORM and validation: Drizzle ORM and Zod.
- Data: PostgreSQL, preferably Supabase.
- Authentication: Supabase Auth.
- Email: Resend.
- Local infrastructure: Docker Compose.
- Initial deployment: Vercel for `apps/web`, Render for `apps/api`, and Supabase for data and authentication.
- Later infrastructure phase: AWS and Terraform.
- Quality: Jest, React Testing Library, Playwright, and GitHub Actions.
- Operations: Redis for caching, rate limiting, and background jobs; Sentry or OpenTelemetry for observability.

## Initial structure

```text
apps/
├── web/       # Next.js, App Router, and user experience
└── api/       # Node.js, HTTP API, and business rules
packages/
├── ui/        # Shared components
└── types/     # Shared contracts and types
infra/         # Docker and deployment configuration
docs/          # Architecture and technical decisions
```

The web application and API remain separate to make frontend and backend responsibilities explicit. Do not move domain logic into interface components.

## Code and component conventions

- Use ES6+ and arrow functions by default.
- Function and variable names use `camelCase`.
- React components use `PascalCase`.
- A component file must use the same `PascalCase` name, for example `TaskCard.tsx`.
- Components must use `export default`.
- Styles must use Sass and CSS Modules, for example `TaskCard.module.scss`.
- Create components around visual or business responsibilities, even when they are not initially reused. Avoid artificial components for every HTML element without its own behavior or responsibility.
- Keep components small, focused, and easy to test.
- Build responsive interfaces mobile-first and verify the main flows on mobile, tablet, and desktop viewports.
- Do not rely on fixed widths that cause horizontal scrolling on supported viewports.
- Support light and dark themes through semantic design tokens and CSS variables; do not hardcode theme-specific colors inside components.
- Respect the user's system color-scheme preference on first visit and provide a manual theme toggle with persisted preference.
- Support English and Spanish through a typed internationalization layer; do not hardcode user-facing copy in components.
- Keep translation keys organized by feature and provide a fallback locale for missing translations.
- Use `lucide-react` as the default icon library.
- Use Phosphor Icons only when Lucide does not provide a suitable icon or a different visual weight is required.
- Use React Icons selectively for technology and brand logos.
- Do not mix icon styles arbitrarily within the same feature.
- Interactive icons must include an accessible label or an associated visible label; decorative icons must use `aria-hidden="true"`.
- Declarative styles must live in a separate Sass file. TypeScript may select conditional classes but must not contain style blocks.
- Component-only types may live next to the component; reusable domain types must live in separate files.

### Component example

`Task.types.ts`

```tsx
export type TaskStatus = "pending" | "completed";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
};
```

`TaskCard.tsx`

```tsx
import type { Task } from "./Task.types";
import styles from "./TaskCard.module.scss";

type TaskCardProps = {
  task: Task;
  onToggle: (taskId: string) => void;
};

const TaskCard = ({ task, onToggle }: TaskCardProps) => {
  const isCompleted = task.status === "completed";

  const handleToggle = () => {
    onToggle(task.id);
  };

  return (
    <article className={styles.card}>
      <span className={isCompleted ? styles.completed : styles.title}>
        {task.title}
      </span>

      <button
        className={styles.card__button}
        type="button"
        onClick={handleToggle}
      >
        {isCompleted ? "Reopen" : "Complete"}
      </button>
    </article>
  );
};

export default TaskCard;
```

`TaskCard.module.scss`

```scss
.card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;

  &__button {
    cursor: pointer;
    padding: 0.5rem 1rem;
    border: 0;
    border-radius: 0.25rem;
  }

  .title {
    color: #222;
  }
  .completed {
    color: #777;
    text-decoration: line-through;
  }
}
```

## Scope

- Registration, login, account recovery, and invitations.
- Organizations with members, roles, and permissions.
- Projects, tasks, labels, comments, and due dates.
- Change auditing.
- Pagination, filtering, search, and empty states.
- Basic organization activity and health dashboard.

## Quality, alerts, and workflow

- Use Toastify for visual feedback, errors, and non-destructive confirmations.
- Tests must especially cover authentication, authorization, tenant isolation, mutations, and flows whose failure could corrupt data or block the application.
- Measure coverage and require a threshold for critical code; global coverage does not replace risk-based coverage.
- Use Gitflow branches: `main`, `develop`, `feature/*`, `release/*`, and `hotfix/*`.
- Use consistent commit messages, preferably Conventional Commits, for example `feat: add project filters`.

## Architecture rules

- Every query must be scoped by `organization_id` and validated on the server.
- Authorization belongs in the backend; hiding buttons in React is not security.
- API responses must use a consistent error format.
- Whenever an endpoint is created or changed, create or update its Bruno request collection under `docs/api/bruno/`.
- Bruno requests must include the method, URL, headers, authentication requirements, example body, expected response, and relevant error cases.
- Bruno collections must never contain real secrets; use environment variables and provide a safe example environment file.
- Migrations are versioned; production must never be modified manually.
- Keep a modular monolith until there is a measurable reason to split services.
- Secrets must only live in environment variables or a secret manager.
- Resend keys must only be used by the API and must never reach the client.
- Send emails through idempotent background jobs whenever the request does not need to wait for delivery.

## Next.js rules

- Use App Router and Server Components by default.
- Use Client Components only when state, browser events, or client APIs are required.
- Never expose secrets or credentials in client components.
- Use Server Actions or Route Handlers only for small, clearly bounded operations; core business rules belong in the API.
- Define caching and revalidation boundaries for every query.
- Never cache organization- or user-specific data without preserving the authorization context.
- Use `loading.tsx`, `error.tsx`, and empty states in primary routes.
- Use `next/image`, metadata, and SEO-friendly public routes.
- Use `next-intl` or the approved project i18n solution for English and Spanish, including locale-aware routing where applicable.
- Avoid hydration mismatches when reading theme or locale preferences in Client Components.
- Never use the frontend as the only security layer.

## Quality and security

- Develop the first product flows frontend-first using typed mock data and Mock Service Worker (MSW).
- Keep mock handlers and fixtures outside React components, preferably under `apps/web/src/mocks/` or a shared package.
- Mock responses must follow the same API contracts and Zod schemas planned for the real API.
- Mock mode must be explicit and disabled in production builds.
- Never treat mock authentication or client-side permissions as real security.
- Validate inputs with typed schemas.
- Test permissions, tenant isolation, and concurrency cases.
- Add unit, integration, and E2E tests for critical flows.
- Test both light and dark themes, including contrast for critical states and interactive controls.
- Test English and Spanish rendering for primary flows, including loading, error, empty, and validation messages.
- Apply rate limiting to login, invitations, and sensitive endpoints.
- Document technical decisions and trade-offs in `docs/decisions/`.

## Definition of Done

- The project runs with Docker Compose from a clean installation.
- CI runs lint, typecheck, tests, and build.
- A deployed demo and seed data exist.
- The README includes architecture, setup, decisions, and screenshots.
- No endpoint lacks authorization and no tenant query is unscoped.

## Confirmed decisions

- The API uses REST, OpenAPI, Fastify, Drizzle ORM, and Zod.
- The data model is multi-tenant through `organization_id`.
- Initial roles are `owner`, `admin`, `member`, and `viewer`.
- Authentication uses Supabase Auth.
- The MVP uses simulated `free`, `pro`, and `business` plans; Stripe is a later phase.
- The pnpm workspace uses `apps/web`, `apps/api`, `packages/types`, and `packages/ui` with package names `@teamflow/web`, `@teamflow/api`, `@teamflow/types`, and `@teamflow/ui`.
- The frontend is deployed to Vercel and the API to Render.
- Docker Compose is required for local development and CI.
- AWS and Terraform are a later phase.
- Supabase Auth sessions use secure HttpOnly cookies at the API boundary, and protected API requests accept validated bearer tokens.

## Pending decisions

- Full subscription enforcement behavior.
- Complete resource-level permission model.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
