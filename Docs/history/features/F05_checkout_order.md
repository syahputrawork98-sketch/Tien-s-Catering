# F05 — Checkout Order

## Feature Type
Customer

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/checkout/

## Current Status
Discovered / Needs Audit

## What Exists
Checkout order submission form (customer name, whatsapp, department/unit, floor level, notes), order validation logic.

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: Validation of department and floor options, checkouts from non-logged-in users, error handling for database failures during checkout.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
