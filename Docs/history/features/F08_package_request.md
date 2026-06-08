# F08 — Package Request

## Feature Type
Customer / Admin

## Discovery Source
- **Components**: [PackageDetailModal.svelte](apps/src/lib/components/PackageDetailModal.svelte) *(Form submission)*
- **Dashboard Routes**: 
  - [+page.svelte](apps/src/routes/dashboard/package-requests/+page.svelte) *(Customer tracking)*
  - [+page.svelte](apps/src/routes/dashboard/admin/package-requests/+page.svelte) *(Admin review & conversion)*
- **API Endpoints**: 
  - [+server.ts](apps/src/routes/api/package-requests/+server.ts) *(GET/POST)*
  - [+server.ts](apps/src/routes/api/package-requests/[id]/status/+server.ts) *(PATCH status review)*
  - [+server.ts](apps/src/routes/api/package-requests/[id]/convert/+server.ts) *(POST order conversion)*
- **Service & Repository**: 
  - [packageRequestService.ts](apps/src/lib/server/services/packageRequestService.ts)
  - [packageRequestRepository.ts](apps/src/lib/server/repositories/packageRequestRepository.ts)
- **Database Tables**: `package_requests` in [schema.ts](apps/src/lib/server/db/schema.ts)

## Current Status
Found / Needs Functional Validation

## Technical Findings & Audit Summary

### 1. Request Entry Point
- **Entry Point**: Form pengajuan request paket catering (F08) ditanam (*embedded*) langsung di dalam modal detail paket katering [PackageDetailModal.svelte](apps/src/lib/components/PackageDetailModal.svelte) yang dipicu dari katalog paket katering [+page.svelte](apps/src/routes/paket-catering/+page.svelte) (F07).
- **Context Injection**: Modal membawa parameter konteks `packageId` dan `packageName` secara otomatis dari objek katering terpilih (`pkg.id` dan `pkg.name`).
- **Independent Route**: Tidak ada rute pengajuan request mandiri (harus memilih paket katering terlebih dahulu).

### 2. Frontend Form Structure
- **Input Fields**:
  - **Nama Pemesan** (`customerName`): Input text, wajib diisi.
  - **WhatsApp** (`whatsapp`): Input tel, wajib diisi.
  - **Tanggal Acara** (`eventDate`): Input date, wajib diisi. Diberikan batas minimum `min` berupa tanggal hari ini (`minEventDate`).
  - **Jumlah Pax** (`pax`): Input number, wajib diisi. Diberikan batas minimum secara dinamis berdasarkan `pkg.minPax || 1`.
  - **Lokasi/Acara** (`eventLocation`): Input text, wajib diisi.
  - **Catatan Kebutuhan** (`specialNotes`): Textarea, wajib diisi (dengan instruksi menulis `-` jika tidak ada).
- **Feedback States**:
  - **Loading**: Tombol submit dinonaktifkan (`disabled={isSubmitting}`) dan teks berubah menjadi `"Mengirim Request..."` saat `isSubmitting` aktif.
  - **Error Display**: Menampilkan pesan validasi lokal via alert warna Amber (`validationError`) dan error respons API via alert warna Red (`submitError`).
  - **Success State**: Form disembunyikan dan diganti dengan panel sukses berwarna Emerald yang merender informasi nomor request unik, tanggal acara, jumlah pax, dan rincian data tersimpan.

### 3. Frontend Validation
- **Required check**: Validasi native HTML `required` dan pengecekan ganda via logika JavaScript di `validateRequest()`.
- **Pax Validation**: Pengecekan jumlah pax harus lebih besar dari 0 dan minimal memenuhi ketentuan batas paket (`pax >= pkg.minPax`).
- **WhatsApp Validation**: Sanitasi karakter spasi dan strip (`sanitizeWhatsapp()`), lalu dicocokkan dengan ekspresi reguler `/^\+?\d{9,15}$/`.
- **Double Submit Guard**: Tombol submit dinonaktifkan ketika flag `isSubmitting` bernilai `true`.

### 4. Payload Request
- **Payload Format**: POST JSON ke `/api/package-requests` dengan bentuk:
  ```json
  {
    "packageId": "pkg-id",
    "packageName": "Nama Paket",
    "customerName": "Nama Pemesan",
    "whatsapp": "081234567890",
    "eventDate": "YYYY-MM-DD",
    "pax": 100,
    "location": "Lokasi Acara",
    "notes": "Catatan khusus"
  }
  ```
- **Status & Metadata**: Payload tidak membawa data status atau nomor request. Parameter `status` diset otomatis `'new'` di service backend, sedangkan `requestNumber` dibuat oleh repositori backend. Jika user login, session token via cookie digunakan untuk opsional mengaitkan `userId`.

### 5. API/Backend Behavior
- **Endpoints & Methods**:
  - **POST `/api/package-requests`**: Publik (anonymous allowed). Menyimpan data request. Jika `userId` disertakan dalam payload, backend melakukan pengecekan hak akses (harus pemilik akun bersangkutan, kecuali jika diakses oleh role `ADMIN`/`CS`).
  - **GET `/api/package-requests`**: Terproteksi (`requireAuth`). Jika peran user adalah `CUSTOMER`, hanya diizinkan mengambil data milik sendiri (`queryUserId === user.id`), sedangkan role `ADMIN`/`CS` dapat mengambil seluruh data.
  - **PATCH `/api/package-requests/[id]/status`**: Terproteksi (`requireRole(['ADMIN', 'CS'])`). Digunakan untuk memperbarui status review admin (`status`, `adminNote`, `estimatedPrice`).
  - **POST `/api/package-requests/[id]/convert`**: Terproteksi (`requireRole(['ADMIN', 'CS'])`). Digunakan untuk mengonversi request berstatus `'quoted'` menjadi order aktif di tabel `orders` & `order_items`.
- **HTTP Status Codes**:
  - `200 OK`: Sukses GET request, PATCH status, atau POST convert.
  - `201 Created`: Sukses POST request baru.
  - `400 Bad Request`: Payload JSON tidak valid atau kesalahan validasi data.
  - `401 Unauthorized`: Session token hilang atau kedaluwarsa.
  - `403 Forbidden`: Pelanggan mencoba melihat/memanipulasi data di luar hak miliknya.
  - `404 Not Found`: Request paket tidak ditemukan di database SQLite.
  - `500 Internal Server Error`: Kegagalan koneksi atau query database lokal.
- **Throttling/Spam Protection**: Tidak ada rate-limit, captcha, atau pengaman spam submission pada endpoint POST publik.

### 6. Service Validation
- **Payload Parsing**: Validasi dasar struktur payload dilakukan di [packageRequestService.ts](apps/src/lib/server/services/packageRequestService.ts) menggunakan helper `parseCreatePackageRequestPayload`.
- **Database Cross-Check Validation Absence**:
  - **No PackageId Verification**: Server tidak mengecek ke tabel `packages` apakah `packageId` valid atau aktif.
  - **No Min Pax Validation**: Server memercayai jumlah `pax` dari client payload tanpa melakukan pengecekan batas minimum pax paket di database.
  - **No Event Date Verification**: Tanggal acara di masa lampau tidak divalidasi oleh server-side service.
  - **No WhatsApp Check**: WhatsApp tidak divalidasi dengan regex di sisi server (murni percaya pada sanitasi awal dan validasi client-side).
  - **Package Name Tampering Risk**: Backend langsung menggunakan properti `packageName` / `packageNameSnapshot` yang dikirim dari frontend tanpa mencocokkannya ke database, berpotensi dimanipulasi dengan nama kustom ilegal.

### 7. Repository & Database Behavior
- **SQLite Database Table**: Data disimpan di tabel `package_requests` di dalam berkas [schema.ts](apps/src/lib/server/db/schema.ts).
- **Dynamic Schema Checks**: Menggunakan helper `ensurePackageRequestReviewColumns` untuk secara dinamis menambahkan kolom `admin_note`, `estimated_price`, `reviewed_at`, dan `converted_order_id` jika belum terdefinisi di database SQLite.
- **Request Number Generation**: Nomor request dibuat dinamis di repositori menggunakan generator `formatRequestNumberTimestamp(now)` berformat `TPR-YYYYMMDD-HHMMSSmmmXXXX` (di mana XXXX adalah potongan acak dari UUID).
- **Data Integrity / Foreign Key Gaps**: Tidak ada deklarasi constraint `FOREIGN KEY` formal untuk `package_id` ke tabel `packages` dan `user_id` ke tabel `users` pada schema database `package_requests`.
- **Transaction Usage**: Insert data dijalankan langsung menggunakan SQLite statement run biasa tanpa dibungkus transaction (`db.transaction`).

### 8. Admin/CS Integration
- **Admin Dashboard**: Tampil di [+page.svelte](apps/src/routes/dashboard/admin/package-requests/+page.svelte). Admin/CS dapat mencari, memfilter berdasarkan status, serta melakukan aksi review.
- **Actions**: Admin dapat merubah status, memasukkan `adminNote`, dan menetapkan `estimatedPrice`.
- **Conversion Flow**: Bila status diubah menjadi `'quoted'` dan estimasi harga diset > 0, admin dapat menekan tombol "Convert ke Order". Ini memicu POST `/convert` yang memanggil `createOrder()` di `orderService.ts` untuk menyisipkan data ke tabel `orders` & `order_items` dengan `sourceType = 'package_request'`. Status request kemudian di-update menjadi `'converted_to_order'`.
- **Notification Gap**: Perubahan status review atau konversi tidak memicu notifikasi WhatsApp/email otomatis ke pelanggan (pelanggan harus memantau secara manual di dashboard mereka).

### 9. Integration with F07 (Public Package Catering)
- Katalog utama F07 memuat detail modal F08. Jika API `/api/packages` gagal di-load, katalog `/paket-catering` mem-fallback datanya ke `mockCatalogPackages` sehingga fitur pengajuan request modal tetap dapat berjalan stabil menggunakan data mock tersebut.

### 10. Known Gaps & Candidate Fixes
1. **Backend Validation Absence**: Server-side service layer tidak memvalidasi ulang keaslian `packageId` ke database, tidak memverifikasi keaktifan paket, dan tidak memvalidasi ulang batas minimum pax terhadap database master paket (menerima input langsung dari client payload).
2. **Package Name & Pax Tampering Risk**: Backend langsung menggunakan properti `packageName` / `packageNameSnapshot` dan `pax` yang dikirim dari frontend tanpa mencocokkannya ke database, berpotensi dimanipulasi dengan nama kustom ilegal atau pax di bawah batas ketentuan.
3. **Request Spam Risk (Spam Submission Vulnerability)**: Rute POST `/api/package-requests` terbuka secara publik tanpa dilengkapi filter CAPTCHA, spam protection, atau rate-limiting.
4. **Event Date in Past**: Tidak ada pengecekan/validasi di service backend untuk memastikan `eventDate` tidak bernilai di masa lampau (hanya di frontend).
5. **No Double Submit protection on backend**: Backend tidak memproteksi data ganda identik yang dikirim berulang dalam waktu sangat singkat.
6. **Missing Admin Visibility / Notification**: Perubahan status review atau harga oleh admin tidak mengirimkan notifikasi real-time/otomatis (murni visual di dashboard).
7. **No Confirmation / Tracking Link**: Ketiadaan tautan pelacakan status request publik yang bisa dibagikan instan (pelanggan harus login dan membuka dashboard request-nya).
8. **No Foreign Key Constraints**: Tabel `package_requests` tidak memiliki foreign key constraint formal untuk `package_id` ke tabel `packages` dan `user_id` ke tabel `users` di tingkat database.

## Technical Relations & Flow Map

### 1. Request Submission Flow
$$\text{PackageDetailModal.svelte (Form Submit)} \longrightarrow \text{POST /api/package-requests} \longrightarrow \text{packageRequestService.ts} \longrightarrow \text{packageRequestRepository.ts (SQLite insert)}$$

### 2. Admin Review & Pricing Flow
$$\text{Admin Dashboard (/dashboard/admin/package-requests)} \longrightarrow \text{PATCH /status API} \longrightarrow \text{Update status, adminNote, estimatedPrice in DB}$$

### 3. Order Conversion Flow
$$\text{Admin clicks Convert} \longrightarrow \text{POST /convert API} \longrightarrow \text{orderService.ts: createOrder} \longrightarrow \text{Update status to converted\_to\_order}$$

## UI Behaviors Discovered
- **Success Overlay Panel**: Menampilkan nomor request unik dan rincian metadata acara di dalam modal setelah request sukses dikirim.
- **Dynamic Min Pax Alert**: Form secara reaktif memblokir input dan menampilkan alert jika kuantitas pax kurang dari ketentuan paket.

## Do Not Touch Yet
- No implementation, modification, or refactoring in this audit-only task.
