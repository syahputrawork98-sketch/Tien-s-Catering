# F18 — CS Package Management

## Feature ID
F18

## Feature Name
CS Package Management

## Status
Partially Found / Needs Follow-up Audit

## Scope
- Manajemen paket catering oleh Customer Service (CS) di dashboard.
- Fitur penayangan daftar paket catering berdasarkan kategori layanan.
- Aksi pembuatan paket baru, pengeditan paket, dan toggle status aktif/nonaktif paket.
- Penyajian ringkasan statistik paket catering (total paket, paket aktif, nonaktif, dan kategori aktif).
- Pengamanan akses dan operasi penulisan paket berdasarkan role.

## Files Inspected
- `apps/src/routes/dashboard/cs/packages/+page.svelte` (UI Halaman Kelola Paket Catering CS)
- `apps/src/lib/config/navigation.ts` (Registrasi Menu Sidebar)
- `apps/src/routes/api/packages/+server.ts` (API List & Create Package)
- `apps/src/routes/api/packages/[id]/+server.ts` (API Update Package)
- `apps/src/routes/api/packages/[id]/status/+server.ts` (API Update Status Package)
- `apps/src/lib/server/services/packageService.ts` (Service Logika Paket)
- `apps/src/lib/server/repositories/packageRepository.ts` (Repository SQLite Paket)
- `apps/src/lib/server/db/schema.ts` (Skema Tabel SQLite `packages`)
- `apps/src/lib/mock/audit.ts` (Data Mock Audit Log)

## Feature Evidence Found

### UI Evidence
- Halaman utama CS Package Management terletak di `apps/src/routes/dashboard/cs/packages/+page.svelte` dengan header **"Kelola Paket Catering"**.
- Terdapat tombol **"Buat Paket Baru"** untuk menampilkan modal form pembuatan paket.
- Merender 4 kartu statistik ringkasan: *Total Paket*, *Paket Aktif*, *Nonaktif*, dan *Kategori Aktif*.
- Terdapat tab filter horizontal untuk menyaring daftar paket berdasarkan kategori layanan.
- Grid paket menampilkan kartu paket lengkap dengan gambar, nama paket, kategori, harga per pax, deskripsi, tombol *toggle status*, tombol **"Detail"**, dan tombol **"Edit Paket"**.
- Modal detail paket menampilkan rincian: Nama Paket, Kategori, Deskripsi, Harga Mulai Dari, Minimal Pax, dan tombol **"Edit Paket Ini"**.
- Modal add/edit paket memuat field: Nama Paket, Kategori Paket, Harga Mulai Dari, Minimal Pax, Deskripsi, dan URL Gambar.
- Halaman CS ini saat ini berjalan sepenuhnya menggunakan data statis lokal dari `mockCatalogPackages` dan `mockPackageCategories`, bukan dari integrasi API atau database SQLite langsung.

### Route Evidence
- Rute `/dashboard/cs/packages` terdaftar di codebase melalui keberadaan berkas `apps/src/routes/dashboard/cs/packages/+page.svelte`.

### Navigation Evidence
- Pada berkas `apps/src/lib/config/navigation.ts`, navigasi peran CS (Customer Service) memiliki item **"Kelola Paket"** dengan `href: '/dashboard/cs/packages'` dan deskripsi *"Kelola paket catering dan kategori layanan"*.
- Sebagai perbandingan, navigasi Admin juga memiliki item **"Paket"** yang mengarah ke `/dashboard/admin/packages`.

### Server/API Evidence
- Endpoint API backend pendukung pengelolaan paket telah diimplementasikan:
  - `GET /api/packages` untuk mengambil seluruh daftar paket.
  - `POST /api/packages` untuk membuat paket catering baru.
  - `PATCH /api/packages/[id]` untuk memperbarui rincian data paket.
  - `PATCH /api/packages/[id]/status` untuk mengubah status aktif/ketersediaan paket.

### Database Evidence
- Skema database di `apps/src/lib/server/db/schema.ts` mendefinisikan tabel:
  - **Tabel `packages`**: Menyimpan detail paket (`id`, `name`, `slug`, `description`, `category`, `package_category`, `base_price`, `image`, `images_json`, `min_pax`, `package_items_json`, `features_json`, `suitable_for_json`, `status`, `is_active`, `is_available`, `created_at`, `updated_at`).
- `apps/src/lib/server/services/packageService.ts` dan `apps/src/lib/server/repositories/packageRepository.ts` telah diimplementasikan dengan method pembacaan dan penulisan:
  - `listPackageRecords`, `createPackageRecord`, `updatePackageRecord`, dan `updatePackageRecordStatus`.
  - Kueri insert dan update tersebut benar-benar melakukan operasi penulisan data ke dalam tabel `packages` SQLite.

### Auth/Role Evidence
- Endpoint mutasi (write) paket dilindungi di sisi backend menggunakan role guard:
  - `POST /api/packages`, `PATCH /api/packages/[id]`, dan `PATCH /api/packages/[id]/status` memanggil fungsi pengaman `requireRole(cookies, ['ADMIN', 'CS'])`.
  - Hal ini secara teoritis mengizinkan CS maupun Admin untuk melakukan operasi penulisan pada database paket katering.

### Audit Log Evidence
- Berkas `apps/src/lib/mock/audit.ts` mendefinisikan mock log untuk target type `package`, namun data ini murni statis untuk keperluan demo UI dan belum terintegrasi ke SQLite backend. Tidak ada audit log riil yang tercatat dari halaman CS packages ke database.

### Layout/Responsiveness Evidence
- Tab navigasi kategori paket menggunakan CSS flex layout dengan `overflow-x-auto`, `no-scrollbar`, `w-max`, dan gradient hints agar ramah terhadap layar kecil.
- Grid paket menggunakan Tailwind responsive utility `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` yang tersusun rapi di berbagai ukuran viewport.
- Terdapat potensi overflow/ketidakrapian visual pada viewport mobile (layar kecil) pada modal form add/edit karena penggunaan class `col-span-2` di beberapa elemen input tanpa pembagian varian responsive.

## Current Implementation Summary
Fitur F18 berada dalam status **Partially Found / Needs Follow-up Audit**. Infrastruktur backend sudah sangat matang: tabel `packages` di SQLite tersedia, service dan repository telah mendukung logika manipulasi data (insert/update), serta endpoint API `POST`, `PATCH`, dan `PATCH status` sudah siap dengan proteksi role guard `ADMIN` dan `CS`. Namun, di sisi frontend, halaman CS package management (`/dashboard/cs/packages/+page.svelte`) masih diimplementasikan sebagai simulasi murni (*mock-driven*) menggunakan data lokal `mockCatalogPackages` dan `mockPackageCategories`. Tombol tambah paket, edit, dan toggle status hanya memutasi array lokal frontend dan tidak mengirimkan permintaan API HTTP apapun ke endpoint backend yang sebenarnya telah disediakan.

## Functional Flow Observed
1. **Pemuatan Daftar Paket**: CS membuka halaman `/dashboard/cs/packages` $\rightarrow$ frontend memuat array data dari `mockCatalogPackages` secara lokal $\rightarrow$ merender visual grid paket dan data statistik tanpa memanggil `GET /api/packages`.
2. **Tambah/Edit/Toggle Paket**: CS menekan tombol aksi $\rightarrow$ frontend memutasi array state lokal `mockCatalogPackages` $\rightarrow$ memicu alert notifikasi sukses tiruan secara langsung di browser $\rightarrow$ perubahan hilang saat halaman di-refresh.

## Gaps / Missing Parts
1. **Frontend Mock-Driven**: Halaman CS packages masih memuat data statis dari `mockCatalogPackages`, bukan memanggil API `GET /api/packages`.
2. **Ketiadaan Integrasi API Write di UI**: Tombol tambah paket tidak memanggil `POST /api/packages`, tombol edit tidak memanggil `PATCH /api/packages/[id]`, dan tombol toggle status tidak memanggil `PATCH /api/packages/[id]/status`.
3. **Ketiadaan Aksi Penghapusan (Delete)**: Tidak ditemukan opsi hapus paket (*delete package*) di antarmuka CS maupun endpoint API khusus penghapusan paket.
4. **Audit Log Simulasi**: Pencatatan aktivitas pembuatan/perubahan paket oleh CS belum terhubung ke database backend (masih menggunakan berkas mock statis).
5. **Konfigurasi Kategori Statis**: Pilihan kategori paket di UI masih menggunakan konstanta `mockPackageCategories` di frontend daripada mengambil daftar kategori secara dinamis dari database.
6. **Kebijakan Otoritas CS vs Admin**: Batasan hak akses bisnis antara CS dan Admin untuk manajemen paket belum terdefinisi secara jelas di backend (kedua role memiliki akses penuh pada API penulisan).
7. **Potensi Masalah Layout Mobile**: Beberapa elemen input form pada modal add/edit memakai layout `col-span-2` secara statis, yang dapat menyebabkan form terlihat terlalu sempit atau rusak pada layar smartphone.

## Risk Notes
- **Inkonsistensi Menu & Paket**: Jika CS menambahkan paket baru secara lokal, ia akan mengira paket tersebut sudah aktif di katalog katering, padahal data tersebut tidak pernah tersimpan di database dan tidak akan pernah tampil di halaman pemesanan paket customer (F07).
- **Kerusakan UI Form**: Layout modal form yang kurang responsive dapat menyulitkan CS melakukan input data apabila mengakses dashboard dari perangkat mobile atau tablet.

## Suggested Status
**Partially Found / Needs Follow-up Audit** (Infrastruktur backend, database schema, service/repository, dan API endpoint write sudah lengkap dan siap pakai, tetapi antarmuka CS UI belum terhubung ke backend tersebut dan masih berjalan menggunakan visual simulasi murni).

## Recommendation / Next Step
1. Integrasikan halaman `/dashboard/cs/packages/+page.svelte` agar memanggil API `GET /api/packages` saat inisialisasi halaman.
2. Hubungkan fungsi kirim form tambah paket ke `POST /api/packages` dan form edit ke `PATCH /api/packages/[id]`.
3. Hubungkan interaksi toggle switch status paket ke `PATCH /api/packages/[id]/status`.
4. Perbaiki layout modal form tambah/edit paket agar lebih responsif terhadap viewport mobile (misal dengan mengubah `col-span-2` menjadi `col-span-1` pada ukuran layar di bawah `md`).
5. Jalankan validasi end-to-end setelah integrasi frontend-backend selesai dilakukan.
