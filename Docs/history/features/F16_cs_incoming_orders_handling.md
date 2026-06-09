# F16 — CS Incoming Orders Handling

## Feature ID
F16

## Feature Name
CS Incoming Orders Handling

## Status
Found / Needs Functional Validation

## Scope
- Manajemen pesanan masuk oleh Customer Service (CS) di dashboard.
- Pemantauan status pesanan (NEW, VERIFIKASI, PROSES, LUNAS, BELUM_BAYAR, SELESAI, BATAL, HISTORY).
- Konfirmasi, pembatalan, dan verifikasi status pembayaran pesanan secara backend-driven maupun melalui simulasi frontend.
- Pengamanan akses halaman dan API berdasarkan role (CS/ADMIN).

## Files Inspected
- `apps/src/routes/dashboard/cs/orders/+page.svelte` (UI Halaman Pesanan Masuk)
- `apps/src/lib/config/navigation.ts` (Registrasi Menu Sidebar)
- `apps/src/routes/api/orders/+server.ts` (API List Orders)
- `apps/src/routes/api/orders/[id]/status/+server.ts` (API Update Status Order)
- `apps/src/routes/api/orders/[id]/payment-status/+server.ts` (API Update Status Pembayaran Manual)
- `apps/src/routes/api/orders/[id]/verify-payment/+server.ts` (API Verifikasi Bukti Pembayaran)
- `apps/src/lib/server/services/orderService.ts` (Service Logika Bisnis Order)
- `apps/src/lib/server/repositories/orderRepository.ts` (Repository SQLite Order)
- `apps/src/lib/server/db/schema.ts` (Skema Tabel SQLite)
- `apps/src/lib/server/utils/authGuard.ts` (Backend Role Guard Check)

## Feature Evidence Found

### UI Evidence
- Halaman utama CS Orders terletak di `apps/src/routes/dashboard/cs/orders/+page.svelte` dengan judul halaman **"Pesanan Masuk"**.
- Antarmuka memiliki tab filter status pesanan: `NEW`, `VERIFIKASI`, `PROSES`, `LUNAS`, `BELUM_BAYAR`, `SELESAI`, `BATAL`, dan `HISTORY`.
- Pengambilan data menggunakan pemanggilan `fetch('/api/orders')` secara client-side.
- Memiliki fungsi `mapApiOrderToCsOrder` untuk melakukan transformasi data dari API agar kompatibel dengan UI.
- Layout tabel dan daftar (list) pesanan yang interaktif beserta tombol detail untuk membuka modal order.
- Menyediakan tombol aksi operasional seperti konfirmasi pesanan, batalkan pesanan, konfirmasi COD, dan verifikasi manual.

### Route Evidence
- Menu navigasi sidebar pada `apps/src/lib/config/navigation.ts` mencantumkan rute CS orders dengan nama **"Pesanan Masuk"** dan rute `href` menuju `/dashboard/cs/orders`.

### Server/API Evidence
- Endpoint API pendukung di sisi backend:
  - `GET /api/orders` untuk mengambil seluruh daftar pesanan (tanpa parameter `userId` jika diakses oleh role CS/ADMIN).
  - `PATCH /api/orders/[id]/status` untuk mengubah status operasional order.
  - `PATCH /api/orders/[id]/payment-status` untuk mengubah status pembayaran secara manual.
  - `POST /api/orders/[id]/verify-payment` untuk verifikasi bukti pembayaran formal.

### Database Evidence
- Logika query SQLite terimplementasi di service dan repository:
  - `orderService.ts` menyediakan metode `getOrders()` yang memanggil `orderRepository.listOrderRecords()`.
  - `listOrderRecords()` menggunakan SQLite query Builder dengan join relasional lengkap yang menghubungkan tabel `orders`, `delivery_info`, `payment_info`, `order_items`, dan `order_payment_proofs`.
  - Update status pesanan melakukan operasi `UPDATE` terhadap tabel `orders`.
  - Update payment status melakukan operasi `UPDATE` terhadap tabel `payment_info`.

### Auth/Role Evidence
- File backend `apps/src/lib/server/utils/authGuard.ts` melindungi rute write-action di API via pemanggilan `requireRole(cookies, ['ADMIN', 'CS'])`.
- Role pengguna yang didukung oleh backend secara formal mencakup `CUSTOMER`, `ADMIN`, dan `CS`.
- Terdapat mekanisme redirect di level client-side dashboard layout untuk membatasi akses role. Namun, aplikasi masih menyediakan Dev Persona Switcher (persona mode) untuk simulasi peran secara lokal di client-side.

## Current Implementation Summary
Secara keseluruhan, fitur F16 telah terimplementasi di codebase dengan integrasi database dan API. Pemuatan daftar pesanan serta aksi konfirmasi status pesanan dan update payment status manual sudah terhubung secara real ke SQLite dan dilindungi dengan middleware otorisasi yang valid. Namun, beberapa fitur pendukung visual seperti validasi/penolakan bukti transfer pembayaran, alasan detail pembatalan, konfirmasi penyelesaian akhir (completion), serta fungsi filter lanjutan dan ekspor laporan masih berupa simulasi client-side murni atau belum tersinkronisasi sepenuhnya dengan API backend.

## Functional Flow Observed
1. **Memuat Pesanan**: CS mengakses halaman `/dashboard/cs/orders` $\rightarrow$ frontend memanggil `GET /api/orders` $\rightarrow$ `orderService.getOrders()` mengeksekusi `listOrderRecords()` di database $\rightarrow$ mengembalikan data pesanan dengan detail item, alamat instansi, dan riwayat bayar $\rightarrow$ dirender di tabel pesanan.
2. **Pembaruan Status (Confirm/Cancel)**: CS mengklik "Konfirmasi" $\rightarrow$ PATCH request dikirim ke `/api/orders/[id]/status` $\rightarrow$ status order diubah di SQLite menjadi `confirmed` $\rightarrow$ memicu efek samping berupa pengurangan stok menu di tabel `menu_daily_stock`. Jika dibatalkan, status berubah menjadi `cancelled` dan stok direstore.
3. **Verifikasi Pembayaran Manual**: CS memverifikasi pembayaran $\rightarrow$ PATCH request dikirim ke `/api/orders/[id]/payment-status` $\rightarrow$ status pembayaran di SQLite diperbarui menjadi `paid`.

## Gaps / Missing Parts
1. **Sinkronisasi Bukti Pembayaran (Payment Proof Review)**: Tinjauan bukti pembayaran (approve/reject proof) belum tersinkronisasi penuh dengan backend. Meskipun endpoint `verify-payment` sudah ada, UI CS orders belum menggunakannya secara penuh untuk aksi approve/reject proof secara dinamis.
2. **Simulasi Reject Payment**: Fungsi `handleRejectPayment()` di frontend masih berupa *simulation-only* (hanya menampilkan notifikasi alert tanpa mutasi state ke backend).
3. **Mapping Bukti Pembayaran Kosong**: Data bukti pembayaran dari API belum dimapping dengan benar ke UI CS karena mapping frontend saat ini mengosongkan field (`paymentProofs: []` dan `paymentProof: undefined`).
4. **Simulasi Konfirmasi Penyelesaian**: Konfirmasi penyelesaian pesanan (`completion confirmation`) oleh CS/user/admin masih berupa simulasi state lokal di frontend dan belum melakukan persistensi perubahan status akhir ke API/database SQLite.
5. **Alasan Pembatalan Tidak Tersimpan**: Ketika membatalkan order, UI meminta input `cancellationReason` dari CS, namun payload request PATCH yang dikirimkan ke server hanya berisi `{ status: 'cancelled' }`, sehingga alasan pembatalan tidak disimpan ke database SQLite.
6. **Filter & Export Report Statis**: Fitur penyaringan data tingkat lanjut dan ekspor laporan pesanan (Export Report) belum fungsional sepenuhnya.
7. **Limitasi Client-side Guard**: Proteksi halaman di client-side masih terbatas karena mode persona dev dapat mengabaikan validasi session client-side untuk kebutuhan demo, walaupun endpoint API backend (write actions) tetap memvalidasi token sesi secara aman menggunakan `requireRole`.

## Risk Notes
- **Kesalahpahaman Status Order**: CS dapat menganggap pesanan telah selesai secara sistem karena di frontend tombol penyelesaian sukses mengubah state lokal, padahal di database status order yang bersangkutan masih aktif.
- **Kebocoran Stok Akibat Pembatalan Tanpa Alasan**: Alasan pembatalan yang tidak tercatat membuat audit log menjadi sulit dilakukan apabila terjadi pembatalan massal.

## Suggested Status
**Found / Needs Functional Validation** (Tidak boleh ditandai sebagai Completed karena terdapat gap fungsional yang signifikan antara UI client-side dan persistensi API backend).

## Recommendation / Next Step
1. Hubungkan tombol Approve/Reject bukti transfer di modal detail pesanan ke endpoint `POST /api/orders/[id]/verify-payment`.
2. Perbaiki fungsi mapping `mapApiOrderToCsOrder` di frontend agar memetakan `payment_proofs` dari API ke state UI secara benar.
3. Implementasikan fungsionalitas pengiriman alasan pembatalan (`cancellationReason`) pada payload PATCH status pesanan dan simpan ke database SQLite.
4. Hubungkan tombol konfirmasi penyelesaian pesanan (CS/User/Admin) ke API agar status order ter-update secara permanen di database.
5. Jalankan *Functional Validation* secara end-to-end setelah gap fungsional di atas diperbaiki.
