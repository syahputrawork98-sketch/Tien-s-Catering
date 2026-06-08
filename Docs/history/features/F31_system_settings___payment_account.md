# F31 — System Settings / Payment Account

## Feature Type
Admin

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/dashboard/admin/settings/, apps/src/routes/api/settings/

## Current Status
Discovered / Needs Audit

## What Exists
Configuration editor for store profile, bank accounts details, QRIS image path references.

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: Form validation controls, settings parameters saving methods in SQLite settings table.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
