# F10 — Customer Orders

## Feature Type
Customer

## Discovery Source
- **Customer Orders Page**: `apps/src/routes/dashboard/orders/+page.svelte` *(Orders listing & payment resubmit form)*
- **API Endpoints**: 
  - `apps/src/routes/api/orders/+server.ts` *(GET/POST)*
  - `apps/src/routes/api/orders/[id]/+server.ts` *(GET detail)*
  - `apps/src/routes/api/orders/[id]/payment-proof/+server.ts` *(POST payment proof)*
- **Service & Repository**: 
  - `apps/src/lib/server/services/orderService.ts`
  - `apps/src/lib/server/repositories/orderRepository.ts`
- **Database Tables**:
  - `orders` in `apps/src/lib/server/db/schema.ts`
  - `order_items` in `apps/src/lib/server/db/schema.ts`
  - `order_payment_proofs` *(created dynamically in SQLite repository)*

## Current Status
Found / Needs Functional Validation

## Technical Findings & Audit Summary

### 1. Customer Orders Route Structure
- **Main Route**: `/dashboard/orders` ditangani oleh `apps/src/routes/dashboard/orders/+page.svelte`.
- **Order Detail**: Detail pesanan dan status pembayaran ditampilkan menggunakan dialog modal bawaan halaman (`Modal` component dengan status `showDetail`) bukan rute anak/page terpisah.
- **Child routes**: Tidak ada child routes khusus. Seluruh navigasi/aksi pembayaran (prepaid, DP, COD, QRIS) dan unggah ulang bukti transfer tertanam langsung di dalam modal detail pesanan.
- **Role Control**: Mewarisi layout `/dashboard/+layout.svelte` yang membatasi hak akses role `CUSTOMER` dan mengalihkan user non-aktif ke `/login`.

### 2. UI Content Summary
- **Listing Tabs**: Memisahkan pesanan aktif dan riwayat masa lalu menggunakan komponen `<OrderTabs activeTab={...} />`:
  - **Tab ACTIVE**: Menampilkan pesanan dengan status `'PENDING'`, `'PROCESSING'`, atau `'SHIPPED'`.
  - **Tab HISTORY**: Menampilkan pesanan dengan status `'COMPLETED'` atau `'CANCELLED'`.
- **Cards & Data**: Merender nomor order (`orderNumber`), menu utama (diformat ringkas `[Menu] +X item` lewat `extractMenuName`), tanggal pesanan/delivery, total harga, status order, status pembayaran, serta rincian item, detail alamat pengiriman dinas, dan riwayat bukti pembayaran di dalam modal.
- **CTA Actions**:
  - Tombol detail memicu fungsi `handleDetail(id)`.
  - Pilihan opsi pembayaran (Prepaid, DP 30%, COD) jika belum diset.
  - Simulasi unggah bukti transfer/resubmit bukti bayar ditolak via form input file.
- **Empty / Loading / Error states**: Terintegrasi spinner loading, alert box error `⚠️` dengan tombol "Coba Lagi" (`loadOrders()`).

### 3. Data Source & Data Flow
- **Client-Side Loading**: Data orders diambil secara dinamis pada `onMount()` via client-side fetch ke `/api/orders` dengan parameter `?userId=${authStore.user?.id}`.
- **Payment Settings Loading**: Memanggil API `/api/settings/payment` (`loadPaymentSettings()`) untuk mendapatkan rekening bank/QRIS dinamis dari database, mem-fallback ke `getPrimaryPaymentAccount()` jika kosong/gagal.
- **Eager Loading**: Detail item pesanan (`order_items`) dan metadata bukti pembayaran (`order_payment_proofs`) diambil secara bersamaan (*eager loaded*) pada repositori tingkat query `listOrderRecords()` menggunakan Map aggregation.
- **No SSR Page Load**: Rute orders murni memanfaatkan rendering client-side tanpa SSR prefetch (`+page.ts` kosong/tidak ada).

### 4. Auth & Access Control
- **Auth Guard checks**: layout `+layout.svelte` memantau session token. Jika session habis/tidak valid, user dipaksa kembali ke `/login`. Jika API me-return HTTP 401, frontend langsung memanggil `authStore.handleUnauthorized()`.
- **User Ownership Guard**: API endpoint `/api/orders/+server.ts` (GET) dan `/api/orders/[id]/+server.ts` (GET) secara ketat memverifikasi sesi login via cookie dan mengembalikan status HTTP 403 Forbidden apabila query `userId` dari request `CUSTOMER` tidak sama dengan ID user terautentikasi di cookie session token.

### 5. API / Service / Repository / Database Mapping
- **List Orders API**: GET `/api/orders?userId=...` $\longrightarrow$ `orderService.getOrders(filters)` $\longrightarrow$ `orderRepository.listOrderRecords()` $\longrightarrow$ Kueri dari tabel `orders` digabung dengan `order_items` di SQLite.
- **Order Detail API**: GET `/api/orders/[id]` $\longrightarrow$ `orderService.getOrder(id)` $\longrightarrow$ filter dari hasil pencarian array orders.
- **Upload Payment Proof API**: POST `/api/orders/[id]/payment-proof` $\longrightarrow$ `orderService.uploadPaymentProof()` $\longrightarrow$ menyisipkan bukti ke tabel `order_payment_proofs` (melalui `savePaymentProofRecord()`) dan meng-update status pembayaran order ke `'waiting_verification'`.
- **Database Tables**:
  - Tabel `orders` menyimpan data transaksi (subtotal, total_amount, status, payment_status, dsb.).
  - Tabel `order_items` menyimpan detail item menu yang dipesan (kuantitas, harga, dsb.).
  - Tabel `order_payment_proofs` menyimpan data bukti bayar yang diunggah (termasuk Base64 filePath).

### 6. Integration with F11 (Payment Status & Reupload)
- Halaman F10 mengintegrasikan visual status pembayaran (Unpaid, Paid, Waiting Verification, Rejected) dari data payment_info.
- Menyediakan formulir upload/reupload bukti bayar di modal detail order F10. Jika status pembayaran ditolak (`'rejected'`), menampilkan alert teks merah dan tombol resubmit bukti bayar ("Kirim Ulang Bukti (Resubmit)").
- Menangani metode bayar transfer (menampilkan QRIS atau nomor rekening tujuan transfer dari `/api/settings/payment` atau mock data) dan COD (menampilkan instruksi siapkan dana tunai).
- Aksi upload F11 menyatu langsung di dalam modal detail F10.

### 7. Integration with F09 (Customer Dashboard Home)
- Keduanya memanggil GET `/api/orders` yang sama, memastikan data latest order dan order count di dashboard home sinkron dengan halaman orders.
- Aksi CTA dari dashboard home mengarah langsung ke `/dashboard/orders` dengan mulus.

### 8. Known Gaps
1. **Client-Side Shifting (No SSR)**: Ketiadaan load function server-side menyebabkan data orders sempat kosong atau memicu visual shifting saat client-side fetch sedang memproses data.
2. **Weak Initial Access Guard (Client-Side Guards)**: Karena redirect auth hanya dideklarasikan di tingkat client-side (`+layout.svelte` via `onMount` dan `$effect`), markup HTML halaman orders awal tetap berpotensi ter-render sekejap di browser sebelum skrip JS mengalihkan user ke halaman login (jika user tidak login).
3. **No Auto-Refresh / Real-Time Sync**: Halaman orders tidak melakukan polling otomatis atau memiliki WebSocket subscription untuk memantau pembaruan status order atau status pembayaran oleh admin. Data baru akan termuat bila user melakukan refresh halaman manual.
4. **Local Base64 Data URL Storage (Memory/Storage Bloat)**: Unggah bukti pembayaran dikonversi menjadi string Base64 raksasa dan disimpan langsung ke database SQLite (`order_payment_proofs.file_path`). Hal ini memicu pembengkakan ukuran database SQLite lokal dan penurunan performa query.
5. **No Pagination**: Seluruh order di-load sekaligus tanpa mekanisme pagination, berpotensi lambat jika riwayat transaksi customer sudah menumpuk banyak.

## Technical Relations & Flow Map

### 1. Payment Proof Upload Flow
$$\text{Orders Page (Upload Proof)} \longrightarrow \text{POST /api/orders/[id]/payment-proof} \longrightarrow \text{Convert file to Base64 dataURL} \longrightarrow \text{orderService.uploadPaymentProof()} \longrightarrow \text{Save proof in SQLite}$$

### 2. Orders Listing & Aggregation Flow
$$\text{Orders Page (onMount)} \longrightarrow \text{GET /api/orders?userId=X} \longrightarrow \text{orderRepository.listOrderRecords()} \longrightarrow \begin{cases} \text{Select raw order rows} \\ \text{Select raw order items} \\ \text{Select raw payment proofs} \end{cases} \longrightarrow \text{Eager mapping via Maps}$$

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
