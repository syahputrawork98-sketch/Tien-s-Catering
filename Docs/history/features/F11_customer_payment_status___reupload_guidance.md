# F11 — Customer Payment Status & Reupload Guidance

## Feature Type
Customer

## Discovery Source
- **Customer Orders Detail Modal**: `apps/src/routes/dashboard/orders/+page.svelte` *(Orders detail & payment proof modal)*
- **API Endpoint**: `apps/src/routes/api/orders/[id]/payment-proof/+server.ts`
- **Service Layer**: `apps/src/lib/server/services/orderService.ts`
- **Repository Layer**: `apps/src/lib/server/repositories/orderRepository.ts`
- **Database Tables**: `order_payment_proofs` & `payment_info` in `apps/src/lib/server/db/schema.ts`

## Current Status
Found / Needs Functional Validation

## What Exists
1. **Frontend UI Payment Status & Guides**:
   - Status visual (Lunas, DP Terbayar, Menunggu Verifikasi, COD, Belum Bayar) dirender secara dinamis di dalam detail modal pesanan pada `/dashboard/orders`.
   - Instruksi pembayaran dimuat secara dinamis via `/api/settings/payment` (Bank Name, Account Number, Account Owner, QRIS image) dengan fallback ke mock data default.
   - Formulir upload/reupload bukti pembayaran tersemat di bawah detail pesanan. Tombol upload akan otomatis berubah label menjadi `"Kirim Ulang Bukti (Resubmit)"` jika bukti pembayaran sebelumnya ditolak (`rejected`).
   - Panduan visual dan teks pembantu (*rejection note*) ditampilkan di bawah riwayat bukti pembayaran jika admin melakukan penolakan.
2. **Backend Upload & Validation API**:
   - Endpoint `POST /api/orders/[id]/payment-proof` memproses file unggahan bukti pembayaran.
   - Membatasi jenis file: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
   - Membatasi ukuran file maksimal 5MB.
   - Mengecek kepemilikan pesanan (`userId === user.id` untuk role `CUSTOMER`).
   - Mengonversi berkas menjadi string Base64 Data URL untuk disimpan langsung ke database SQLite simulation.
3. **Service & Repository Logic**:
   - `uploadPaymentProof` pada `orderService.ts` menyimpan bukti pembayaran ke tabel `order_payment_proofs` dan mengubah status pesanan (`payment_status`) menjadi `waiting_verification`.
   - Menghubungkan verifikasi manual admin (`verifyOrderPayment`) untuk menyetujui atau menolak bukti pembayaran teratas (`getLatestPaymentProofByOrderId`), meng-update bukti menjadi `verified`/`rejected`, serta status order menjadi `paid`/`rejected`.

## Technical Relations & Flow Map

### 1. Payment Status Flow
$$\text{Unpaid} \xrightarrow{\text{Upload Proof}} \text{Waiting Verification} \xrightarrow{\text{Admin Approve}} \text{Paid}$$
$$\text{Waiting Verification} \xrightarrow{\text{Admin Reject}} \text{Rejected} \xrightarrow{\text{Customer Reupload}} \text{Waiting Verification}$$

### 2. Technical Call Stack
$$\text{orders/+page.svelte (File Upload)} \longrightarrow \text{POST /api/orders/[id]/payment-proof} \longrightarrow \text{orderService.ts (uploadPaymentProof)} \longrightarrow \text{orderRepository.ts (savePaymentProofRecord \& updateOrderPaymentStatusRecord)} \longrightarrow \text{SQLite DB}$$

## Known Gaps (Needs Audit / Validation)
- **Base64 Data URL Storage (SQLite Bloat)**: Bukti pembayaran dikonversi menjadi string Base64 raksasa dan disimpan ke tabel `order_payment_proofs` kolom `file_path`. Ini memicu penurunan performa query dan pembengkakan ukuran database.
- **Payment Breakdown Sync Issue**: Saat memperbarui status pembayaran ke `paid` di repository, sisa tagihan di-reset paksa ke `0` dan jumlah bayar diset penuh tanpa menghitung cicilan/DP secara dinamis.
- **No File Content Verification**: Tipe file divalidasi hanya melalui properti `file.type` (MIME type) yang rentan dimanipulasi di sisi client, tanpa validasi magic byte sesungguhnya di backend.
- **Missing Reupload History Cleanup**: Bukti pembayaran lama tetap tersimpan di tabel `order_payment_proofs` saat reupload dilakukan, namun interface hanya menyoroti alasan penolakan bukti terbaru saja.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
