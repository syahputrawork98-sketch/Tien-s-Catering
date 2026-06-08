# F32 — Auth, Session, Role Guard & Ownership Isolation

## Feature Type
Foundation / Security

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/login/, apps/src/routes/register/, apps/src/routes/api/auth/

## Current Status
Discovered / Needs Audit

## What Exists
Basic register/login pages, mock authorization flows, local user session storage verification, role-based guard triggers.

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: JWT/production session safety checks, password salting validation, endpoint garding for API queries.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
