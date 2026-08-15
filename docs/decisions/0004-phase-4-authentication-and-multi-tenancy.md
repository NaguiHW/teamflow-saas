# ADR 0004: Phase 4 Authentication and Multi-Tenancy

- Status: Accepted
- Date: 2026-08-09
- Phase: 4

## Decisions

- Supabase Auth owns identity, credential verification, recovery, and token issuance.
- API sessions use secure HttpOnly cookies; protected API requests also accept validated bearer tokens for server-to-server forwarding.
- Application profiles reference Supabase user IDs. Organizations and memberships are stored in the application database.
- Membership roles are `owner`, `admin`, `member`, and `viewer`, with authorization enforced by API hooks.
- Invitations store only SHA-256 token digests, expire after seven days, and are delivered by Resend when configured.
- Sensitive organization and membership actions create append-only audit events.

## Consequences

The browser does not need access to Supabase service credentials, and organization access is resolved from server-side membership records rather than client-provided organization IDs. Resource-specific permissions remain extensible for later domain phases.
