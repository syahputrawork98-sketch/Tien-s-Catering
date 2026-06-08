# F24 — Admin Package Management

## Feature Type
Admin

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/dashboard/admin/packages/

## Current Status
Discovered / Needs Audit

## What Exists
Admin control tables to edit packages catalog (name, suitable for, package items, min pax thresholds).

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: JSON fields serialization on edit, form input validation controls.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
