# TeamFlow SaaS — Authorization Matrix

Authorization is enforced by the API after authentication and organization membership resolution. UI visibility is only a usability concern and is never the security boundary.

| Capability                     | Owner | Admin | Member | Viewer |
| ------------------------------ | ----: | ----: | -----: | -----: |
| Read organization and activity |   Yes |   Yes |    Yes |    Yes |
| Update organization settings   |   Yes |   Yes |     No |     No |
| Invite members                 |   Yes |   Yes |     No |     No |
| Change member roles            |   Yes |  Yes* |     No |     No |
| Remove members                 |   Yes |  Yes* |     No |     No |
| Create projects                |   Yes |   Yes |    Yes |     No |
| Update or archive projects     |   Yes |   Yes |  Yes** |     No |
| Create and edit tasks          |   Yes |   Yes |    Yes |     No |
| Assign tasks to members        |   Yes |   Yes |    Yes |     No |
| Delete tasks                   |   Yes |   Yes |  Yes** |     No |
| Manage labels                  |   Yes |   Yes |    Yes |     No |
| Comment on tasks               |   Yes |   Yes |    Yes |     No |
| Read audit events              |   Yes |   Yes |     No |     No |

`*` Admins cannot change or remove the owner, promote another member to owner, or remove the last owner.

`**` Members may modify resources they created or are assigned to; admins and owners may modify any resource. Exact resource checks are part of the API authorization contract.

Every tenant-aware read and mutation requires the resolved `organization_id` predicate. Cross-organization identifiers must return the same not-found/forbidden-safe response rather than reveal whether a resource exists.
