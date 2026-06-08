# Feature Data Map

File ini memetakan fitur FXX ke database/table/model.

| Feature ID | Feature Name | Data Relation Status | Table / Model / Schema | Detail File | Notes |
| --- | --- | --- | --- | --- | --- |
| **F02** | Public Menu Catalog | Found | `menus`, `menu_daily_stock` | `features/F02_public_menu_catalog.md` | Tabel menu harian dan relasi sisa stok harian |
| **F03** | Menu Daily Stock / Stock-Aware Cart | Found | `menu_daily_stock`, `orders`, `order_items` | `features/F03_menu_daily_stock___stock_aware_cart.md` | Tabel stok harian menu dan status deduksi/potong stok pada tabel order |
| **F04** | Cart | Found | `order_items` | `features/F04_cart.md` | Pemetaan detail item keranjang belanja menjadi baris data item pesanan di database |
| **F05** | Checkout Order | Found | `orders`, `order_items`, `delivery_info`, `payment_info` | `features/F05_checkout_order.md` | Struktur tabel data pemesanan, detail barang pesanan, data pengiriman dinas, dan status pembayaran pesanan |
| **F06** | Order Success | Found | `N/A` | `features/F06_order_success.md` | Halaman ini bersifat local-frontend murni menggunakan sessionStorage dan tidak berinteraksi langsung ke tabel/database |
| **F07** | Public Package Catering | Found | `packages` | `features/F07_public_package_catering.md` | Struktur tabel data master paket katering (termasuk penyimpanan stringified JSON arrays) |
| **F08** | Package Request | Found | `package_requests`, `orders`, `order_items` | `features/F08_package_request.md` | Struktur tabel request paket katering, relasi data review admin, serta pembuatan data order & items setelah dikonversi |
| **F09** | Customer Dashboard Home | Found | `orders`, `order_items`, `package_requests`, `users` | `features/F09_customer_dashboard_home.md` | Membaca data order, detail item pesanan, pengajuan request paket katering, dan detail metadata nama user pemesan untuk dashboard summary |
