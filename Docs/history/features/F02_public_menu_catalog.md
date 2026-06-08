# F02 — Public Menu Catalog

## Feature Type
Public / Customer

## Discovery Source
- **Frontend Page**: [apps/src/routes/katalog/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/katalog/)
- **Components**: [apps/src/lib/components/MenuCard.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/MenuCard.svelte), [apps/src/lib/components/ModalMenuDetail.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/ModalMenuDetail.svelte)
- **API Endpoint**: [apps/src/routes/api/menus/+server.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/api/menus/+server.ts)
- **Service & Repository**: [apps/src/lib/server/services/menuService.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/services/menuService.ts), [apps/src/lib/server/repositories/menuRepository.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/repositories/menuRepository.ts)
- **Database Tables**: `menus` and `menu_daily_stock` tables in [apps/src/lib/server/db/schema.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/db/schema.ts)

## Current Status
Discovered / Needs Audit (Relasi Teknis Ditemukan)

## What Exists
1. **Frontend Catalog**:
   - `katalog/+page.svelte` renders a 7-day Date Scroller, Menu Items Grid, Empty State message, and detail Modal.
   - `katalog/+page.ts` fetches data dynamically from `/api/menus` with fallback to `mockMenus` on failure.
   - `MenuCard.svelte` renders price formatting, category tag, stock numbers, sold out overlays, and add-to-cart buttons.
   - `ModalMenuDetail.svelte` provides item summary details, quantity selector, and cart validation.
2. **Backend & API**:
   - `/api/menus` GET endpoint fetches menus using the service layer.
   - `menuService.ts` wraps repository calls.
   - `menuRepository.ts` joins `menus` and `menu_daily_stock` using SQLite queries.
3. **Database Schema**:
   - `menus` table stores core metadata (id, name, description, category, base_price, image, status).
   - `menu_daily_stock` table stores date-specific constraints (menu_id, active_date, daily_stock, remaining_stock, stock_label, status).

## Technical Relations & Flow Map
$$\text{SQLite DB (menus JOIN menu\_daily\_stock)} \longrightarrow \text{menuRepository.ts} \longrightarrow \text{menuService.ts} \longrightarrow \text{GET /api/menus} \longrightarrow \text{katalog/+page.ts} \longrightarrow \text{MenuCard.svelte} \longrightarrow \text{cartStore.svelte.ts}$$

## UI Behaviors Discovered
- **Date Scroller**: Clicking a date parameter navigates to `?date=YYYY-MM-DD` and re-evaluates the active stock.
- **Empty State**: Renders a `Menu Sedang Dimasak` message when no items exist for the date.
- **Stock Indicators**: Alerts of low stock `Sisa: X porsi` flash when stock is `< 5`.
- **Sold Out**: Renders `Habis Terjual` badge and disables add triggers if stock is `0`.
- **Cart Limit Safeguards**: Displays `Maksimal X porsi sudah ada di keranjang` if cart quantity reaches daily stock limits.

## Known Gaps (Needs Audit / Validation)
- **Broken Image fallbacks**: Checks if placeholder `/images/placeholder-menu.jpg` exists.
- **Timezone Mismatch**: Check dates conversions from browser local timezone vs database strings.
- **Stock deduction sync**: Concurrent shopping sessions may checkout overlapping items; need verification of SQLite locking behaviors on orders.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
