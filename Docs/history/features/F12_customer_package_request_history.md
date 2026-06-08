# F12 — Customer Package Request History

## Feature Type
Customer

## Discovery Source
- **Customer Package Requests Page**: `apps/src/routes/dashboard/package-requests/+page.svelte`
- **API Endpoints**: 
  - `apps/src/routes/api/package-requests/+server.ts` *(GET/POST)*
  - `apps/src/routes/api/package-requests/[id]/convert/+server.ts` *(POST)*
  - `apps/src/routes/api/package-requests/[id]/status/+server.ts` *(PATCH)*
- **Service Layer**: `apps/src/lib/server/services/packageRequestService.ts`
- **Repository Layer**: `apps/src/lib/server/repositories/packageRequestRepository.ts`
- **Database Tables**: `package_requests` in `apps/src/lib/server/db/schema.ts`

## Current Status
Found / Needs Functional Validation

## What Exists
1. **Frontend Package Request History Page**:
   - Halaman `/dashboard/package-requests` menampilkan daftar pengajuan request paket katering dalam tata letak kartu grid.
   - Kartu menampilkan detail pengajuan: nama paket, ID referensi, tanggal acara, kuantitas pax, lokasi pengiriman, catatan khusus, status, estimasi harga dari admin, balasan admin, dan timeline progress visual.
   - **Status Badges & Labels**:
     - `new` $\rightarrow$ "Menunggu Review" (warna biru)
     - `reviewing` $\rightarrow$ "Sedang Ditinjau" (warna kuning/amber)
     - `quoted` $\rightarrow$ "Penawaran Diberikan" (warna indigo)
     - `rejected` $\rightarrow$ "Dibatalkan/Ditolak" (warna merah)
     - `cancelled` $\rightarrow$ "Dibatalkan" (warna abu-abu)
     - `converted_to_order` $\rightarrow$ "Sudah Menjadi Order" (warna hijau)
   - **Empty state**: Menampilkan banner visual katering kosong jika belum ada pengajuan dengan CTA tombol menuju `/katalog`.
   - **Loading & Error states**: Dilengkapi dengan spinner loading dan dialog tombol muat ulang data jika koneksi gagal.
   - **CTA Action**: Jika request sudah dikonversi menjadi order resmi, menyediakan tombol langsung menuju ke pesanan resmi (`/dashboard/orders`).
2. **Backend API Endpoints**:
   - `GET /api/package-requests` memproses permintaan pengambilan daftar request dengan filter `userId`.
   - `POST /api/package-requests` memproses pembuatan request baru.
   - `POST /api/package-requests/[id]/convert` memproses konversi request dengan status `quoted` menjadi order katering aktif (akses dibatasi untuk role `ADMIN` dan `CS`).
   - `PATCH /api/package-requests/[id]/status` memperbarui status review request paket.
3. **Database & Repository Logic**:
   - Tabel `package_requests` menyimpan properti pengajuan (pax, location, notes, status, admin_note, estimated_price, reviewed_at, converted_order_id).
   - `listPackageRequestRecords` memuat dan memilah data berdasarkan parameter `userId`.
   - `linkPackageRequestToOrderRecord` memutasi status request menjadi `'converted_to_order'` serta mengikat ID pesanan hasil konversi (`converted_order_id`).

## Technical Relations & Flow Map

### 1. Request Retrieval Flow
$$\text{Package Requests Page (onMount)} \longrightarrow \text{GET /api/package-requests?userId=X} \longrightarrow \text{listPackageRequestRecords(userId)} \longrightarrow \text{Kueri SQLite} \longrightarrow \text{Render Cards}$$

### 2. Request Review to Order Conversion Flow
$$\text{Admin / CS Action} \longrightarrow \text{POST /api/package-requests/[id]/convert} \longrightarrow \text{createOrder(orderPayload)} \longrightarrow \text{linkPackageRequestToOrderRecord} \longrightarrow \text{Update status to 'converted\_to\_order'}$$

## Authorization & Ownership Notes
- **User Ownership Guard**: Endpoint GET `/api/package-requests` memeriksa hak akses. Jika akun memiliki role `CUSTOMER`, maka query `userId` harus dikirimkan dan nilainya harus sama dengan ID pengguna pada cookie session token. Jika melanggar, server mengembalikan status **403 Forbidden**.
- **Admin/CS Action Limits**: Endpoint konversi (`/api/package-requests/[id]/convert`) dilindungi otorisasi role secara ketat (`requireRole(cookies, ['ADMIN', 'CS'])`). Pengguna dengan role `CUSTOMER` tidak dapat memicu konversi ini secara langsung.

## Integration Notes
- **F10 — Customer Orders**: Berelasi ketika request sukses dikonversi menjadi order resmi. Tombol CTA di halaman F12 akan merujuk langsung ke halaman detail pesanan F10 (`/dashboard/orders`).
- **F08 — Package Request**: Pengisian form request paket oleh customer di halaman publik melahirkan entitas awal database yang ditampilkan di halaman F12 ini.
- **F33 — SQLite Foundation**: Memakai skema dinamis yang ditambal via `ensurePackageRequestReviewColumns` untuk mendukung kolom peninjauan tambahan.

## Known Gaps (Needs Audit / Validation)
- **Hardcoded Hold CTA for Customer**: Customer hanya dapat melihat tombol convert ter-disable (`Convert ke Order (Hold)`) karena alur konversi diatur sepenuhnya dari dashboard admin/CS, namun microcopy-nya berbau simulasi developer.
- **No Real-Time Status Update**: Halaman riwayat request paket bersifat statis pasca dimuat pertama kali; perubahan status kualifikasi/harga oleh admin tidak terupdate secara instan tanpa refresh halaman manual.
- **SQLite Schema Alter Column Checks**: Repository layer menjalankan fungsi pengecekan kolom tabel (`ensurePackageRequestReviewColumns`) pada setiap kueri baca/tulis yang kurang efisien dibanding migrasi schema eksplisit saat startup aplikasi.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
