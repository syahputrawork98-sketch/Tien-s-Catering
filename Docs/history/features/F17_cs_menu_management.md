# F17 — CS Menu Management

## Feature ID
F17

## Feature Name
CS Menu Management

## Status
Partially Found / Needs Follow-up Audit

## Scope
- Manajemen menu harian oleh Customer Service (CS) di dashboard.
- Fitur penayangan daftar menu harian dan riwayat menu.
- Aksi toggle ketersediaan menu (availability), penambahan menu baru, dan pengeditan menu.
- Penyajian ringkasan statistik ketersediaan menu (total menu, aktif hari ini, tersedia, habis).

## Files Inspected
- `apps/src/routes/dashboard/cs/menu/+page.svelte` (UI Halaman Kelola Menu Harian)
- `apps/src/lib/config/navigation.ts` (Registrasi Menu Sidebar)
- `apps/src/routes/api/menus/+server.ts` (API Get Menus - Read Only)
- `apps/src/lib/server/services/menuService.ts` (Service Logika Menu - Read Only)
- `apps/src/lib/server/repositories/menuRepository.ts` (Repository SQLite Menu - Read Only)
- `apps/src/lib/server/db/schema.ts` (Skema Tabel SQLite `menus` dan `menu_daily_stock`)
- `apps/src/lib/mock/audit.ts` (Data Mock Audit Log)
- `apps/src/routes/dashboard/admin/audit/+page.svelte` (Halaman Monitor Audit Admin)

## Feature Evidence Found

### UI Evidence
- Halaman utama CS Menu Management terletak di `apps/src/routes/dashboard/cs/menu/+page.svelte` dengan judul **"Kelola Menu Harian"**.
- Terdapat tombol **"Tambah Menu Baru"** untuk membuka modal form tambah menu.
- Menyediakan tab penyaringan data: **"Menu Hari Ini"** dan **"History Menu"**.
- Menampilkan ringkasan statistik ketersediaan menu: *Total Menu*, *Menu Hari Ini*, *Tersedia*, dan *Habis*.
- Terdapat layout grid menu yang menampilkan gambar, nama menu, kategori, harga, status ketersediaan, sisa stok, serta tombol aksi **"Detail"**, **"Edit"**, dan tombol *toggle switch* ketersediaan (*availability*).
- Modal add/edit menu memuat formulir input lengkap: Nama Menu, Kategori, Harga, Tanggal Aktif, Status Ketersediaan, Label Stok, Deskripsi, dan URL Gambar.
- Saat ini halaman ini berjalan sepenuhnya menggunakan data statis lokal dari `mockCsMenus`, bukan dari integrasi API atau database.

### Route Evidence
- Rute `/dashboard/cs/menu` terdaftar secara fisik di codebase melalui keberadaan berkas `apps/src/routes/dashboard/cs/menu/+page.svelte`.

### Navigation Evidence
- Pada berkas `apps/src/lib/config/navigation.ts`, navigasi peran CS (Customer Service) memiliki item **"Kelola Menu"** dengan `href: '/dashboard/cs/menu'` dan deskripsi *"Posting dan update menu harian"*.
- Layout dashboard (`+layout.svelte`) memuat menu navigasi secara dinamis sesuai role yang aktif pada pengguna.

### Server/API Evidence
- Endpoint `GET /api/menus` ditemukan pada `apps/src/routes/api/menus/+server.ts` yang melayani pengambilan data menu (read-only) dengan memanggil fungsi `getReadOnlyMenus()`.
- Tidak ditemukan handler untuk `POST`, `PATCH`, atau `DELETE` pada rute `/api/menus` maupun endpoint lain untuk memodifikasi data menu oleh CS.
- `apps/src/lib/server/services/menuService.ts` hanya menyediakan method pembacaan menu seperti `getReadOnlyMenus()`.
- `apps/src/lib/server/repositories/menuRepository.ts` hanya memiliki query pembacaan menu dan relasi `menu_daily_stock`. Tidak ditemukan method write/update untuk memodifikasi status menu, stok, atau data menu.

### Database Evidence
- Skema database di `apps/src/lib/server/db/schema.ts` telah mendefinisikan tabel relasional menu:
  - **Tabel `menus`**: Menyimpan data dasar menu (`id`, `name`, `description`, `category`, `base_price`, `image`, `status`).
  - **Tabel `menu_daily_stock`**: Menyimpan relasi stok harian menu (`menu_id`, `active_date`, `daily_stock`, `remaining_stock`, `stock_label`, `status`).
  - Repository SQLite yang ada melakukan join `menu_daily_stock` dengan `menus`, tetapi baru dimanfaatkan untuk API baca-saja (*read-only*).

### Auth/Role Evidence
- Layout dashboard memiliki validasi peran di sisi client (*client-side role redirect*).
- Endpoint `GET /api/menus` bersifat publik/read-only dan tidak menggunakan pengaman backend `requireAuth` atau `requireRole`.
- Tidak ditemukan endpoint mutasi (write) untuk menu atau stok yang dilindungi oleh otorisasi backend `requireRole(['ADMIN', 'CS'])`.

### Audit Log Evidence
- Berkas mock `apps/src/lib/mock/audit.ts` berisi daftar riwayat audit simulasi UI-only, termasuk log aktivitas CS terkait modifikasi menu. Namun, data ini murni statis.
- Halaman `apps/src/routes/dashboard/admin/audit/+page.svelte` mengambil data tersebut dari `mockAuditLogs`. Belum ada fungsionalitas pencatatan log audit riil yang terhubung ke database backend untuk mencatat aksi CS Menu Management.

## Current Implementation Summary
Fitur F17 baru terimplementasi sebagian (*Partially Found*). Sisi antarmuka (UI) di `/dashboard/cs/menu` sudah cukup lengkap dengan komponen visual untuk daftar menu harian, modal tambah/edit menu, visualisasi statistik, serta toggle ketersediaan menu. Namun, seluruh interaksi UI tersebut masih bersifat simulasi lokal (*mock-driven*) menggunakan array statis `mockCsMenus`. Aksi penambahan menu, edit menu, dan toggle ketersediaan hanya memutasi state lokal frontend tanpa melakukan `fetch` ke server, tanpa persistensi ke database SQLite, dan tanpa memicu audit log sistem yang sesungguhnya. Infrastruktur database dan API backend read-only untuk menu memang sudah ada, tetapi write API pendukung perubahan menu untuk CS sama sekali belum diimplementasikan.

## Functional Flow Observed
1. **Pemuatan Halaman Kelola Menu**: CS membuka rute `/dashboard/cs/menu` $\rightarrow$ frontend memuat array data dari `mockCsMenus` secara lokal $\rightarrow$ merender daftar menu dan ringkasan statistik ke layar (tanpa memanggil `GET /api/menus`).
2. **Toggle Availability / Tambah & Edit Menu**: CS berinteraksi dengan menekan toggle switch atau mengisi formulir tambah/edit $\rightarrow$ frontend melakukan mutasi langsung pada array lokal `mockCsMenus` $\rightarrow$ menampilkan notifikasi keberhasilan (*alert*) tiruan di layar $\rightarrow$ data hilang setelah halaman di-refresh.

## Gaps / Missing Parts
1. **Sumber Data Mock (Statis)**: Halaman CS menu masih menggunakan mock/local state, belum terhubung ke API backend `GET /api/menus` atau database SQLite.
2. **Aksi Tulis Tidak Persist (Write Actions)**: Aksi toggle ketersediaan, add menu, dan edit menu hanya mengubah array lokal frontend dan tidak tersimpan ke database.
3. **Ketiadaan API Write Endpoint**: Tidak ditemukan endpoint API `POST`, `PATCH`, atau `DELETE` pada `/api/menus` untuk menangani pembaharuan menu, stok, atau status ketersediaan oleh CS.
4. **Ketiadaan Pengaman Backend**: Tidak ada role guard backend untuk mengamankan operasi penulisan/modifikasi data menu oleh CS.
5. **Ketiadaan Validasi Backend**: Tidak terdapat validasi backend untuk memverifikasi input menu baru/edit, batas stok harian (*daily stock limit*), konsistensi sisa stok (*remaining stock*), nilai enum status, maupun batasan izin akses.
6. **Ketiadaan Repositori Modifikasi**: Tabel `menus` dan `menu_daily_stock` sudah terdefinisi, namun class repositori backend hanya menyediakan fungsi pembacaan data.
7. **Simulasi Audit Log**: Tidak ada pencatatan audit log nyata ke database untuk setiap aktivitas perubahan menu yang dilakukan oleh CS.
8. **Perbedaan Otoritas CS vs Admin**: Belum ada perbedaan batasan akses modifikasi menu antara peran CS dan Admin di sisi backend.
9. **Feedback API**: Respon notifikasi sukses/gagal di UI masih berupa simulasi alert frontend murni dan belum berdasarkan respon server API yang sesungguhnya.
10. **Tanggal Hari Ini Hardcoded**: Konstanta `TODAY = '2026-05-06'` masih berupa nilai statis di frontend, menyebabkan penyaringan menu hari ini tidak mengikuti tanggal berjalan sistem (*runtime date*).

## Risk Notes
- **Kehilangan Data**: Perubahan menu dan ketersediaan yang dilakukan oleh CS akan langsung hilang begitu halaman dimuat ulang.
- **Inkonsistensi Data Pemesanan**: Perubahan status ketersediaan menu di UI CS tidak sinkron dengan data menu di SQLite yang diakses oleh customer saat checkout (F05), berpotensi menyebabkan customer memesan menu yang seharusnya tidak tersedia atau sebaliknya.

## Suggested Status
**Partially Found / Needs Follow-up Audit** (Karena kerangka UI dan struktur database dasarnya sudah ada, namun integrasi API write, otorisasi backend, dan persistensi database SQLite belum terimplementasi sama sekali).

## Recommendation / Next Step
1. Implementasikan endpoint write di API backend (`POST /api/menus` untuk tambah menu, `PATCH /api/menus/[id]` untuk edit menu/status ketersediaan, dan `PATCH /api/menus/[id]/stock` untuk update stok harian).
2. Terapkan middleware `requireRole(cookies, ['ADMIN', 'CS'])` pada endpoint write baru tersebut untuk keamanan.
3. Buat metode penulisan data baru (insert, update, delete) pada `menuRepository.ts` dan `menuService.ts` untuk memanipulasi tabel `menus` dan `menu_daily_stock` di SQLite.
4. Hubungkan UI halaman `/dashboard/cs/menu` agar memanggil API backend riil (melakukan `fetch` data menu aktif dan mengirimkan payload formulir ke API write).
5. Ganti nilai tanggal dinamis `TODAY` di frontend agar didasarkan pada tanggal sistem saat runtime, bukan hardcoded.
6. Hubungkan pencatatan aktivitas CS ke modul audit log riil di backend.
