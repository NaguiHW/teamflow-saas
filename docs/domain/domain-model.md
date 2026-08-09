# TeamFlow SaaS — Initial Domain Model

## Entities

- `User`: authenticated Supabase identity and profile metadata.
- `Organization`: tenant/workspace with a simulated plan.
- `Membership`: a user’s relationship to an organization and assigned role.
- `Invitation`: pending invitation for an email address and organization.
- `Project`: organization-scoped collection of work.
- `Task`: organization-scoped unit of work belonging to a project; may be assigned to a member.
- `Label`: organization-scoped classification that can be applied to tasks.
- `TaskLabel`: join relationship between tasks and labels.
- `Comment`: organization-scoped discussion attached to a task.
- `AuditEvent`: immutable record of a security- or data-sensitive action.

## Ownership and lifecycle rules

- Organizations own memberships, invitations, projects, labels, comments, and audit events.
- Projects own tasks; tasks own comments through their relationship.
- A task assignee must be an active member of the same organization.
- A project, task, label, or comment cannot be accessed through an organization other than its own.
- Membership removal revokes access but does not delete the user account.
- Audit events are append-only from the application’s perspective.
- MVP deletion is soft-delete or status-based where history matters; audit events are never deleted by normal product actions.
