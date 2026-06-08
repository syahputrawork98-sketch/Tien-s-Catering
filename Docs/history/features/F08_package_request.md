# F08 — Package Request

## Feature Type
Customer

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/api/package-requests/, apps/src/lib/server/db/schema.ts

## Current Status
Discovered / Needs Audit

## What Exists
SQLite package_requests schema, API endpoints to handle custom catering packages requests submissions.

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: Validation of events date, minimum pax validation checks, file uploads or custom item descriptions input checks.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
