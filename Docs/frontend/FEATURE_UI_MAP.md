# Feature UI Map

File ini memetakan fitur FXX ke UI/frontend.

| Feature ID | Feature Name | UI Relation Status | Source Path / UI Files | Detail File | Notes |
| --- | --- | --- | --- | --- | --- |
| **F00** | Existing Project Zero Point | Not Required | N/A | N/A | Aturan main workflow |
| **F01** | Area Documentation Structure | Found | `Docs/` | N/A | Dokumen navigasi area |
| **F02** | Public Menu Catalog | Found | `apps/src/routes/katalog/`, `apps/src/lib/components/MenuCard.svelte`, `apps/src/lib/components/ModalMenuDetail.svelte` | `features/F02_public_menu_catalog.md` | Halaman katalog, Date Scroller, detail Modal |
| **F03** | Menu Daily Stock / Stock-Aware Cart | Found | `apps/src/routes/katalog/`, `apps/src/routes/checkout/`, `apps/src/lib/components/MenuCard.svelte`, `apps/src/lib/components/ModalMenuDetail.svelte`, `apps/src/lib/stores/cartStore.svelte.ts` | `features/F03_menu_daily_stock___stock_aware_cart.md` | Sisa stok harian menu, stock-aware cart validations di katalog & checkout, quantity limit safeguards |
| **F04** | Cart | Found | `apps/src/lib/stores/cartStore.svelte.ts`, `apps/src/lib/components/CartDrawer.svelte`, `apps/src/lib/components/PublicNavbar.svelte`, `apps/src/lib/components/MenuCard.svelte`, `apps/src/lib/components/ModalMenuDetail.svelte` | `features/F04_cart.md` | Logic local state store, sidebar/drawer keranjang, cart actions (CRUD), dan sinkronisasi badge/counter |
| **F05** | Checkout Order | Found | `apps/src/routes/checkout/`, `apps/src/routes/order-success/` | `features/F05_checkout_order.md` | Formulir pemesanan, summary list keranjang, validasi forms, error warnings, dan antarmuka sukses pesanan |
| **F06** | Order Success | Found | `apps/src/routes/order-success/` | `features/F06_order_success.md` | Halaman konfirmasi sukses belanja, render receipt transaksi dari data session, dan navigasi CTA dashboard/katalog |
| **F07** | Public Package Catering | Found | `apps/src/routes/paket-catering/`, `apps/src/lib/components/PackageDetailModal.svelte` | `features/F07_public_package_catering.md` | Halaman utama daftar paket catering publik, visual card, detail spesifikasi porsi, estimasi harga, dan form pengajuan request terintegrasi |
| **F08** | Package Request | Found | `apps/src/lib/components/PackageDetailModal.svelte`, `apps/src/routes/dashboard/package-requests/`, `apps/src/routes/dashboard/admin/package-requests/` | `features/F08_package_request.md` | Formulir pengajuan modal request, halaman tracking customer, dan dashboard review/konversi admin |
