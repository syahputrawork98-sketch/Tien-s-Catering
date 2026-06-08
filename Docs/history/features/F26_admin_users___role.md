# F26 — Admin Users & Role

## Feature Type
Admin

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/dashboard/admin/users/

## Current Status
Discovered / Needs Audit

## What Exists
User role control table, details configuration, Developer account selector triggers.

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: Guard checks to prevent admins from locking themselves out, password resets logic.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
