# TeamFlow SaaS — Initial API Contract

## Boundary

The API is a REST service implemented with Fastify. The web application is a client of the API; core business rules do not live in React components or Next.js route handlers.

## Initial resources

- `/auth` — authentication-adjacent session and current-user context.
- `/organizations` — organization creation, settings, memberships, invitations, activity, and health.
- `/projects` — project CRUD and project summaries.
- `/tasks` — task CRUD, assignment, status, labels, due dates, and comments.
- `/labels` — organization-scoped label management.
- `/audit-events` — authorized audit history reads.

Resource routes are organization-scoped through authenticated membership context. A client does not choose an arbitrary organization scope without the API verifying membership.

## Contract conventions

- JSON request and response bodies.
- Zod validation at the API boundary.
- OpenAPI documentation is maintained in the versioned Phase 5 contract.
- List responses contain `items` and pagination metadata: `page`, `pageSize`, and `total`.
- List endpoints support bounded page size, filtering, sorting, and search where relevant.
- Mutations return the created or updated resource and record an audit event when applicable.

The Phase 5 OpenAPI contract is maintained in
[`phase-5-openapi.yaml`](./phase-5-openapi.yaml).

## Error shape

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found.",
    "requestId": "request-id"
  }
}
```

Validation, authentication, authorization, not-found, conflict, rate-limit, plan-limit, and internal errors use stable machine-readable codes. Messages must not expose secrets or cross-tenant resource existence.

## Session decision

Supabase Auth owns identity and token issuance. The web application uses a secure, HttpOnly, SameSite-compatible session cookie through the server-side Supabase integration. Server-side web requests forward the short-lived access token to the API as a bearer token. The API validates the token and resolves organization membership for every protected request. Tokens and service-role credentials are never exposed to browser code.
