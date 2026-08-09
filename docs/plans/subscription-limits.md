# TeamFlow SaaS — Simulated Plan Limits

Plans are product limits only in the MVP. There is no billing integration and no payment enforcement.

| Limit                            |    Free |      Pro | Business |
| -------------------------------- | ------: | -------: | -------: |
| Organizations per user           |       1 |        3 |       10 |
| Active members per organization  |       5 |       25 |      100 |
| Active projects per organization |       3 |       25 |      100 |
| Tasks per project                |     100 |    1,000 |   10,000 |
| Labels per organization          |      10 |       50 |      200 |
| Attachment storage               |    None |     None |     None |
| Audit history retention          | 30 days | 180 days | 365 days |

Limits are checked server-side at mutation boundaries. The API returns a consistent limit error containing the limit key and current usage. Existing data remains readable when a plan changes; new mutations are blocked only when the relevant limit is exceeded. Plan upgrades and downgrades are simulated administrative changes.
