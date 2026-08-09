# Product Context Diagram

```mermaid
flowchart LR
  User[Team member or team lead] --> Web[TeamFlow web application]
  Web --> API[TeamFlow REST API]
  API --> DB[(PostgreSQL / Supabase data)]
  API --> Auth[Supabase Auth]
  API --> Email[Resend]
  API --> Cache[Redis later phase]
```
