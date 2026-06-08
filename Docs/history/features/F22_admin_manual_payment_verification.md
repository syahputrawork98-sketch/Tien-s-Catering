# F22 — Admin Manual Payment Verification

## Feature Type
Admin

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/dashboard/admin/orders/ (payment verification popup)

## Current Status
Discovered / Needs Audit

## What Exists
Payment confirmation details modal, verify/reject actions, admin confirmation dialog boxes.

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: Database updates logic (payment_info table write-back), security checks (prevent unauthorized API calls to verification route).

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
