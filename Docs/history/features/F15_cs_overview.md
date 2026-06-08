# F15 — CS Overview

## Feature Type
CS (Customer Service)

## Feature Summary
Fitur **F15 — CS Overview** bertindak sebagai halaman beranda utama (dashboard) untuk peran Customer Service (CS). Halaman ini menyajikan ringkasan statistik operasional bisnis katering dan menyediakan shortcut navigasi ke tugas-tugas pengelolaan CS lainnya.

## Current Status
Found / Needs Functional Validation

## Confirmed Source Paths

### 1. Frontend & UI Paths
* **CS Overview Page**: `apps/src/routes/dashboard/cs/+page.svelte`
* **Layout & Navigation Sidebar**: `apps/src/routes/dashboard/+layout.svelte`
* **Navigation Config**: `apps/src/lib/config/navigation.ts`

### 2. Backend & API Paths
* **API Endpoints**: None (Semua data overview bersifat statis/hardcoded di sisi client).

### 3. Database & Data Model
* **Database Tables**: None (Tidak ada query agregasi database SQLite langsung untuk menghitung data statistik overview saat ini).

## Main CS Overview Flow
1. **Pemuatan Dashboard**:
   $$\text{Akses /dashboard/cs} \longrightarrow \text{Evaluasi canAccess(authStore.user, 'CS')} \longrightarrow \text{Render static mock stats \& shortcuts}$$
2. **Navigasi CS**:
   $$\text{Klik salah satu dari 3 Shortcut Operasional} \longrightarrow \text{Redirect ke halaman pengelola CS yang dituju}$$

## UI States & Action Notes
* **Dev Persona Mode Indication**:
  * Jika diakses menggunakan mode simulasi persona (`tiens_persona_mode` di localStorage), panel info biru *"Dev Persona Mode — Simulasi CS, Bukan Akun Produksi"* akan muncul di bagian atas.
* **Role Guard & Access Denied**:
  * Akses divalidasi menggunakan helper `canAccess(authStore.user, 'CS', isPersonaMode)`.
  * Apabila pengguna tidak memiliki role `CUSTOMER_SERVICE` atau `ADMIN` (misal pengguna dengan role `CUSTOMER` yang mencoba mengetik langsung alamat `/dashboard/cs`), halaman akan menyembunyikan konten overview dan menampilkan pesan *"Akses Ditolak. Area ini hanya tersedia untuk Customer Service atau Admin."* beserta tombol CTA untuk kembali ke dashboard utama.
* **Hardcoded Cards & Summary Widgets**:
  * Halaman ini merender 4 widget stats numerik:
    * **Pesanan Masuk**: `5 New`
    * **Perlu Diproses**: `12 Jobs`
    * **Cek Pembayaran**: `3 Bills`
    * **Total Customer**: `42 Users`
  * Angka-angka statistik di atas bersifat statis (hardcoded di berkas HTML/Svelte) dan tidak terhubung ke API agregasi backend atau real-time database query.

## Navigation Integration
Rute `/dashboard/cs` terdaftar secara resmi di `apps/src/lib/config/navigation.ts` di bawah role `CUSTOMER_SERVICE` dengan label `"CS Overview"`. Sidebar navigasi dashboard secara dinamis memuat item ini jika session role aktif pengguna adalah CS atau Admin.

## Integration & Next Feature Dependencies
Fitur F15 berperan sebagai hub/portal navigasi utama bagi peran CS ke fitur-fitur operasional spesifik lainnya:
* **F16 — CS Incoming Orders Handling** (`/dashboard/cs/orders`): Diakses via shortcut *Kelola Pesanan* untuk memproses pesanan masuk dan mengubah status pesanan.
* **F17 — CS Menu Management** (`/dashboard/cs/menu`): Diakses via shortcut *Posting Menu Harian* untuk mengelola menu live.
* **F18 — CS Package Management** (`/dashboard/cs/packages`): Diakses melalui menu sidebar navigasi untuk mengelola kategori layanan dan paket katering.
* **F19 — CS Customer Data Management** (`/dashboard/cs/customers`): Diakses via shortcut *Manajemen Pelanggan* untuk melihat data instansi dan akun personal customer.

## Gaps / Needs Functional Validation
* **Statis / Hardcoded Stats (Gap Utama)**: Statistik pesanan masuk, pekerjaan tertunda, tagihan perlu verifikasi, dan jumlah customer sepenuhnya berupa data tiruan statis. Halaman ini belum memiliki data aggregation layer yang melakukan query dinamis `COUNT` ke tabel database SQLite (`orders`, `order_payment_proofs`, `users`).
* **Static System Status**: Panel "Status Sistem" (Dapur Status, Logistik, Internal Note) berisikan tulisan statis dan belum terhubung ke sistem monitoring dapur riil atau backend operational memo engine.

## Do Not Touch Yet
* No implementation, modification, or refactoring in this audit-only task.
