# F11 — Customer Payment Status & Reupload Guidance

## Feature Type
Customer

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/dashboard/orders/, FITUR.md

## Current Status
Discovered / Needs Audit

## What Exists
Visual status trackers for payments (Unpaid, Paid, Pending Verification, Proof Rejected), payment instructions and upload/reupload forms.

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: File validation filters (extension/size checks), storage path configurations (currently local folders), feedback alerts on successful upload.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
