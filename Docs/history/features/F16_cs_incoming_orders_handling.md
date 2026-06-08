# F16 — CS Incoming Orders Handling

## Feature Type
CS (Customer Service)

## Feature Summary
Fitur **F16 — CS Incoming Orders Handling** menyediakan halaman pengelolaan pesanan masuk bagi Customer Service (CS). Melalui antarmuka ini, CS dapat memantau seluruh pesanan pelanggan, memeriksa rincian item pesanan, alamat dinas pengantaran, mengonfirmasi status pengerjaan pesanan (baru, konfirmasi, proses, siap kirim, terkirim, selesai, batal), serta memverifikasi status pembayaran transaksi.

## Current Status
Found / Needs Functional Validation

## Confirmed Source Paths

### 1. Frontend & UI Paths
* **CS Orders Page**: `apps/src/routes/dashboard/cs/orders/+page.svelte`
* **Navigation Config**: `apps/src/lib/config/navigation.ts`

### 2. Backend & API Paths
* **GET Orders List API**: `apps/src/routes/api/orders/+server.ts`
* **PATCH Order Status API**: `apps/src/routes/api/orders/[id]/status/+server.ts`
* **PATCH Payment Status API**: `apps/src/routes/api/orders/[id]/payment-status/+server.ts`
* **POST Verify Payment API**: `apps/src/routes/api/orders/[id]/verify-payment/+server.ts`
* **Auth Guard Middleware**: `apps/src/lib/server/utils/authGuard.ts`

### 3. Service & Repository Layer
* **Order Service**: `apps/src/lib/server/services/orderService.ts`
* **Order Repository**: `apps/src/lib/server/repositories/orderRepository.ts`

### 4. Database & Data Model
* **Database Schema File**: `apps/src/lib/server/db/schema.ts` (Tabel `orders`, `order_items`, `delivery_info`, `payment_info`, dan `order_payment_proofs`)

## Confirmed Database Schema
Informasi pesanan dikelola secara relasional pada database SQLite melalui tabel-tabel berikut:
* **Tabel `orders`**: Menyimpan data order utama (`id`, `order_number`, `customer_name`, `whatsapp`, `delivery_date`, `notes`, `status`, `payment_status`, `total_amount`, `user_id`, `stock_status`, `stock_deducted_at`, `stock_released_at`, `created_at`, `updated_at`).
* **Tabel `order_items`**: Menyimpan detail barang belanjaan per transaksi (`id`, `order_id`, `menu_id`, `name`, `quantity`, `price`, `subtotal`).
* **Tabel `delivery_info`**: Menyimpan rincian lokasi pengantaran dinas Pemkot (`order_id`, `department_or_unit`, `floor`, `location_note`, `address_summary`).
* **Tabel `payment_info`**: Menyimpan detail tagihan dan metode bayar (`order_id`, `payment_method`, `payment_status`, `total_amount`, `paid_amount`, `remaining_amount`).
* **Tabel `order_payment_proofs`**: Menyimpan berkas bukti pembayaran Base64 terunggah (`id`, `order_id`, `file_name`, `file_path`, `mime_type`, `file_size`, `uploaded_at`, `status`, `verification_note`, `verified_at`, `verified_by`).

## Main CS Incoming Orders Flow
1. **Pemuatan Daftar Pesanan**:
   $$\text{Akses /dashboard/cs/orders} \longrightarrow \text{GET /api/orders} \longrightarrow \text{Kueri listOrderRecords() tanpa filter userId} \longrightarrow \text{Tampilkan Tabel/List Order}$$
2. **Pembaruan Status Pesanan**:
   $$\text{Klik Konfirmasi / Batalkan} \longrightarrow \text{PATCH /api/orders/[id]/status} \longrightarrow \text{updateOrderStatusRecord() di SQLite} \longrightarrow \text{Mutasi stok menu\_daily\_stock jika status 'confirmed' atau 'cancelled'}$$
3. **Verifikasi Bukti Pembayaran**:
   $$\text{Klik Verifikasi Pembayaran (Approve)} \longrightarrow \text{PATCH /api/orders/[id]/payment-status (Lunas)} \longrightarrow \text{updateOrderPaymentStatusRecord() di SQLite} \longrightarrow \text{Tandai paid\_amount penuh}$$

## UI States & Action Notes
* **Tab Navigation & Counters**:
  * Halaman orders memiliki tab navigasi filter: *Baru (NEW), Verifikasi Bayar (VERIFIKASI), Proses (PROSES), Lunas (LUNAS), Belum Bayar (BELUM_BAYAR), Selesai (SELESAI), Batal (BATAL), dan History*.
  * Setiap tab memiliki badge counter numerik dinamis yang berasal dari state `orders` lokal hasil query API.
* **Order Search & Date Filter**:
  * Filter pencarian reaktif client-side yang mencocokkan kata kunci terhadap ID order, nama customer, nomor WhatsApp, alamat, catatan, atau nama item menu.
  * Pada tab *History*, tersedia input date picker untuk memfilter riwayat pengiriman berdasarkan tanggal tertentu (`historyDateFilter`).
* **Detail Order Modal**:
  * Menampilkan informasi terperinci mengenai item belanjaan, detail alamat pengantaran, catatan tambahan, riwayat bukti bayar yang diunggah customer, serta tombol-tombol aksi operasional CS.
* **Action Buttons & Simulation Guards**:
  * **Tombol Konfirmasi**: Mengubah status pesanan baru menjadi `confirmed` dan memicu pengurangan stok menu harian.
  * **Tombol Batalkan Pesanan**: Membuka dropdown pilihan alasan pembatalan katering, lalu mengubah status menjadi `cancelled`.
  * **Tombol Verifikasi Pembayaran**: Memaksa status pembayaran pesanan menjadi `paid` (Lunas) melalui pemanggilan endpoint `/api/orders/[id]/payment-status`.
  * **Simulasi Penolakan Bukti Pembayaran**: Tombol penolakan bukti bayar hanya memicu `alert` simulasi tiruan di sisi client, tanpa memanggil endpoint backend real.
  * **Simulasi Konfirmasi Penyelesaian**: Tombol penyelesaian CS, User, dan Admin hanya memutasi array state lokal `orders` untuk kebutuhan demo alur penyelesaian katering.

## Status Transition & Stock Aware Cart
Peralihan status order memicu aturan khusus (rules/effects) di database SQLite:
* **Transisi Status $\rightarrow$ `confirmed`**:
  * Membaca daftar item belanjaan dari tabel `order_items`.
  * Melakukan kueri pengecekan stok di tabel `menu_daily_stock` untuk menu terkait di tanggal pengantaran (`delivery_date`).
  * Jika stok memadai, mengurangi `remaining_stock` di database, memperbarui label stok harian, dan mengubah status stok pesanan menjadi `deducted`.
  * Jika stok tidak cukup, proses diabaikan dan server mengembalikan pesan error (mencegah double booking).
* **Transisi Status $\rightarrow$ `cancelled`** (jika status sebelumnya sudah ter-deduct/confirmed):
  * Melakukan restore/pengembalian kuantitas pesanan ke sisa stok menu di database `menu_daily_stock`.
  * Mengubah status stok pesanan menjadi `released`.

## Authorization & Role Guards
* **Dashboard Access Guard**:
  * File layout dashboard (`+layout.svelte`) memblokir pengguna dengan role selain `CUSTOMER_SERVICE` dan `ADMIN` (seperti `CUSTOMER`) agar tidak dapat mengakses rute `/dashboard/cs/orders`.
* **API Endpoint Guards**:
  * Endpoint PATCH `/api/orders/[id]/status`, `/api/orders/[id]/payment-status`, dan POST `/api/orders/[id]/verify-payment` dilindungi secara ketat di backend melalui utilitas `requireRole(cookies, ['ADMIN', 'CS'])` untuk mencegah bypass modifikasi status dari client-side katering biasa.
* **GET Orders Sharing Endpoint**:
  * Endpoint `GET /api/orders` dishare bersama antara customer dan CS. Otorisasi membedakan respons: jika peran adalah `CUSTOMER`, mereka wajib menyertakan filter query `userId` (hanya bisa melihat ordernya sendiri), sedangkan `ADMIN`/`CS` diperbolehkan melakukan kueri seluruh data pesanan untuk kebutuhan manajemen operasional.

## Integration Notes
* **F10 — Customer Orders**: Perubahan status oleh CS langsung memutasi tabel SQLite, sehingga customer dapat memantau status terbaru pesanan mereka secara real-time.
* **F11 — Customer Payment Status & Reupload**: Konfirmasi pembayaran oleh CS langsung mengubah `payment_status` di orders menjadi `paid` (Lunas), yang secara otomatis menonaktifkan form upload bukti bayar milik customer di F11.
* **F15 — CS Overview**: Data order di database memengaruhi status antarmuka CS, meskipun saat ini CS Overview masih menggunakan counter tiruan (statis).
* **F12 — Customer Package Request History**: Jika order di F16 ini berasal dari konversi request paket (properti `sourceType === 'package_request'`), badge katering *"🍱 Paket Katering"* akan muncul di tabel pesanan F16 untuk membedakan pesanan menu reguler dengan pesanan hasil konversi katering.

## Gaps / Needs Functional Validation
* **Simulated Rejection API Call**: Tombol penolakan bukti pembayaran di halaman CS Orders memicu alert simulasi tiruan tanpa memanggil endpoint backend `/api/orders/[id]/verify-payment` (POST) yang sebenarnya sudah diimplementasikan di backend.
* **Simulated Order Completion Confirmation**: Tombol konfirmasi penyelesaian CS, User, dan Admin hanya memutasi array state lokal `orders` di halaman ini tanpa melakukan persistensi SQL status order menjadi `completed`. Status order riil di SQLite masih tertahan pada status operasional aktif.

## Do Not Touch Yet
* No implementation, modification, or refactoring in this audit-only task.
