# F05 — Checkout Order

## Feature Type
Customer

## Discovery Source
- **Frontend Page**: [apps/src/routes/checkout/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/checkout/), [apps/src/routes/order-success/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/order-success/)
- **Components**: [apps/src/lib/components/PublicNavbar.svelte](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/components/PublicNavbar.svelte)
- **API Endpoint**: [apps/src/routes/api/orders/](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/routes/api/orders/)
- **Service & Repository**: [apps/src/lib/server/services/orderService.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/services/orderService.ts), [apps/src/lib/server/repositories/orderRepository.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/repositories/orderRepository.ts)
- **Database Tables**: `orders`, `order_items`, `delivery_info`, and `payment_info` in [apps/src/lib/server/db/schema.ts](file:///i:/Workspace/Workspace-Syahputrawork/TC-Tien-s-Catering/apps/src/lib/server/db/schema.ts)

## Current Status
Found / Needs Functional Validation

## What Exists
1. **Checkout Page (`checkout/+page.svelte`)**:
   - Rute halaman `/checkout` menyediakan formulir pemesanan berisi input data penerima (`customerName`, `whatsapp`), informasi pengiriman (`departmentOrUnit`, `floor`, `locationNote`), catatan tambahan (`notes`), dan pilihan metode pembayaran (`paymentMethod`).
   - Menyajikan ringkasan menu pesanan (summary) dan kalkulasi total harga tagihan (*Billing Info*).
2. **Frontend Validation**:
   - Validasi standard HTML5 `required` pada kolom input utama.
   - Pengecekan status keranjang kosong; jika kosong, merender pesan warning dan memblokir submit order.
   - Validasi reaktif `stockIssues`; tombol submit dinonaktifkan jika ada porsi pesanan melebihi sisa stok harian lokal (`availableStock`).
3. **API Endpoint & Service (`/api/orders` POST)**:
   - Endpoint menerima request POST JSON dengan data lengkap customer, items, dan totals.
   - Service layer `orderService.ts` memvalidasi kelengkapan format payload, harga $\ge 0$, kuantitas $> 0$, dan keabsahan assignment `userId`.
   - Mengembalikan respons JSON berisi ringkasan order dan HTTP status **201 Created** jika sukses, atau HTTP status **400 Bad Request** jika parameter tidak valid.
4. **SQLite Persistence Layer (`orderRepository.ts`)**:
   - Metode `createOrderRecord` membungkus seluruh operasi penyisipan baris ke tabel `orders`, `order_items`, `delivery_info`, dan `payment_info` di dalam satu transaksi SQLite (`db.transaction`).
   - Jika terjadi kegagalan insert, database otomatis di-rollback untuk menjaga integritas data.
   - ID pesanan dibuat via UUID acak, sedangkan nomor pesanan (`order_number`) digenerasi dengan kombinasi unik timestamp + UUID pendek.
5. **Success Flow (`order-success/+page.svelte`)**:
   - Setelah sukses checkout, data respons order disimpan ke `sessionStorage` dengan key `'lastOrder'`.
   - Keranjang lokal dibersihkan (`cart.clear()`).
   - User dialihkan ke halaman `/order-success` yang memuat ringkasan transaksi dari data session.

## Technical Relations & Flow Map

### 1. Checkout Processing & Success Redirect Flow
$$\text{checkout/+page.svelte (Form Submit)} \longrightarrow \text{POST /api/orders} \longrightarrow \text{orderService.ts (parse & validate payload)} \longrightarrow \text{orderRepository.ts (SQLite transaction insert)}$$
$$\text{Response (201 Created)} \longrightarrow \text{Save order payload to sessionStorage ('lastOrder')} \longrightarrow \text{cart.clear()} \longrightarrow \text{goto('/order-success')}$$

### 2. Success Page Loading Flow
$$\text{order-success/+page.svelte (onMount)} \longleftarrow \text{sessionStorage.getItem('lastOrder')} \longrightarrow \text{Render static transaction details (Order No., Total, Status)}$$

## UI Behaviors Discovered
- **Form Prefill**: Bidang Nama Penerima otomatis terisi jika terdeteksi data login user aktif di `authStore`.
- **Checkout Blocking**: Tombol konfirmasi dinonaktifkan dan banner peringatan muncul jika kuantitas item keranjang melebihi sisa stok harian yang tersimpan lokal.
- **Stale Legacy Cart Warning**: Terdapat banner penjelas jika ada item lama di keranjang belanja yang tidak memiliki info stok (`unknownStockCount > 0`).

## Known Gaps (Needs Audit / Validation)
- **Backend Stock Verification Gap**: Server tidak memverifikasi sisa stok aktual di database `menu_daily_stock` saat order dibuat (status order baru diset default `new` dan `stock_status` diset `not_deducted`). Validasi stok database ditunda hingga Admin mengonfirmasi pesanan.
- **Price & Total Tampering Risk**: Backend mempercayai data harga (`item.price`) dan total pembayaran (`totals.total`) yang dikirim langsung dari frontend tanpa memverifikasi ulang ke database `menus.base_price`, membuka celah eksploitasi manipulasi harga di sisi client.
- **Stale Cart Validation Bypass**: Item keranjang belanja lama yang tidak memiliki ketersediaan stok (`availableStock = undefined`) diperbolehkan checkout tanpa validasi stok terbaru ke server.
- **Duplicate Submit Risk**: Tidak ada mekanisme pencegahan pengiriman ganda (*double submit*) jika pengguna menekan tombol konfirmasi berulang-ulang sebelum request API selesai diproses.
- **Session Storage Dependency**: Halaman `/order-success` bergantung penuh pada data `sessionStorage`. Jika halaman direfresh manual di luar sesi belanja aktif, data transaksi akan hilang dan menampilkan fallback kosong.
- **Spam & Security Risk**: Endpoint POST `/api/orders` dapat diakses secara publik tanpa batas laju permintaan (*rate limit*) atau captha, rentan terhadap spam order simulasi.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
