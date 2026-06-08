# F29 — Commercial Invoice / Internal Billing

## Feature Type
Public / Customer / Admin

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/invoice/

## Current Status
Discovered / Needs Audit

## What Exists
Invoice generation templates, items breakdowns, tax and total cost computations display, print view mode layout.

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: Print layout styles verification, PDF rendering integration (if any), route safety constraints.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
