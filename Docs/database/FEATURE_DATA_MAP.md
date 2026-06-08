# Feature Data Map

File ini memetakan fitur FXX ke database/table/model.

| Feature ID | Feature Name | Data Relation Status | Table / Model / Schema | Detail File | Notes |
| --- | --- | --- | --- | --- | --- |
| **F02** | Public Menu Catalog | Found | `menus`, `menu_daily_stock` | `Docs/history/features/F02_public_menu_catalog.md` | Tabel menu harian dan relasi sisa stok harian |
| **F03** | Menu Daily Stock / Stock-Aware Cart | Found | `menu_daily_stock`, `orders`, `order_items` | `Docs/history/features/F03_menu_daily_stock___stock_aware_cart.md` | Tabel stok harian menu dan status deduksi/potong stok pada tabel order |
| **F04** | Cart | Found | `order_items` | `Docs/history/features/F04_cart.md` | Pemetaan detail item keranjang belanja menjadi baris data item pesanan di database |
| **F05** | Checkout Order | Found | `orders`, `order_items`, `delivery_info`, `payment_info` | `Docs/history/features/F05_checkout_order.md` | Struktur tabel data pemesanan, detail barang pesanan, data pengiriman dinas, dan status pembayaran pesanan |
| **F06** | Order Success | Found | `N/A` | `Docs/history/features/F06_order_success.md` | Halaman ini bersifat local-frontend murni menggunakan sessionStorage dan tidak berinteraksi langsung ke tabel/database |
| **F07** | Public Package Catering | Found | `packages` | `Docs/history/features/F07_public_package_catering.md` | Struktur tabel data master paket katering (termasuk penyimpanan stringified JSON arrays) |
| **F08** | Package Request | Found | `package_requests`, `orders`, `order_items` | `Docs/history/features/F08_package_request.md` | Struktur tabel request paket katering, relasi data review admin, serta pembuatan data order & items setelah dikonversi |
| **F09** | Customer Dashboard Home | Found | `orders`, `order_items`, `package_requests`, `users` | `Docs/history/features/F09_customer_dashboard_home.md` | Membaca data order, detail item pesanan, pengajuan request paket katering, dan detail metadata nama user pemesan untuk dashboard summary |
| **F10** | Customer Orders | Found | `orders`, `order_items`, `order_payment_proofs` | `Docs/history/features/F10_customer_orders.md` | Membaca riwayat data order, memetakan detail makanan pesanan, dan menyimpan data bukti bayar yang diunggah |
| **F11** | Customer Payment Status & Reupload Guidance | Found | `order_payment_proofs`, `payment_info` | `Docs/history/features/F11_customer_payment_status___reupload_guidance.md` | Menyimpan bukti pembayaran terunggah (Base64 string) ke order_payment_proofs dan memutasi status pembayaran transaksi di orders |
| **F12** | Customer Package Request History | Found | `package_requests`, `orders`, `order_items` | `Docs/history/features/F12_customer_package_request_history.md` | Menampilkan riwayat request paket katering dari package_requests dan menghubungkan ID order terkonversi |
| **F13** | Customer Address Management | None | None (Related existing table: `delivery_info`) | `Docs/history/features/F13_customer_address_management.md` | Tidak ada tabel khusus alamat customer (seperti user_addresses). Checkout katering menggunakan input manual per transaksi dan disimpan di delivery_info. |
| **F14** | Customer Profile / Account | Found | `users` | `Docs/history/features/F14_customer_profile___account.md` | Menyimpan data identitas user dan metadata kontak (name, email, password_hash, role, phone, address). Pembaruan profil memutasi baris data customer yang relevan di tabel `users`. |


