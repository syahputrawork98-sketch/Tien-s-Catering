# F13 — Customer Address Management

## Feature Type
Customer

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/dashboard/addresses/

## Current Status
Discovered / Needs Audit

## What Exists
Input fields and listing tables for Pemkot Cimahi workspace details (department, building, floor, description/notes).

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: Validation logic, CRUD functions via SQLite, address reuse behavior on checkout.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
