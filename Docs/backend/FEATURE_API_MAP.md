# Feature API Map

File ini memetakan fitur FXX ke backend/API.

| Feature ID | Feature Name | API Relation Status | Endpoint / Backend Files | Detail File | Notes |
| --- | --- | --- | --- | --- | --- |
| **F02** | Public Menu Catalog | Found | `/api/menus`, `apps/src/lib/server/services/menuService.ts`, `apps/src/lib/server/repositories/menuRepository.ts` | `features/F02_public_menu_catalog.md` | API read-only data menu harian |
| **F03** | Menu Daily Stock / Stock-Aware Cart | Found | `/api/menus`, `/api/orders`, `apps/src/lib/server/services/orderService.ts`, `apps/src/lib/server/repositories/orderRepository.ts` | `features/F03_menu_daily_stock___stock_aware_cart.md` | Logic pembacaan stok harian & pemotongan/pemulihan stok pesanan tingkat database |
| **F04** | Cart | Found | `/api/orders`, `apps/src/lib/server/services/orderService.ts`, `apps/src/lib/server/repositories/orderRepository.ts` | `features/F04_cart.md` | Pengiriman data keranjang belanja (items payload) untuk diproses menjadi order items di backend |
| **F05** | Checkout Order | Found | `/api/orders`, `/api/orders/[id]`, `apps/src/lib/server/services/orderService.ts`, `apps/src/lib/server/repositories/orderRepository.ts` | `features/F05_checkout_order.md` | Endpoint API pembuatan pesanan baru, parsing/validasi kelayakan order payload, dan UUID/nomor pesanan generation |
| **F06** | Order Success | Found | `N/A` | `features/F06_order_success.md` | Halaman ini bersifat local-frontend murni menggunakan sessionStorage dan tidak melakukan pemanggilan API detail order secara mandiri |
| **F07** | Public Package Catering | Found | `/api/packages`, `apps/src/lib/server/services/packageService.ts`, `apps/src/lib/server/repositories/packageRepository.ts` | `features/F07_public_package_catering.md` | Endpoint API kueri data paket catering, pengelolaan service layer, dan data master seeding tingkat repository |
