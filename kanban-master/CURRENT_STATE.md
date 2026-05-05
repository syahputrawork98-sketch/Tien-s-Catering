# Current State

## Summary
Project **Tien's Catering** telah berhasil bermigrasi ke arsitektur repositori baru. Saat ini aplikasi berada dalam tahap **Frontend-First Prototype**, di mana seluruh antarmuka untuk semua role (Customer, CS, Admin) telah selesai dibangun menggunakan data simulasi (Mock Data).

## Repository Structure
- `apps/`: Aplikasi frontend utama berbasis SvelteKit 5.
- `kanban-master/`: Pusat dokumentasi dan tracking project (Baru).

## Frontend Status
- **Framework**: SvelteKit (Svelte 5 Runes).
- **Styling**: TailwindCSS dengan kustomisasi brand Tien's Catering.
- **Interactivity**: Hampir seluruh fitur UI sudah interaktif (Cart, Role Switching, Form Simulation).

## Public Area Status
- **Structure**: Multi-page Refactor (Home, Katalog, Paket, Tentang Kami, Kontak).
- **Home**: Sederhana (Full-screen Hero + 2 CTA Utama).
- **Navbar**: Dinamis dengan deteksi route untuk kontras optimal.
- **Cart & Checkout**: Flow lengkap terintegrasi secara global di seluruh halaman publik.
- **Auth UI**: Halaman Login dan Register tersedia secara UI-only.

## Customer/User Dashboard Status
- **Overview**: Ringkasan akun.
- **Orders**: Riwayat pesanan fungsional secara visual.
- **Addresses**: Manajemen alamat pengiriman (Tambah/Hapus/Default).
- **Profile**: Edit informasi profil simulasi.

## CS Dashboard Status
- **Orders Management**: Monitoring pesanan masuk dengan status operasional.
- **Menu Management**: Kontrol ketersediaan menu harian.
- **Customer Data**: Direktori pelanggan dan instansi.

## Admin Dashboard Status
- **Reports**: Analisa omzet dan performa penjualan mingguan.
- **Users Management**: Kontrol akun karyawan dan role.
- **System Settings**: Konfigurasi parameter bisnis.

## Data Status
- **Mock Data**: Digunakan untuk menampilkan list menu, pesanan, dan user.
- **Persistence**: Menggunakan `localStorage` untuk session dan `sessionStorage` untuk data order sesaat.

## Auth Status
- **Mode**: Client-side Mock Session.
- **Security**: Tidak ada proteksi server. Seluruh pengecekan role dilakukan di `src/lib/stores/mockSession.svelte.ts`.

## Backend Status
- **Status**: **NOT STARTED**.
- **Database**: Belum ada (Drizzle/Postgres belum diinstal).
- **API**: Belum ada endpoint server.

## Validation Status
- **Build**: Berhasil (Laporan Tahap 2J).
- **Type Check**: Berhasil (0 errors).

## Important Decisions
1. Backend lama tidak akan dipakai sama sekali untuk menghindari "technical debt".
2. UI-only prototype digunakan untuk memvalidasi alur bisnis sebelum coding backend dimulai.
3. Struktur dashboard disatukan (Unified Layout) untuk efisiensi maintenance.

## Next Recommended Phase
Melakukan desain skema database (ERD) berdasarkan data mock yang sudah digunakan di frontend, diikuti dengan implementasi Auth.js.
