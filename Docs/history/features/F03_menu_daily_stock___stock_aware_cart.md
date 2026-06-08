# F03 — Menu Daily Stock / Stock-Aware Cart

## Feature Type
Foundation / Frontend

## Discovery Source
- **Path/API/DB/Doc**: apps/src/lib/server/db/schema.ts (menu_daily_stock table), apps/src/routes/katalog/

## Current Status
Discovered / Needs Audit

## What Exists
SQLite daily stock table structure, stock status displays, logic preventing addition of items to cart if quantity exceeds daily stock.

## What Still Needs Audit
- **Frontend**: Navigation, UI consistency, visual alerts, interactive state.
- **Backend**: Authorization checks, controller validation, response structures.
- **Database**: SQLite schema references, data model verification.
- **Integration**: Concurrency controls for stock deduction, edge cases with multiple checkouts, automatic stock reset mechanics.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
