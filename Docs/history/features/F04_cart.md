# F04 — Cart

## Feature Type
Customer / Public

## Discovery Source
- **Path/API/DB/Doc**: apps/src/routes/katalog/ (cart state stores/local storage)

## Current Status
Discovered / Needs Audit

## What Exists
Cart persistence logic, stock validation check inside local cart store, cart dropdown/sidebar UI elements.

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: Cart persistence consistency across browser sessions, synchronization with back-end menu availability, UI feedback on state changes.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
