# TeamFlow SaaS — MVP Scope

## Included

- Registration, login, logout, and account recovery.
- Organization creation and membership management.
- Email invitations.
- `owner`, `admin`, `member`, and `viewer` roles.
- Projects and project status.
- Tasks with assignment, status, labels, due dates, and comments.
- Pagination, filtering, sorting, and basic search.
- Loading, error, and empty states in primary product views.
- Organization activity and a basic health summary.
- Audit records for security- and data-sensitive changes.
- Simulated `free`, `pro`, and `business` plans.

## Explicitly out of scope

- Stripe or real billing, invoices, and payment management.
- AWS, Terraform, and service decomposition.
- Advanced reporting, custom dashboards, time tracking, and automations.
- Mobile applications and third-party integrations.
- Real-time collaboration and notifications beyond invitation email.
- Custom roles and a fully configurable permission editor.

Out-of-scope items may be evaluated in Phase 9 and must not shape the MVP implementation beyond clean extension points.
