# Feature API Map

File ini memetakan fitur FXX ke backend/API.

| Feature ID | Feature Name | API Relation Status | Endpoint / Backend Files | Detail File | Notes |
| --- | --- | --- | --- | --- | --- |
| **F02** | Public Menu Catalog | Found | `/api/menus`, `apps/src/lib/server/services/menuService.ts`, `apps/src/lib/server/repositories/menuRepository.ts` | `features/F02_public_menu_catalog.md` | API read-only data menu harian |
| **F03** | Menu Daily Stock / Stock-Aware Cart | Found | `/api/menus`, `/api/orders`, `apps/src/lib/server/services/orderService.ts`, `apps/src/lib/server/repositories/orderRepository.ts` | `features/F03_menu_daily_stock___stock_aware_cart.md` | Logic pembacaan stok harian & pemotongan/pemulihan stok pesanan tingkat database |
