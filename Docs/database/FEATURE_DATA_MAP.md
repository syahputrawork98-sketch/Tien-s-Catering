# Feature Data Map

File ini memetakan fitur FXX ke database/table/model.

| Feature ID | Feature Name | Data Relation Status | Table / Model / Schema | Detail File | Notes |
| --- | --- | --- | --- | --- | --- |
| **F02** | Public Menu Catalog | Found | `menus`, `menu_daily_stock` | `features/F02_public_menu_catalog.md` | Tabel menu harian dan relasi sisa stok harian |
| **F03** | Menu Daily Stock / Stock-Aware Cart | Found | `menu_daily_stock`, `orders`, `order_items` | `features/F03_menu_daily_stock___stock_aware_cart.md` | Tabel stok harian menu dan status deduksi/potong stok pada tabel order |
| **F04** | Cart | Found | `order_items` | `features/F04_cart.md` | Pemetaan detail item keranjang belanja menjadi baris data item pesanan di database |
