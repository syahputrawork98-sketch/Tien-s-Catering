# F20 — Audit Progress & App Normalization Planning

## Feature ID
F20

## Feature Name
Audit Progress & App Normalization Planning

## Original Feature Name / Previous Label
Admin Overview / Operational Monitor

## Status
Audit Checkpoint / HOLD for Normalization

## Scope
- Evaluasi kumulatif hasil audit fitur F02–F19.
- Identifikasi pola besar (*key patterns*) dari temuan audit di seluruh layer (UI, API, SQLite DB, Auth, Simulasi, Audit Log).
- Penyusunan rekomendasi strategi transisi fase proyek.
- Pendefinisian peta jalan normalisasi aplikasi (*Application Normalization Tracks*) untuk menghubungkan visual mock frontend ke backend nyata.

## Project Position After F19
Hingga audit F19 diselesaikan, posisi status pemetaan fitur di dalam proyek katering (TC) adalah sebagai berikut:
- **F00–F01**: `Completed` (Fondasi metodologi dan kerangka kerja dokumentasi).
- **F02–F16**: `Found / Needs Functional Validation` (Fitur terdeteksi di codebase dengan backend/SQLite pendukung, namun butuh uji runtime).
- **F17–F19**: `Partially Found / Needs Follow-up Audit` (Kerangka UI lengkap namun interaksinya masih murni mock/local state di frontend tanpa persistensi backend SQLite riil).
- **F20**: `Audit Checkpoint / HOLD for Normalization` (Audit detail ditahan sementara untuk perencanaan normalisasi).
- **F21–F34**: `Discovered / Needs Audit` / `HOLD` (Status diidentifikasi dari penelusuran struktur rute, namun pengerjaan audit detailnya ditahan).

## Key Patterns Found

### Frontend/UI
- Sebagian besar rute halaman dan komponen antarmuka pengguna (UI) sudah terbangun dengan visual yang cukup matang dan lengkap.
- Fitur CS (Customer Service) memiliki UI lengkap:
  - F17 (Menu) memiliki daftar menu harian, modal tambah/edit, filter riwayat, dan panel statistik ketersediaan.
  - F18 (Package) memiliki daftar paket catering, tab kategori layanan, modal detail, modal tambah/edit, dan tombol toggle status.
  - F19 (Customer) memiliki tabel data customer, tombol pintas chat WhatsApp, modal detail verifikasi, dan form pendaftaran manual.
- Meskipun antarmuka ini secara estetika siap, bagian logika interaksi di F17–F19 masih terikat sepenuhnya ke memori lokal browser (*mock/local state*).

### Backend/API
- API transaksional utama pada F16 (Orders) relatif kuat: `GET /api/orders`, `PATCH /api/orders/[id]/status`, `PATCH /api/orders/[id]/payment-status`, dan `POST /api/orders/[id]/verify-payment` sudah tersedia di sisi server.
- F17 baru menyediakan endpoint pembacaan menu satu arah (`GET /api/menus` read-only).
- F18 memiliki backend API yang cukup lengkap (`GET`, `POST`, `PATCH`, `PATCH status` untuk paket katering), namun halaman UI CS di frontend belum melakukan pemanggilan (*fetch*) ke endpoint-endpoint tersebut.
- F19 sama sekali belum memiliki API endpoint khusus manajemen data customer/users untuk CS. API user saat ini hanya rute personal `/api/auth/me`.

### SQLite/Database
- Skema dasar database SQLite (`db/schema.ts`) telah dikonfigurasi, tetapi ketersediaan kolomnya belum selalu selaras dengan kebutuhan alur kerja UI.
- F16 (Orders) terintegrasi dengan tabel-tabel utama (`orders`, `delivery_info`, `payment_info`, `order_items`, `order_payment_proofs`).
- F17 (Menu) memiliki tabel database `menus` dan `menu_daily_stock`, namun kode repository backend baru memfasilitasi kueri pembacaan (*read query*).
- F18 (Package) memiliki tabel `packages` lengkap dengan method penulisan repositori (*write query*).
- F19 (Customer) hanya memiliki skema tabel `users` dasar. Kolom CRM dan status approval seperti `registrationStatus`, `accountType`, `approvedBy`, `internalNote`, `totalOrders`, dan `lastOrderDate` belum tersedia di tabel produksi SQLite.

### Auth/Role Guard
- Penerapan otorisasi backend (*role guard*) masih belum merata.
- API transaksi pesanan (F16) dan penulisan paket (F18) dilindungi dengan middleware backend `requireRole(cookies, ['ADMIN', 'CS'])` secara aman.
- F17 belum memiliki endpoint write untuk menu harian sehingga belum ada role guard terkait.
- F19 tidak memiliki role guard backend CRM karena rute API customer management CS belum dibuat.
- Batasan dan pemisahan hak akses operasional (business rules) antara role CS dan role Admin belum diimplementasikan dengan jelas di backend.

### Mock/Simulation
- Penggunaan mock/local state di memori browser merupakan temuan masalah terbesar.
- Pada F17, F18, dan F19, manipulasi data (tambah menu, toggle ketersediaan, edit paket, approval pendaftaran customer) hanya berjalan di memori frontend secara sementara dan langsung hilang ketika halaman di-refresh.
- Pada F16 yang sudah terhubung backend, beberapa aksi tombol penting (penolakan bukti bayar, konfirmasi penyelesaian, penyimpanan alasan pembatalan) masih berupa tiruan statis atau alert simulasi murni.

### Audit Log
- Fungsionalitas pencatatan log aktivitas sistem (audit log) belum terbukti terintegrasi ke SQLite backend.
- Halaman monitor admin mengambil data statis dari berkas mock lokal `apps/src/lib/mock/audit.ts` (simulasi UI-only).

### Documentation
- Dokumentasi F-number telah tersusun secara terstruktur.
- Setiap dokumen secara konsisten bersikap objektif dan tidak menandai fitur existing sebagai *Completed* sebelum dilakukan validasi runtime fungsionalitas end-to-end secara ketat.

## Why Continue Full Audit May Be Inefficient
Melanjutkan audit detail F21–F34 di bawah mode *Feature Discovery* biasa dianggap kurang efisien karena:
1. **Perulangan Pola Masalah**: Temuan audit berikutnya kemungkinan besar hanya akan mendokumentasikan pola masalah yang sama (UI visual ada, API backend sebagian ada/mock, dan SQLite belum terintegrasi).
2. **Penumpukan Utang Normalisasi**: Menumpuk scope audit tanpa memulai integrasi riil akan menyulitkan estimasi pengerjaan normalisasi dan meningkatkan risiko desinkronisasi codebase.
3. **Optimasi Waktu & Biaya**: Memindahkan fokus ke perencanaan normalisasi memberikan kejelasan roadmap pengembangan yang dapat langsung dieksekusi untuk menaikkan status fitur menjadi Completed.

## Recommended Transition
Fase proyek direkomendasikan bergeser:
- **Dari**: `Feature Discovery / Existing Project Audit`
- **Menuju**: `Feature Discovery Checkpoint / Pre-Normalization Planning`

Setelah rencana normalisasi disetujui, proyek dapat naik ke fase: `Application Normalization / Functional Integration`.

## Recommended Normalization Tracks

### Track A — Mock-to-API Integration
Menghubungkan visual UI frontend yang sudah ada ke endpoint API backend riil. Prioritas awal adalah menghubungkan halaman kelola menu harian (F17), kelola paket catering (F18), dan verifikasi pendaftaran instansi (F19) agar memproses data backend riil.

### Track B — Backend/API Completion
Melengkapi rute API yang belum ada di backend. Prioritas utama mencakup pembuatan endpoint tulis/ubah menu dan stok harian (F17), serta pembuatan API customer list & verifikasi status registrasi (F19).

### Track C — SQLite Schema Normalization
Menyelaraskan skema database SQLite agar dapat menampung parameter bisnis. Prioritas utama adalah menambahkan kolom CRM/approval di tabel `users` (F19), kolom log audit riil, serta menjamin integritas relasional data order.

### Track D — Role Guard & Permission Normalization
Memastikan seluruh API write-actions dilindungi middleware backend `requireRole` yang tepat dan memisahkan batasan otorisasi menu/order antara CS dan Admin secara tegas.

### Track E — Dev Persona Switcher Review
Memisahkan visual dan logika mode simulasi/persona lokal dengan mode otorisasi produksi, memastikan tidak ada kerancuan informasi penyimpanan data pada visual antarmuka pengguna.

### Track F — Audit Log & Operational History
Mengganti modul log audit statis menjadi sistem pencatatan dinamis ke database SQLite untuk melacak riwayat krusial: status transaksi, hasil verifikasi pembayaran, perubahan menu/stok, manipulasi paket, dan penanganan akun customer.

### Track G — Functional Validation & QA
Penyusunan daftar uji runtime (*functional validation QA*) end-to-end berdasarkan peran pengguna (customer, CS, admin) untuk memastikan tidak ada logika simulasi yang lolos ke produksi.

## Suggested Priority After F20
1. Normalisasi sistem otentikasi, sesi cookie, dan perapian visual dev persona.
2. Sinkronisasi alur order dan pembayaran di CS Orders (F16) secara end-to-end.
3. Integrasi antarmuka CS menu/package/customer ke API backend.
4. Pembuatan backend write API untuk menu dan data customer.
5. Ekstensi skema kolom SQLite (tabel `users` CRM).
6. Implementasi database audit log riil.
7. Pelaksanaan Functional Validation flow.
8. Melanjutkan audit F21–F34 jika diperlukan di kemudian hari.

## Risk Notes
- **Risiko Status Semu (False Completed)**: Menilai fitur selesai hanya karena tampilannya berfungsi normal secara visual, padahal data tidak tersimpan di server.
- **Kerumitan Migrasi DB**: Penambahan kolom CRM pada tabel `users` produksi SQLite harus dirancang dengan migrasi data default agar tidak merusak relasi otentikasi login pengguna yang sudah ada di database lokal.

## Suggested F20 Status
**Audit Checkpoint / HOLD for Normalization** (Dokumentasi audit detail ditangguhkan sementara guna memfokuskan pengerjaan pada penyusunan Application Normalization Roadmap).

## Recommendation / Next Step
1. Dapatkan persetujuan dari pengguna mengenai roadmap transisi pre-normalisasi katering ini.
2. Buat dokumen master perencanaan integrasi fungsional (*Normalization Roadmap Document*) sebagai langkah awal implementasi.
3. Tahan sementara pengerjaan penulisan dokumen detail audit untuk fitur F21–F34.
